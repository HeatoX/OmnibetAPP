
async function debugIds() {
    const matchId = '746900';
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/summary?event=${matchId}`;
    const res = await fetch(url);
    const data = await res.json();

    const homeComp = data.header.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayComp = data.header.competitions[0].competitors.find(c => c.homeAway === 'away');

    console.log(`🏠 Header Home ID: '${homeComp.team.id}' (${typeof homeComp.team.id})`);
    console.log(`🚗 Header Away ID: '${awayComp.team.id}' (${typeof awayComp.team.id})`);

    const form = data.boxscore.form;
    form.forEach((f, i) => {
        console.log(`📄 Form[${i}] Team ID: '${f.team.id}' (${typeof f.team.id}) - Events: ${f.events?.length}`);
    });

    const homeForm = form.find(f => f.team?.id === homeComp.team.id);
    console.log(`✅ IDs Match? ${!!homeForm}`);
}

debugIds();
