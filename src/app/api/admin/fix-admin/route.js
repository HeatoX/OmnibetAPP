import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-config';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const emailParam = searchParams.get('email');
        const targetEmails = emailParam ? [emailParam] : ['admin@omnibet.ai', 'kesp230590@gmail.com'];

        const results = [];

        for (const email of targetEmails) {
            // 1. Find the profile
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('id, email, subscription_tier')
                .eq('email', email)
                .single();

            if (fetchError) {
                results.push({ email, success: false, error: 'Profile not found' });
                continue;
            }

            // 2. Update to diamond tier
            const { data: updated, error: updateError } = await supabase
                .from('profiles')
                .update({ subscription_tier: 'diamond' })
                .eq('id', profile.id)
                .select();

            if (updateError) {
                results.push({ email, success: false, error: updateError.message });
            } else {
                results.push({
                    email,
                    success: true,
                    previous_tier: profile.subscription_tier,
                    new_tier: updated?.[0]?.subscription_tier
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
