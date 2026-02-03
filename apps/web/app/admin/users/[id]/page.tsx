"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminUserDetailsPage() {
    const { id } = useParams();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || currentUser.role !== "admin") {
                router.push("/login");
                return;
            }

            const loadUser = async () => {
                try {
                    const res = await fetchApi(`/api/admin/users/${id}`);
                    if (res.ok) {
                        const userData = await res.json();
                        setData(userData);
                    }
                } catch (error) {
                    console.error("Failed to load user details", error);
                } finally {
                    setLoading(false);
                }
            };

            loadUser();
        }
    }, [currentUser, authLoading, id, router]);

    if (loading || authLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!data) return <div className="p-10 text-center">User not found</div>;

    const { user, orders, cart } = data;

    return (
        <div className="container py-10">
            <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
            </Link>

            <div className="grid gap-6 md:grid-cols-3">
                {/* User Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">{user.username}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.address && (
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.address}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t text-xs text-muted-foreground">
                                Member since: {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-8">
                    {/* Cart Items (Abandoned Cart) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Current Cart (Abandoned)
                        </h3>
                        {cart.length > 0 ? (
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="h-10 px-4 text-left font-medium">Product</th>
                                            <th className="h-10 px-4 text-center font-medium">Qty</th>
                                            <th className="h-10 px-4 text-right font-medium">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item: any) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="p-4">{item.product.title}</td>
                                                <td className="p-4 text-center">{item.quantity}</td>
                                                <td className="p-4 text-right">₹{item.product.sellingPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm italic border rounded-md p-4 bg-muted/20">Cart is empty</div>
                        )}
                    </div>

                    {/* Order History */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5" /> Order History
                        </h3>
                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order: any) => (
                                    <div key={order.id} className="rounded-lg border bg-card p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">Order #{order.id}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Date: {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="font-bold">Total: ₹{order.total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm italic border rounded-md p-4 bg-muted/20">No orders placed</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
