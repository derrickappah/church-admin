'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found');
        return { error: 'Not authenticated' };
    }

    const full_name = formData.get('full_name');
    const position = formData.get('position');

    // 1. Update Profile (Name)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name })
        .eq('id', user.id);

    if (profileError) {
        console.error('Error updating profile:', profileError);
        return { error: profileError.message };
    }

    // 2. Update Employee record (Position)
    const { error: employeeError } = await supabase
        .from('employees')
        .update({ position })
        .eq('profile_id', user.id);

    if (employeeError) {
        console.error('Error updating employee record:', employeeError);
        return { error: employeeError.message };
    }

    revalidatePath('/employees');
    revalidatePath('/profile');
    redirect('/employees');
}
