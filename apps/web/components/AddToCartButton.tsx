
"use client";

import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";

export function AddToCartButton({ productId }: { productId: number }) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/login?redirect=/product/" + productId);
            return;
        }

        setLoading(true);
        try {
            const res = await fetchApi("/api/cart", {
                method: "POST",
                body: JSON.stringify({ productId, quantity: 1 }),
            });

            if (res.ok) {
                router.push("/cart");
            } else {
                alert("Failed to add to cart");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            Add to Cart
        </Button>
    );
}
