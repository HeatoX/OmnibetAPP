import { NextResponse } from 'next/server';
import { getRealMatches } from '@/lib/real-data-service';
import { sendMorningPixel, broadcastResultAlert } from '@/lib/telegram-service';
import { syncRecentResults } from '@/lib/history-tracker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'morning' | 'results'
    const secret = searchParams.get('secret');

    // Security Check
    if (secret !== process.env.TELEGRAM_BOT_TOKEN?.slice(0, 10)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🔔 Telegram Cron Triggered: ${type}`);

    try {
        // 1. Fetch ALL active subscribers from Supabase
        const { data: subscribers, error: subError } = await supabase
            .from('telegram_subscribers')
            .select('chat_id')
            .eq('status', 'active');

        if (subError || !subscribers) throw new Error('Could not fetch subscribers');
        const chatIds = subscribers.map(s => s.chat_id);

        if (type === 'morning') {
            const data = await getRealMatches();
            const allMatches = data.matches;

            // Filter HIGH CONFIDENCE picks for today
            const topMatches = allMatches.filter(m =>
                m.status?.state === 'pre' &&
                (m.prediction?.oracleConfidence >= 65)
            );

            await sendMorningPixel(topMatches, chatIds);
            return NextResponse.json({ success: true, message: 'Morning picks sent', count: topMatches.length });

        } else if (type === 'results') {
            // SYNC & NOTIFY: The Core of V28
            const sync = await syncRecentResults();

            if (sync.resolvedMatches && sync.resolvedMatches.length > 0) {
                console.log(`🚀 Broadcasting ${sync.resolvedMatches.length} newly resolved matches`);

                for (const item of sync.resolvedMatches) {
                    await broadcastResultAlert(item.match, item.prediction, chatIds);
                }

                return NextResponse.json({
                    success: true,
                    message: `Broadcasted ${sync.resolvedMatches.length} results`,
                    matches: sync.resolvedMatches.map(m => m.match.id)
                });
            }

            return NextResponse.json({ success: true, message: 'No new results to broadcast' });

        } else {
            return NextResponse.json({ error: 'Invalid type. Use morning or results' }, { status: 400 });
        }

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
