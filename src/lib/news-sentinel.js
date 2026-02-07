import { newsApi } from './api-services.js';

/**
 * News Sentinel Agent 📰
 * "The Intel Officer"
 * USES REAL DATA ONLY. No Simulations.
 */
export async function analyzeNewsSentiment(teamName, sport = 'football') {
    let report = {
        scoreModifier: 0,
        headlines: [],
        sentiment: 'neutral', // 'positive', 'negative', 'neutral'
        criticalNews: false
    };

    if (!teamName) return report;

    try {
        // 1. Fetch real news from NewsAPI
        const newsData = await newsApi.getSportsNews(`${teamName} ${sport}`, 5);

        if (newsData && newsData.articles && newsData.articles.length > 0) {
            const articles = newsData.articles;

            // Critical Keywords
            const negativeKeywords = ['lesión', 'baja', 'crisis', 'derrota', 'duda', 'sanción', 'ausencia', 'baixa', 'injured', 'miss', 'out'];
            const positiveKeywords = ['victoria', 'imparable', 'refuerzo', 'recupera', 'favorito', 'goleada', 'fichaje', 'recovering', 'fit', 'ready'];

            articles.forEach(article => {
                const text = (article.title + ' ' + (article.description || '')).toLowerCase();

                // Check for negative impact
                const hasNegative = negativeKeywords.some(word => text.includes(word));
                const hasPositive = positiveKeywords.some(word => text.includes(word));

                if (hasNegative) {
                    report.headlines.push(`⚠️ ${article.title}`);
                    report.scoreModifier -= 3;
                    report.criticalNews = true;
                } else if (hasPositive) {
                    report.headlines.push(`🚀 ${article.title}`);
                    report.scoreModifier += 2;
                }
            });

            // Normalize sentiment and modifier
            if (report.scoreModifier < -5) {
                report.sentiment = 'negative';
                report.scoreModifier = -5; // Cap impact
            } else if (report.scoreModifier > 5) {
                report.sentiment = 'positive';
                report.scoreModifier = 5;
            } else if (report.scoreModifier !== 0) {
                report.sentiment = report.scoreModifier > 0 ? 'positive' : 'negative';
            }
        }
    } catch (error) {
        console.error(`Sentinel Error [${teamName}]:`, error);
    }

    return report;
}
