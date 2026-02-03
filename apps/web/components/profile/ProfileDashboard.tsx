"use client";

import { Button } from "@/components/ui/button";
import { Edit, Package, MapPin, Mail, Phone, Calendar, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ProductItemCard } from "@/components/ProductItemCard";

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: string;
    productTitle: string;
    productImage: string;
}

interface Order {
    id: number;
    total: string;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface ProfileDashboardProps {
    user: any;
    onEdit: () => void;
}

export function ProfileDashboard({ user, onEdit }: ProfileDashboardProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState<Record<number, number>>({}); // productId -> rating
    const [submittingRating, setSubmittingRating] = useState<number | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetchApi("/api/orders/history");
                if (res.ok) {
                    setOrders(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleRate = async (productId: number, rating: number) => {
        setRatings(prev => ({ ...prev, [productId]: rating }));
        setSubmittingRating(productId);

        try {
            const res = await fetchApi("/api/reviews", {
                method: "POST",
                body: JSON.stringify({ productId, rating }),
            });

            if (res.ok) {
                // Success feedback (optional toast)
            }
        } catch (error) {
            console.error("Failed to submit rating", error);
        } finally {
            setSubmittingRating(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* User Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl bg-card shadow-sm">

                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center space-y-4 md:border-r border-border/50 pr-6">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background ring-2 ring-primary/20 shadow-xl">
                        <img
                            src={user?.imageUrl || "https://placehold.co/200?text=USER"}
                            alt={user?.username}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black uppercase tracking-tight">{user?.username || "Anime Fan"}</h2>
                        <Badge variant="secondary" className="mt-2 uppercase text-[10px] tracking-widest font-bold">
                            {user?.role || "Member"}
                        </Badge>
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:col-span-2 flex flex-col justify-between">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Mail className="h-3 w-3" /> Email
                            </span>
                            <p className="font-medium truncate">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Phone
                            </span>
                            <p className="font-medium">{user?.phone || "Not set"}</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Address
                            </span>
                            <p className="font-medium">{user?.address || "No address provided"}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Button onClick={onEdit} className="gap-2">
                            <Edit className="h-4 w-4" /> Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" /> Purchase History
                </h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10 border rounded-xl bg-card text-muted-foreground">
                        No purchases yet. Time to buy some merch!
                    </div>
                ) : (
                    <div className="border rounded-xl bg-card overflow-hidden">
                        {orders.map((order, i) => (
                            <div key={order.id} className={`p-6 ${i !== orders.length - 1 ? 'border-b' : ''}`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-primary">ORDER #{order.id}</span>
                                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-1">
                                            <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl">₹{Number(order.total).toFixed(2)}</div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4 mt-4 bg-muted/20 p-4 rounded-lg">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                            <ProductItemCard
                                                productId={item.productId}
                                                productTitle={item.productTitle}
                                                productImage={item.productImage}
                                                price={item.price}
                                                quantity={item.quantity}
                                            />

                                            {/* Rating */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase text-muted-foreground mr-2">Rate:</span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => handleRate(item.productId, star)}
                                                        className={`focus:outline-none transition-colors ${(ratings[item.productId] || 0) >= star ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                                                            }`}
                                                    >
                                                        <Star className="h-5 w-5 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
