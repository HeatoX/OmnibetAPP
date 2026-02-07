
async function debugHeader() {
    // Union vs Frankfurt, querying via WRONG slug (esp.1)
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/summary?event=746900`;
    const res = await fetch(url);
    const data = await res.json();

    const slug = data.header?.league?.slug;
    const compSlug = data.header?.competitions?.[0]?.league?.slug;

    console.log(`Summary via esp.1 -> Header Slug: ${slug}`);
    console.log(`Summary via esp.1 -> Comp Slug: ${compSlug}`);
}

debugHeader();
