'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveRequisition(id) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check permissions (must be president, manager, or it_staff)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['president', 'manager', 'it_staff']
  if (!allowedRoles.includes(profile?.role)) {
    throw new Error('Insufficient permissions')
  }

  // Update status
  const { error } = await supabase
    .from('requisitions')
    .update({ 
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Generate Withdrawal Form Entry
  // Logic: Create a withdrawal form record linked to this requisition
  const { error: formError } = await supabase
    .from('withdrawal_forms')
    .insert({
      requisition_id: id,
      reference_number: `WD-${id.slice(0,8)}-${new Date().getFullYear()}`, // Simple ref gen
      amount: (await supabase.from('requisitions').select('amount').eq('id', id).single()).data.amount,
      generated_by: user.id
    })
  
  if (formError) console.error('Failed to create withdrawal form record:', formError)

  revalidatePath(`/dashboard/requisitions/${id}`)
  revalidatePath('/dashboard/requisitions')
}

export async function rejectRequisition(id) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['president', 'manager', 'it_staff']
  if (!allowedRoles.includes(profile?.role)) {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase
    .from('requisitions')
    .update({ 
      status: 'rejected',
      approved_by: user.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/requisitions/${id}`)
  revalidatePath('/dashboard/requisitions')
}
