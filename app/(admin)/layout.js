import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PortalLayoutClient from '@/components/PortalLayoutClient';

export default async function PortalLayout({ children }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

    let userInitials = 'U';
    let userName = 'User';

    if (profile?.full_name) {
        userName = profile.full_name;
        const nameParts = profile.full_name.trim().split(' ');
        if (nameParts.length >= 2) {
            userInitials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
        } else if (nameParts.length === 1) {
            userInitials = nameParts[0].substring(0, 2);
        }
        userInitials = userInitials.toUpperCase();
    }

    return (
        <PortalLayoutClient
            profile={profile}
            userInitials={userInitials}
            userName={userName}
        >
            {children}
        </PortalLayoutClient>
    );
}
