
"use client";

import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
    id: number;
    quantity: number;
    product: {
        id: number;
        title: string;
        price: string;
        imageUrl: string;
    };
}

export default function CartPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                fetchCart();
            }
        }
    }, [user, authLoading, router]);

    const fetchCart = async () => {
        try {
            const res = await fetchApi("/api/cart");
            if (res.ok) {
                setItems(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (id: number) => {
        try {
            const res = await fetchApi(`/api/cart/${id}`, { method: "DELETE" });
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    const total = items.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);

    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-black uppercase mb-8">Shopping Cart</h1>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-lg mb-4">Your cart is empty.</p>
                    <Link href="/">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                                <div className="h-24 w-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                    <img src={item.product.imageUrl || "https://placehold.co/200"} className="object-cover w-full h-full" alt={item.product.title} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold line-clamp-2">{item.product.title}</h3>
                                        <p className="font-bold">${Number(item.product.price).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                                        <div className="flex items-center gap-3">
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="border rounded-lg p-6 bg-card sticky top-24">
                            <h2 className="text-lg font-bold mb-4 uppercase">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button className="w-full mt-6" size="lg">Checkout</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
