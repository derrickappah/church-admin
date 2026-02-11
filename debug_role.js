import { createClient } from './lib/supabase/server';

async function debugRole() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('No user logged in.');
        return;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    console.log('Current User ID:', user.id);
    console.log('Profile Data:', JSON.stringify(profile, null, 2));
}

debugRole().catch(console.error);
