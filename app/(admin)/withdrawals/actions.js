'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createWithdrawal(formData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No user found');
        return;
    }

    const requisition_id = formData.get('requisition_id');
    const amount = parseFloat(formData.get('amount'));
    const reference_number = `WDL-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(`Creating withdrawal for requisition ${requisition_id}`);

    const { error } = await supabase
        .from('withdrawal_forms')
        .insert({
            requisition_id,
            amount,
            reference_number,
            generated_by: user.id,
            generated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error creating withdrawal:', error);
        return;
    }

    redirect('/withdrawals');
}
