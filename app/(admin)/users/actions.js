'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId, newRole) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if current user is admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!['president', 'manager', 'it_staff'].includes(adminProfile?.role)) {
        throw new Error('Unauthorized: Only admins can update roles');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        console.error('Error updating role:', error);
        throw new Error(error.message);
    }

    revalidatePath('/users');
    return { success: true };
}

export async function updateUserDepartment(userId, departmentId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if current user is admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!['president', 'manager', 'it_staff'].includes(adminProfile?.role)) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ department_id: departmentId || null })
        .eq('id', userId);

    if (error) {
        console.error('Error updating department:', error);
        throw new Error(error.message);
    }

    revalidatePath('/users');
    return { success: true };
}
