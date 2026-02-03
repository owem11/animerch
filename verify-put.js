
async function verifyPut() {
    console.log("Verifying Product Update...");

    // 1. Login
    const loginRes = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@animerch.com", password: "admin" })
    });

    if (!loginRes.ok) {
        console.error("Login failed");
        process.exit(1);
    }

    const { token } = await loginRes.json();
    console.log("Logged in.");

    // 2. Update Product 1
    const updateRes = await fetch("http://localhost:3001/api/admin/products/1", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sellingPrice: "99.99", costPrice: "50.00" })
    });

    if (!updateRes.ok) {
        console.error("Update failed:", await updateRes.text());
        process.exit(1);
    }
    console.log("Update successful.");

    // 3. Verify
    const getRes = await fetch("http://localhost:3001/api/products/1");
    const product = await getRes.json();

    console.log("Updated Product:", {
        title: product.title,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice
    });

    if (Number(product.sellingPrice) === 99.99 && Number(product.costPrice) === 50.00) {
        console.log("VERIFICATION PASSED");
    } else {
        console.error("VERIFICATION FAILED");
    }
}

verifyPut();
