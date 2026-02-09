import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import RequisitionClientPage from './client';

export default async function RequisitionPage({ params }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch requisition details
  const { data: requisition, error } = await supabase
    .from('requisitions')
    .select(`
      *,
      profiles:created_by (full_name, role)
    `)
    .eq('id', id)
    .single();

  if (error || !requisition) {
    notFound();
  }

  // Get current user details for permissions
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'staff';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile) userRole = profile.role;
  }

  return <RequisitionClientPage requisition={requisition} userRole={userRole} />;
}
