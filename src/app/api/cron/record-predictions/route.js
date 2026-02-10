import { NextResponse } from 'next/server';
import { getRealMatches } from '@/lib/real-data-service';
import { analyzeMatchDeep } from '@/lib/prediction-oracle';
import { recordPrediction } from '@/lib/history-tracker';
import { broadcastDiamondAlert } from '@/lib/telegram-service';

export const dynamic = 'force-dynamic';

/**
 * CRON JOB: Record Predictions
 * Analyzes upcoming games (next 24h) and saves high-confidence predictions to DB.
 * Also broadcasts Gold/Diamond picks to Telegram.
 * URL: /api/cron/record-predictions
 */
export async function GET(request) {
    try {
        console.log('🔮 Starting Oracle Auto-Prediction Job...');

        // 1. Get ALL upcoming matches
        const realData = await getRealMatches();
        let matches = realData.matches || [];

        // Filter: Only upcoming matches starting in the next 24 hours
        const now = new Date();
        const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        matches = matches.filter(m => {
            if (m.status !== 'upcoming') return false;
            const start = new Date(m.startDate);
            return start > now && start < next24h;
        });

        console.log(`🔍 Analyzing ${matches.length} upcoming matches for the next 24h...`);

        let recordedCount = 0;
        let analyzedCount = 0;
        let broadcastCount = 0;

        // 2. Analyze each match in batches
        const BATCH_SIZE = 5;
        for (let i = 0; i < matches.length; i += BATCH_SIZE) {
            const batch = matches.slice(i, i + BATCH_SIZE);

            await Promise.all(batch.map(async (match) => {
                try {
                    const analyzed = await analyzeMatchDeep(match);
                    analyzedCount++;

                    // Only record High Confidence (Gold/Diamond) or High Probability (>60%)
                    if (analyzed.prediction.maxProb >= 60 || analyzed.prediction.confidence !== 'silver') {
                        const saved = await recordPrediction(match, analyzed.prediction);

                        if (saved) {
                            const isNew = saved.isNew;
                            recordedCount++;

                            // Telegram broadcast for new Gold/Diamond picks
                            if (isNew && analyzed.prediction.confidence !== 'silver') {
                                try {
                                    const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_MAIN_CHANNEL;
                                    if (mainChannelId) {
                                        await broadcastDiamondAlert({
                                            ...match,
                                            prediction: analyzed.prediction
                                        }, [mainChannelId]);
                                        broadcastCount++;
                                    }
                                } catch (err) {
                                    console.error('Failed to broadcast to Telegram:', err);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error analyzing match ${match.id}:`, e.message);
                }
            }));
        }

        return NextResponse.json({
            success: true,
            analyzed: analyzedCount,
            recorded: recordedCount,
            broadcasted: broadcastCount,
            message: `Oracle analyzed ${analyzedCount} matches, recorded ${recordedCount}, broadcast ${broadcastCount} to Telegram.`
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
