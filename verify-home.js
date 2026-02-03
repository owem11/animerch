// using native fetch

async function verifyHomepage() {
    const API_URL = 'http://localhost:3001/api/products';

    console.log('Checking Recommended (Sort by Rating)...');
    const recRes = await fetch(`${API_URL}?sort=rating&limit=4`);
    const recData = await recRes.json();
    console.log('Top Rated:', recData.data.map(p => `${p.title} (${p.rating})`));

    console.log('\nChecking Most Bought (Sort by Price)...');
    const buyRes = await fetch(`${API_URL}?sort=price_desc&limit=4`);
    const buyData = await buyRes.json();
    console.log('Most Expensive:', buyData.data.map(p => `${p.title} ($${p.price})`));
}

verifyHomepage();
