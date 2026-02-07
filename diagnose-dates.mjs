
import { getRealMatches } from './src/lib/real-data-service.js';

async function diagnose() {
    try {
        console.log("Starting diagnosis...");
        const data = await getRealMatches();
        console.log(`Total matches: ${data.matches.length}`);

        const basketball = data.matches.filter(m => m.sport === 'basketball' || m.league?.includes('NBA'));
        console.log(`\nBasketball matches (${basketball.length}):`);
        basketball.forEach(m => {
            console.log(`- ${m.home.name} vs ${m.away.name}`);
            console.log(`  Date: ${m.startDate}`);
            console.log(`  State: ${m.status}`);
            console.log(`  RelativeDate: ${m.relativeDate}`);
            console.log(`  isLive: ${m.isLive}, isFinished: ${m.isFinished}, isToday: ${m.isToday}`);
        });

        const hoy = data.matches.filter(m => m.relativeDate === 'Hoy');
        console.log(`\nMatches marked as 'Hoy': ${hoy.length}`);

        const manana = data.matches.filter(m => m.relativeDate === 'Mañana');
        console.log(`Matches marked as 'Mañana': ${manana.length}`);

    } catch (e) {
        console.error("Diagnosis failed:", e);
    }
}

diagnose();
