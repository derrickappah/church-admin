'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createFinancialReport(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found during financial report creation');
        return;
    }

    const month = parseInt(formData.get('month'));
    const year = parseInt(formData.get('year'));
    const content = formData.get('content');

    console.log(`Creating financial report for ${month}/${year}`);

    const { error } = await supabase
        .from('financial_reports')
        .insert({
            month,
            year,
            content,
            created_by: user.id,
            status: 'draft'
        });

    if (error) {
        console.error('Error creating financial report:', error);
        return;
    }

    redirect('/reports/financial');
}
