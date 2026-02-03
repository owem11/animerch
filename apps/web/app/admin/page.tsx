"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Users, Package, ShoppingBag, TrendingUp, AlertTriangle, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface DashboardStats {
    users: number;
    orders: number;
    products: number;
    totalSales: number;
    totalProfit: number;
    lowStock: any[];
    topProducts: any[];
    salesHistory: any[];
    profitHistory: any[];
    categoryDistribution: any[];
    abandonedCarts: any[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== "admin") {
                router.push("/login"); // Redirect if not admin
                return;
            }

            const loadStats = async () => {
                try {
                    const res = await fetchApi("/api/admin/stats");
                    if (!res.ok) throw new Error("Failed to fetch stats");
                    const data = await res.json();
                    setStats(data);
                } catch (err) {
                    setError("Could not load dashboard data.");
                } finally {
                    setLoading(false);
                }
            };

            loadStats();
        }
    }, [user, authLoading, router]);

    if (loading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-destructive">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.username}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/products" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Manage Inventory
                        </Link>
                        <Link href="/admin/users" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-secondary/80 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Manage Users
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium">Total Sales</span>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">₹{stats?.totalSales?.toLocaleString() || "0"}</div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium">Total Profit</span>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">₹{stats?.totalProfit?.toLocaleString() || "0"}</div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium">Total Users</span>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats?.users}</div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium">Total Orders</span>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats?.orders}</div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-sm font-medium">Products</span>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats?.products}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Sales Overview</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.salesHistory || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Profit Overview</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.profitHistory || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Abandoned Carts / Top Products Area */}
                    <div className="col-span-4 space-y-8">
                        {/* Abandoned Carts */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between border-b">
                                <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-orange-500" /> Abandoned Carts (Active)
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {stats?.abandonedCarts?.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No active carts found.</p>
                                    ) : (
                                        <div className="relative w-full overflow-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                                    <tr>
                                                        <th className="px-4 py-2 rounded-l-md">User</th>
                                                        <th className="px-4 py-2">Item</th>
                                                        <th className="px-4 py-2">Date</th>
                                                        <th className="px-4 py-2 rounded-r-md text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats?.abandonedCarts?.map((item: any, i) => (
                                                        <tr key={`${item.cartId}-${i}`} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium">{item.username}</td>
                                                            <td className="px-4 py-3 truncate max-w-[150px]">{item.productTitle}</td>
                                                            <td className="px-4 py-3 text-muted-foreground">
                                                                {new Date(item.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold">₹{Number(item.sellingPrice).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-row items-center justify-between">
                                <h3 className="font-semibold leading-none tracking-tight">Top Selling Products</h3>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center text-xs text-muted-foreground font-medium uppercase pb-2 border-b">
                                        <div className="ml-4">Product Name</div>
                                        <div className="ml-auto">Product ID</div>
                                    </div>
                                    {stats?.topProducts?.map((product: any) => (
                                        <div key={product.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{product.title}</p>
                                                <p className="text-sm text-muted-foreground">{product.sold} sold</p>
                                            </div>
                                            <div className="ml-auto font-medium">#{product.id}</div>
                                        </div>
                                    ))}
                                    {stats?.topProducts?.length === 0 && <p className="text-muted-foreground text-sm">No sales yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow h-fit sticky top-24">
                        <div className="p-6 flex flex-row items-center justify-between">
                            <h3 className="font-semibold leading-none tracking-tight text-destructive flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
                            </h3>
                            <Link href="/admin/products" className="text-xs text-primary hover:underline flex items-center">
                                Manage All <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="space-y-4">
                                {stats?.lowStock?.map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none truncate max-w-[180px]">{product.title}</p>
                                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                                        </div>
                                        <div className="font-bold text-destructive">{product.stock} left</div>
                                    </div>
                                ))}
                                {stats?.lowStock?.length === 0 && <p className="text-green-600 text-sm">Inventory looks good!</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
