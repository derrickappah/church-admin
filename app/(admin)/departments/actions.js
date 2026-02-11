'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createDepartment(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found in createDepartment');
        return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    console.log('User ID:', user.id);
    console.log('User Role from profiles:', profile?.role);

    const name = formData.get('name');
    console.log('Department Name to insert:', name);

    if (!name) return { error: 'Name is required' };

    const { error } = await supabase
        .from('departments')
        .insert({ name });

    if (error) {
        console.error('Error creating department:', error);
        return { error: error.message };
    }

    console.log('Department created successfully!');
    revalidatePath('/departments');
    redirect('/departments');
}

export async function updateDepartment(id, name) {
    const supabase = await createClient();

    if (!name) return { error: 'Name is required' };

    const { error } = await supabase
        .from('departments')
        .update({ name })
        .eq('id', id);

    if (error) {
        console.error('Error updating department:', error);
        return { error: error.message };
    }

    revalidatePath('/departments');
    return { success: true };
}

export async function deleteDepartment(id) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting department:', error);
        return { error: error.message };
    }

    revalidatePath('/departments');
    redirect('/departments');
}
