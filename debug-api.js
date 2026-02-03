async function checkApi() {
    try {
        const res = await fetch('http://localhost:4001/api/admin/products');
        const data = await res.json();
        const first = data[0];
        console.log("Total products:", data.length);
        console.log("First Product Description:", first.description);
        console.log("First Product Sizes:", first.availableSizes);
        console.log("First Product Colors:", first.availableColors);
        console.log("Full First Item:", JSON.stringify(first, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkApi();
