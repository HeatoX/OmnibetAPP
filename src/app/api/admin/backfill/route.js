import { NextResponse } from 'next/server';
import { backfillHistory } from '@/lib/history-tracker';

export const dynamic = 'force-dynamic';

/**
 * ADMIN: Backfill History
 * Generates prediction history for past games to populate empty DB.
 * Call once: /api/admin/backfill
 */
export async function GET(request) {
    try {
        // 3 days lookback, max 50 matches per run
        const result = await backfillHistory(3, 50);

        return NextResponse.json({
            success: true,
            backfilled: result?.backfilled || 0,
            details: result,
            message: `Backfill completed. Found ${result?.matchesFound || 0} matches, Recorded ${result?.backfilled || 0}.`
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
