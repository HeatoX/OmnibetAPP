import { NextResponse } from 'next/server';
import { resolvePendingPredictions } from '@/lib/history-tracker';

export const dynamic = 'force-dynamic';

/**
 * CRON JOB: Update History
 * Resolves PENDING predictions with actual match results from ESPN.
 * Call periodically: /api/cron/update-history
 */
export async function GET(request) {
    try {
        console.log('⚖️ Starting History Resolution Job...');
        const result = await resolvePendingPredictions();

        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            resolved: result.resolved,
            remaining: (result.totalPending || 0) - (result.resolved || 0),
            message: result.message
        });

    } catch (error) {
        console.error('Resolution job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
