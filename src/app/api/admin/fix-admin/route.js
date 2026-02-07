import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-config';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const adminEmail = 'admin@omnibet.ai';

        // 1. Find the profile for the admin email
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, email, subscription_tier')
            .eq('email', adminEmail)
            .single();

        if (fetchError) {
            return NextResponse.json({
                success: false,
                error: `Profile for ${adminEmail} not found: ${fetchError.message}`
            }, { status: 404 });
        }

        // 2. Update to diamond tier
        const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: 'diamond'
            })
            .eq('id', profile.id)
            .select();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            message: `User ${adminEmail} updated to diamond tier.`,
            previous_tier: profile.subscription_tier,
            updated_profile: updated?.[0]
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
