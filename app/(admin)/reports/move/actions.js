'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createMoveReport(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found during move report creation');
        return;
    }

    const month = parseInt(formData.get('month'));
    const year = parseInt(formData.get('year'));
    const content = formData.get('content');

    console.log(`Creating move report for ${month}/${year}`);

    const { error } = await supabase
        .from('move_reports')
        .insert({
            month,
            year,
            content,
            created_by: user.id,
            status: 'draft'
        });

    if (error) {
        console.error('Error creating move report:', error);
        return;
    }

    redirect('/reports/move');
}
