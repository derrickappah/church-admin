'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createMissionReport(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found during report creation');
        return { error: 'Authentication required' };
    }

    const month = parseInt(formData.get('month'));
    const year = parseInt(formData.get('year'));
    const content = formData.get('content');

    console.log(`Creating mission report for ${month}/${year}`);

    const { error } = await supabase
        .from('missions_reports')
        .insert({
            month,
            year,
            content,
            created_by: user.id,
            status: 'draft'
        });

    if (error) {
        console.error('Error creating mission report:', error);
        return { error: error.message };
    }

    redirect('/reports/missions');
}
