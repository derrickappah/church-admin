'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateWithdrawalPDFBuffer } from '@/lib/pdf-utils'

export async function createRequisition(formData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const title = formData.get('title')
    const purpose = formData.get('purpose')
    const amount = formData.get('amount')

    const { data, error } = await supabase
        .from('requisitions')
        .insert({
            title,
            purpose,
            amount: parseFloat(amount),
            created_by: user.id,
            status: 'submitted'
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/requisitions')
    redirect(`/requisitions/${data.id}`)
}

export async function approveRequisition(id) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Update status (triggers withdrawal_forms creation in DB)
    const { error } = await supabase
        .from('requisitions')
        .update({
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) throw new Error(error.message)

    // 2. Fetch the newly created withdrawal form
    const { data: form, error: formError } = await supabase
        .from('withdrawal_forms')
        .select(`
            *,
            requisitions (title, profiles:created_by (full_name)),
            generator:generated_by (full_name)
        `)
        .eq('requisition_id', id)
        .single()

    if (form && !formError) {
        try {
            // 3. Generate PDF Buffer
            const buffer = await generateWithdrawalPDFBuffer(form)

            // 4. Upload to Storage
            const fileName = `${form.reference_number}.pdf`
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('forms')
                .upload(fileName, buffer, {
                    contentType: 'application/pdf',
                    upsert: true
                })

            if (!uploadError) {
                // 5. Update record with PDF URL
                const { data: { publicUrl } } = supabase.storage.from('forms').getPublicUrl(fileName)
                await supabase
                    .from('withdrawal_forms')
                    .update({ pdf_url: publicUrl })
                    .eq('id', form.id)
            }
        } catch (err) {
            console.error('Error generating/uploading PDF:', err)
        }
    }

    revalidatePath(`/requisitions/${id}`)
    revalidatePath('/dashboard')
    revalidatePath('/withdrawals')
}

export async function rejectRequisition(id, reason = 'Not specified') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('requisitions')
        .update({
            status: 'rejected',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            rejection_reason: reason
        })
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath(`/requisitions/${id}`)
    revalidatePath('/dashboard')
}
