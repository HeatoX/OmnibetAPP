const { getRealMatches } = require('./src/lib/real-data-service');

async function runAudit() {
    console.log("🔍 INICIANDO AUDITORÍA DE PREDICCIONES...");
    try {
        const data = await getRealMatches();
        const upcoming = data.matches.filter(m => m.status === 'upcoming');

        console.log(`📊 Partidos analizados: ${upcoming.length}`);

        upcoming.forEach(m => {
            const p = m.prediction;
            const margin = Math.abs(p.homeWinProb - p.awayWinProb);
            const is5050 = p.homeWinProb === 50 && p.awayWinProb === 50;
            const isTight = margin <= 5;

            if (is5050 || isTight) {
                console.log(`[${is5050 ? '‼️ 50/50' : '⚠️ AJUSTADO'}] ${m.home.name} vs ${m.away.name}`);
                console.log(`   - Prob: ${p.homeWinProb}% | ${p.drawProb}% | ${p.awayWinProb}%`);
                console.log(`   - Winner: ${p.winner} | Margin: ${margin}%`);
                console.log(`   - Text: ${p.text}`);
                console.log(`   - Oracle Max: ${p.maxProb}%`);
                console.log("------------------------------------------");
            }
        });

        const tightCount = upcoming.filter(m => Math.abs(m.prediction.homeWinProb - m.prediction.awayWinProb) <= 5).length;
        console.log(`\n📈 RESUMEN:`);
        console.log(`   - Total Próximos: ${upcoming.length}`);
        console.log(`   - Partidos Estrechos (<=5%): ${tightCount} (${((tightCount / upcoming.length) * 100).toFixed(1)}%)`);

    } catch (e) {
        console.error("❌ ERROR EN AUDITORÍA:", e);
    }
}

runAudit();
