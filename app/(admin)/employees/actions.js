'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createEmployee(formData) {
    console.log('--- Action: createEmployee ---');
    const supabase = await createClient();

    const full_name = formData.get('full_name');
    const email = formData.get('email');
    const role = formData.get('role');
    const department_id = formData.get('department_id');
    const position = formData.get('position');
    const date_joined = formData.get('date_joined');

    // 1. Create Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
            full_name,
            role,
            department_id
        })
        .select()
        .single();

    if (profileError) {
        console.error('Error creating profile for employee:', profileError);
        return { error: profileError.message };
    }

    console.log('Profile created:', profile.id);

    // 2. Create Employee record
    const { error: employeeError } = await supabase
        .from('employees')
        .insert({
            profile_id: profile.id, // Fixed: schema uses profile_id
            position,
            status: 'active',
            date_joined
        });

    if (employeeError) {
        console.error('Error creating employee record:', employeeError);
        return { error: employeeError.message };
    }

    console.log('Employee record created successfully!');
    redirect('/employees');
}
