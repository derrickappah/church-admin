import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjvhrgnavszgchsktvtg.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdmhyZ25hdnN6Z2Noc2t0dnRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY1NTM4MCwiZXhwIjoyMDg2MjMxMzgwfQ.G4-HzfD6yklWQyFieFeXnLuqezfyWVBxRkvW3Ummg2M';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRequisition() {
    const id = '58461f03-fbb8-4fc7-bbb9-7ff7ec7a45e0';

    console.log(`Checking requisition with ID: ${id}`);

    const { data: requisition, error } = await supabase
        .from('requisitions')
        .select(`
            *,
            profiles:created_by (full_name, role)
        `)
        .eq('id', id);

    if (error) {
        console.error('Error fetching requisition:', error);
    } else {
        console.log('Requisition found:', JSON.stringify(requisition, null, 2));
    }
}

checkRequisition();
