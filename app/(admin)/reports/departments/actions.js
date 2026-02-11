'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createDepartmentReport(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found');
        return;
    }

    const month = parseInt(formData.get('month'));
    const year = parseInt(formData.get('year'));
    const department_id = formData.get('department_id');
    const summary = formData.get('summary');
    const financial_summary = formData.get('financial_summary');

    const { error } = await supabase
        .from('department_reports')
        .insert({
            month,
            year,
            department_id,
            summary,
            financial_summary,
            created_by: user.id,
            status: 'draft'
        });

    if (error) {
        console.error('Error creating department report:', error);
        return;
    }

    redirect('/reports/departments');
}
