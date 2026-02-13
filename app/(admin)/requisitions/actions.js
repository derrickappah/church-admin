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
    // 2. Fetch the newly created withdrawal form without complex joins
    const { data: form, error: formError } = await supabase
        .from('withdrawal_forms')
        .select('*')
        .eq('requisition_id', id)
        .single()

    if (form && !formError) {
        try {
            // Manually fetch related data needed for PDF
            const { data: requisition } = await supabase
                .from('requisitions')
                .select('title, created_by')
                .eq('id', id)
                .single();

            let creatorName = 'Unknown';
            if (requisition?.created_by) {
                const { data: creator } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', requisition.created_by)
                    .single();
                creatorName = creator?.full_name || 'Unknown';
            }

            let generatorName = 'Unknown';
            if (form.generated_by) {
                const { data: generator } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', form.generated_by)
                    .single();
                generatorName = generator?.full_name || 'Unknown';
            }

            // Construct the object structure expected by generateWithdrawalPDFBuffer
            const flowForm = {
                ...form,
                requisitions: {
                    title: requisition?.title,
                    profiles: { full_name: creatorName }
                },
                generator: { full_name: generatorName }
            };

            // 3. Generate PDF Buffer
            const buffer = await generateWithdrawalPDFBuffer(flowForm)

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
