import { NextResponse } from 'next/server';
import { resolvePendingPredictions } from '@/lib/history-tracker';
import { getFinishedMatches } from '@/lib/real-data-service';
import { trainEloSystem } from '@/lib/elo-engine';

export const dynamic = 'force-dynamic';

/**
 * CRON JOB: Update History + Train Oracle
 * 1. Resolves PENDING predictions with actual match results from ESPN.
 * 2. Feeds finished matches into ELO engine so the Oracle learns and improves.
 * Call periodically: /api/cron/update-history
 */
export async function GET(request) {
    try {
        console.log('⚖️ Starting History Resolution + Oracle Training Job...');

        // 1. Resolve pending predictions
        const result = await resolvePendingPredictions();

        // 2. Train the Oracle with recent finished matches
        let trained = 0;
        try {
            const finishedMatches = await getFinishedMatches(48);
            if (finishedMatches.length > 0) {
                // Format matches for ELO training
                const trainingData = finishedMatches
                    .filter(m => m.home?.score !== undefined && m.away?.score !== undefined)
                    .map(m => ({
                        home: { id: m.home?.id || m.home?.name },
                        away: { id: m.away?.id || m.away?.name },
                        score: `${m.home?.score || 0}-${m.away?.score || 0}`,
                        date: m.startDate || m.date
                    }));

                trainEloSystem(trainingData);
                trained = trainingData.length;
                console.log(`🧠 Oracle trained on ${trained} matches.`);
            }
        } catch (trainError) {
            console.error('ELO training error (non-fatal):', trainError.message);
        }

        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            resolved: result.resolved,
            remaining: (result.totalPending || 0) - (result.resolved || 0),
            trained,
            message: `${result.message}. Oracle trained on ${trained} matches.`
        });

    } catch (error) {
        console.error('Resolution job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
