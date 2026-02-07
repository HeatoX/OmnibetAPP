import { NextResponse } from 'next/server';
import { getRecentPredictions } from '@/lib/history-tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Auditing History Bridge...");
        const history = await getRecentPredictions(50);

        const resolved = history.filter(h => h.status !== 'pending');
        const pending = history.filter(h => h.status === 'pending');
        const wins = resolved.filter(h => h.status === 'won').length;

        return NextResponse.json({
            totalCount: history.length,
            resolvedCount: resolved.length,
            pendingCount: pending.length,
            wins,
            accuracy: resolved.length > 0 ? (wins / resolved.length * 100).toFixed(1) + '%' : '0%',
            sampleHistory: history.slice(0, 3),
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
