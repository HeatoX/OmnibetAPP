/**
 * Telegram Bot Service
 * Send push notifications for high-confidence predictions
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to a specific chat
 * @param {string} chatId - Telegram chat ID
 * @param {string} text - Message text (supports Markdown)
 * @param {object} options - Additional options
 */
export async function sendMessage(chatId, text, options = {}) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN not configured');
        return null;
    }

    try {
        const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                ...options
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data.description);
            return null;
        }

        return data.result;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return null;
    }
}

/**
 * Format a match alert for Telegram
 */
export function formatMatchAlert(match) {
    const confidence = match.prediction?.oracleConfidence ||
        Math.max(match.prediction?.homeWinProb || 0, match.prediction?.awayWinProb || 0);

    const tier = confidence >= 75 ? '💎 DIAMANTE' : confidence >= 65 ? '🥇 ORO' : '🥈 PLATA';

    return `
🚨 *ALERTA DE PREDICCIÓN ${tier}*

${match.sportIcon} *${match.home?.name}* vs *${match.away?.name}*
🏆 ${match.league}
🕐 ${match.startTime}

📊 *Predicción:* ${match.prediction?.text}
📈 *Confianza:* ${confidence}%
${match.odds?.home ? `💰 *Cuota:* ${match.odds.home}` : ''}

🤖 _Generado por OmniBet AI_
🔗 [Ver Análisis Completo](https://omnibet.ai/app)
    `.trim();
}

/**
 * Send alert for a Diamond prediction
 * @param {object} match - Match data with prediction
 * @param {Array<string>} subscriberChatIds - List of chat IDs to notify
 */
export async function broadcastDiamondAlert(match, subscriberChatIds = []) {
    const message = formatMatchAlert(match);
    const results = [];

    for (const chatId of subscriberChatIds) {
        const result = await sendMessage(chatId, message);
        results.push({ chatId, success: !!result });

        // Rate limiting: Telegram allows ~30 messages/second
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
}

/**
 * Send "Banker of the Day" special alert
 */
export async function sendBankerAlert(match, subscriberChatIds = [], streak = 5, accuracy = 85) {
    const confidence = match.prediction?.oracleConfidence ||
        Math.max(match.prediction?.homeWinProb || 0, match.prediction?.awayWinProb || 0);

    const message = `
🔥🔥🔥 *BANKER DEL DÍA* 🔥🔥🔥

La apuesta más segura de las próximas 24 horas:

${match.sportIcon} *${match.home?.name}* vs *${match.away?.name}*
🏆 ${match.league}
🕐 ${match.startTime}

🎯 *Predicción:* ${match.prediction?.text}
📈 *Confianza:* ${confidence}%

⚡ Historial: ${streak} aciertos consecutivos
📊 Precisión histórica: ${accuracy}%

_No te lo pierdas!_

🔗 [Ver Análisis Profundo](https://omnibet.ai/app)
    `.trim();

    for (const chatId of subscriberChatIds) {
        await sendMessage(chatId, message);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

/**
 * Send welcome message to new subscribers
 */
export async function sendWelcomeMessage(chatId, username) {
    const message = `
👋 ¡Bienvenido a *OmniBet AI*, ${username || 'amigo'}!

Has activado las alertas de predicciones. Recibirás:

💎 Alertas de predicciones Diamante (confianza 75%+)
🔥 El "Banker del Día" - nuestra apuesta más segura
📊 Resumen diario de rendimiento

*Comandos disponibles:*
/status - Ver tu estado de suscripción
/pause - Pausar alertas temporalmente
/resume - Reanudar alertas
/settings - Configurar preferencias

🎰 ¡Buena suerte!
    `.trim();

    return sendMessage(chatId, message);
}

/**
 * Send daily summary
 */
export async function sendDailySummary(chatId, stats) {
    const message = `
📊 *RESUMEN DEL DÍA*

✅ Aciertos: ${stats.wins}
❌ Fallos: ${stats.losses}
📈 ROI: ${stats.roi > 0 ? '+' : ''}${stats.roi}%

*Mejores predicciones:*
${stats.topPredictions?.map((p, i) => `${i + 1}. ${p.match} ✅`).join('\n') || 'Sin datos'}

_Mañana te traemos más predicciones ganadoras!_
    `.trim();

    return sendMessage(chatId, message);
}

/**
 * Send Morning Pixel (Daily Picks Summary)
 * Sends a consolidated list of today's best predictions
 */
export async function sendMorningPixel(matches, subscriberChatIds = []) {
    if (!matches || matches.length === 0) return;

    // Filter top picks (e.g., higher confidence or just the best ones)
    const topPicks = matches
        .sort((a, b) => (b.prediction?.oracleConfidence || 0) - (a.prediction?.oracleConfidence || 0))
        .slice(0, 10); // Top 10

    const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    let message = `
🔥 *JUEGOS DE HOY (${dateStr})* 🔥

Aquí tienes los mejores análisis del día:

`.trim();

    topPicks.forEach(m => {
        const confidence = m.prediction?.oracleConfidence || 0;
        const icon = confidence >= 75 ? '💎' : confidence >= 65 ? '🥇' : '🥈';
        const homeName = m.home.name || m.home.displayName || 'Home';
        const awayName = m.away.name || m.away.displayName || 'Away';
        const predText = m.prediction.text || 'Sin predicción';

        message += `\n${icon} *${homeName}* vs *${awayName}*\n`;
        message += `   👉 ${predText} (${confidence}%)\n`;
        message += `   ⏰ ${m.startTime || 'TBD'}\n`;
    });

    message += `\n👉 [Ver todos los detalles en la App](https://omnibet.ai)\n`;
    message += `⚡ _Generado por OmniBet AI_`;

    console.log(`📨 Sending Morning Pixel to ${subscriberChatIds.length} chats`);

    for (const chatId of subscriberChatIds) {
        await sendMessage(chatId, message);
        await new Promise(r => setTimeout(r, 100)); // Rate limit
    }
}

/**
 * Format a single result with hit/miss indicator
 */
export function formatSingleResult(match, prediction) {
    const homeName = match.home.name || 'Home';
    const awayName = match.away.name || 'Away';
    const homeScore = match.home.score;
    const awayScore = match.away.score;

    // Determine winner
    let actualWinner = 'draw';
    if (homeScore > awayScore) actualWinner = 'home';
    else if (awayScore > homeScore) actualWinner = 'away';

    const isHit = prediction.predicted_winner === actualWinner;
    const statusIcon = isHit ? '✅ *¡ACIENRTO!*' : '❌ *FALLO*';
    const resultIcon = isHit ? '💰' : '📉';

    return `
${resultIcon} *RESULTADO FINAL* ${resultIcon}

⚽ *${homeName}* ${homeScore} - ${awayScore} *${awayName}*

🎯 *Predicción:* ${prediction.prediction_text || 'N/A'}
${statusIcon}

🤖 _OmniBet AI Oracle_
    `.trim();
}

/**
 * Send individual match result alert
 */
export async function broadcastResultAlert(match, prediction, subscriberChatIds = []) {
    const message = formatSingleResult(match, prediction);
    for (const chatId of subscriberChatIds) {
        await sendMessage(chatId, message);
        await new Promise(r => setTimeout(r, 100));
    }
}

/**
 * Send Evening Results (Daily Recap)
 */
export async function sendEveningResults(finishedMatches, subscriberChatIds = []) {
    if (!finishedMatches || finishedMatches.length === 0) return;

    const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    let message = `📊 *RESUMEN DE LA JORNADA (${dateStr})* 📊\n\n`;

    finishedMatches.forEach(m => {
        const isHit = m.status === 'won';
        const icon = isHit ? '✅' : '❌';
        message += `${icon} *${m.home_team}* ${m.final_score?.home}-${m.final_score?.away} *${m.away_team}*\n`;
        message += `   _Pred: ${m.prediction_text}_\n\n`;
    });

    message += `🤖 _OmniBet AI_`;

    for (const chatId of subscriberChatIds) {
        await sendMessage(chatId, message);
        await new Promise(r => setTimeout(r, 100));
    }
}
