
const fs = require('fs');

async function debugFormFallback() {
    // Lorient ID: 273 (from previous debug)
    const teamId = '273';
    const sport = 'soccer';
    const matchLeagueSlug = 'fra.coupe_de_france'; // As per match

    console.log(`Debugging Form Fallback for Lorient (${teamId}) in ${matchLeagueSlug}...`);

    // EXACT LOGIC FROM real-data-service.js
    const strategies = [
        matchLeagueSlug,
        ...(matchLeagueSlug.includes('.') ? [`${matchLeagueSlug.split('.')[0]}.1`, `${matchLeagueSlug.split('.')[0]}.2`] : [])
    ];
    const uniqueStrats = [...new Set(strategies)];

    console.log("Strategies:", uniqueStrats);

    for (const slug of uniqueStrats) {
        try {
            console.log(`\n--- Testing Slug: ${slug} ---`);
            const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${slug}/teams/${teamId}/schedule`;
            console.log("URL:", url);

            const res = await fetch(url);
            console.log("Status:", res.status);

            if (res.ok) {
                const sData = await res.json();
                const events = sData.events || [];
                console.log(`Total Events Found: ${events.length}`);

                // Inspect first event
                if (events.length > 0) {
                    const e = events[0];
                    console.log("Sample Event 0:", JSON.stringify(e.competitions?.[0]?.status, null, 2));
                }

                const completed = events.filter(e => e.competitions?.[0]?.status?.type?.completed);
                console.log(`Completed Events: ${completed.length}`);

                if (completed.length > 0) {
                    const mapped = completed.reverse().slice(0, 5).map(e => {
                        const c = e.competitions[0];
                        const isHome = c.competitors[0].team.id === teamId;
                        const outcome = isHome ? c.competitors[0].winner : c.competitors[1].winner;
                        const teamScore = isHome ? c.competitors[0].score?.value : c.competitors[1].score?.value;
                        const oppScore = isHome ? c.competitors[1].score?.value : c.competitors[0].score?.value;

                        return {
                            date: e.date,
                            score: `${teamScore}-${oppScore}`,
                        };
                    });
                    console.log("Mapped Result:", mapped);
                    return; // Success simulation
                } else {
                    console.log("No completed events found in this slug.");
                }
            } else {
                console.log("Fetch failed.");
            }
        } catch (e) {
            console.error("Error:", e);
        }
    }
    console.log("\n❌ Fallback failed completely.");
}

debugFormFallback();
