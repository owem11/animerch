"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { Loader2, Users, Package, ShoppingBag, TrendingUp, AlertTriangle, ShoppingCart, ArrowRight, Activity, Bell } from "lucide-react";
import Link from "next/link";
import { RecentUpdatesModal, WhatsNewCarousel } from "@/components/admin/RecentUpdatesModal";
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

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [monitors, setMonitors] = useState<any[]>([]);
    const [uptimeLoading, setUptimeLoading] = useState(true);
    const [supportQueries, setSupportQueries] = useState<any[]>([]);
    const [supportLoading, setSupportLoading] = useState(true);

    const getChartColors = () => {
        if (theme === 'retro') {
            return ["#FACD55", "#72E1B1", "#F7889F", "#7BDBFF", "#E354A8", "#CEB1F2"];
        }
        if (theme === 'cyber') {
            return ["#00E5FF", "#700BB3", "#FF00AA", "#00FFAA", "#AA00FF"];
        }
        return ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];
    };

    const CHART_COLORS = getChartColors();
    const primaryBarColor = theme === 'retro' ? "#FF4F08" : (theme === 'cyber' ? "#00E5FF" : "#000000");
    const secondaryBarColor = theme === 'retro' ? "#72E1B1" : (theme === 'cyber' ? "#FF00AA" : "#333333");

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

            const loadUptime = async () => {
                try {
                    const res = await fetch("/api/uptime");
                    if (res.ok) {
                        const data = await res.json();
                        setMonitors(data.monitors || []);
                    }
                } catch (err) {
                    console.error("Failed to load uptime stats");
                } finally {
                    setUptimeLoading(false);
                }
            };

            loadUptime();

            const loadSupport = async () => {
                try {
                    const res = await fetchApi("/api/support/queries");
                    if (res.ok) {
                        const data = await res.json();
                        setSupportQueries(data || []);
                    }
                } catch (err) {
                    console.error("Failed to load support queries");
                } finally {
                    setSupportLoading(false);
                }
            };

            loadSupport();
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
        <div className="min-h-screen cyber-grid">
            <RecentUpdatesModal />
            <div className="container mx-auto p-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Welcome back, {user?.username}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/admin/products" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-primary/90 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Inventory
                        </Link>
                        <Link href="/admin/users" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-secondary/80 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Users
                        </Link>
                    </div>
                </div>

                {/* System Status + What's New — square card rows */}
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-72">

                    {/* System Status — full aesthetic layout */}
                    <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col h-72 lg:h-full">
                        <div className="flex items-center gap-2 mb-5">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest">System Status</span>
                        </div>
                        {uptimeLoading ? (
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="rounded-2xl bg-muted animate-pulse h-36" />
                                ))}
                            </div>
                        ) : monitors.length > 0 ? (
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {monitors.map((monitor: any) => {
                                    const isOnline = monitor.status === 2;
                                    return (
                                        <div
                                            key={monitor.id}
                                            className={`relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden border ${isOnline
                                                ? 'border-green-500/20 bg-gradient-to-br from-green-500/10 via-transparent to-transparent'
                                                : 'border-destructive/20 bg-gradient-to-br from-destructive/10 via-transparent to-transparent'
                                                }`}
                                        >
                                            {/* Decorative glow orb */}
                                            <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full blur-2xl opacity-40 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-destructive'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-green-400' : 'text-destructive'}`}>
                                                        {isOnline ? 'Operational' : 'Disruption'}
                                                    </span>
                                                </div>
                                                <p className="text-base font-black leading-tight">{monitor.friendly_name}</p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-end gap-1">
                                                    <span className={`text-3xl font-black tabular-nums ${isOnline ? 'text-green-400' : 'text-destructive'}`}>
                                                        {monitor.all_time_uptime_ratio}
                                                    </span>
                                                    <span className="text-xs font-black text-muted-foreground mb-1">% uptime</span>
                                                </div>
                                                <div className={`mt-2 h-1 rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
                                                    <div
                                                        className={`h-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-destructive'}`}
                                                        style={{ width: `${Math.min(100, parseFloat(monitor.all_time_uptime_ratio))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-dashed text-muted-foreground">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="text-sm font-bold">No monitors found. Check UPTIMEROBOT_API_KEY.</span>
                            </div>
                        )}
                    </div>

                    {/* What's New — arrow carousel, no scrollbar */}
                    <WhatsNewCarousel />

                </div>

                {/* Contact Queries Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Contact Queries</h2>
                    </div>
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        {supportLoading ? (
                            <div className="p-8 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : supportQueries.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[9px] uppercase bg-muted/50 text-muted-foreground font-black tracking-widest border-b">
                                        <tr>
                                            <th className="px-4 py-2">Sender</th>
                                            <th className="px-4 py-2">Subject</th>
                                            <th className="px-4 py-2 hidden md:table-cell">Snippet</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {supportQueries.slice(0, 5).map((query: any) => (
                                            <tr key={query.id} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-4 py-2.5 font-bold text-xs tracking-tight truncate max-w-[120px]">{query.sender}</td>
                                                <td className="px-4 py-2.5 text-xs truncate max-w-[140px]">{query.subject}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground text-[10px] italic hidden md:table-cell truncate max-w-[200px]">
                                                    &ldquo;{query.summarizedBody || "No summary"}&rdquo;
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${query.status === 'automated' ? 'bg-green-100 text-green-700' :
                                                        query.status === 'drafted' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'}`}>
                                                        {query.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-[9px] font-bold text-muted-foreground">
                                                    {new Date(query.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No queries found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
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
                                    <Bar dataKey="total" fill={primaryBarColor} radius={[4, 4, 0, 0]} />
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
                                    <Bar dataKey="total" fill={secondaryBarColor} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
                    {/* Abandoned Carts / Top Products Area */}
                    <div className="lg:col-span-4 space-y-4">
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
                                        <>
                                            {/* Mobile View: Card List */}
                                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                                {stats?.abandonedCarts?.map((item: any, i) => (
                                                    <div key={`${item.cartId}-${i}`} className="p-4 border rounded-lg bg-muted/10 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">User</p>
                                                                <p className="font-bold text-sm tracking-tight">{item.username}</p>
                                                            </div>
                                                            <p className="font-black text-primary text-sm tracking-tighter">₹{Number(item.sellingPrice).toFixed(2)}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Item</p>
                                                            <p className="text-xs font-medium line-clamp-1">{item.productTitle}</p>
                                                        </div>
                                                        <div className="pt-2 border-t border-muted/20 flex justify-between items-center">
                                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{new Date(item.date).toLocaleDateString()}</span>
                                                            <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">Active Cart</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Desktop View: Table */}
                                            <div className="hidden md:block relative w-full overflow-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                                        <tr>
                                                            <th className="px-4 py-2 rounded-l-md font-black tracking-widest">User</th>
                                                            <th className="px-4 py-2 font-black tracking-widest">Item</th>
                                                            <th className="px-4 py-2 font-black tracking-widest">Date</th>
                                                            <th className="px-4 py-2 rounded-r-md text-right font-black tracking-widest">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stats?.abandonedCarts?.map((item: any, i) => (
                                                            <tr key={`${item.cartId}-${i}`} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                                <td className="px-4 py-3 font-bold tracking-tight">{item.username}</td>
                                                                <td className="px-4 py-3 truncate max-w-[200px]">{item.productTitle}</td>
                                                                <td className="px-4 py-3 text-muted-foreground text-xs uppercase font-bold">
                                                                    {new Date(item.date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-black text-primary">₹{Number(item.sellingPrice).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
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
                                <div className="space-y-3">
                                    <div className="hidden sm:flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest pb-2 border-b">
                                        <div className="pl-4">Product Details</div>
                                        <div className="ml-auto pr-4">Units Sold / ID</div>
                                    </div>
                                    {stats?.topProducts?.map((product: any) => (
                                        <div key={product.id} className="flex items-center p-3 sm:p-2 border rounded-lg sm:border-none sm:rounded-none bg-muted/5 sm:bg-transparent hover:bg-muted/10 transition-colors">
                                            <div className="h-10 w-10 rounded bg-muted flex-shrink-0 border flex items-center justify-center overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="ml-4 space-y-0.5 min-w-0">
                                                <p className="text-sm font-bold tracking-tight truncate leading-tight uppercase">{product.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{product.sold} units sold</p>
                                                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30 sm:hidden" />
                                                    <p className="text-[9px] font-bold text-muted-foreground sm:hidden">#{product.id}</p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block ml-auto text-right font-mono text-xs font-bold text-muted-foreground">#{product.id}</div>
                                        </div>
                                    ))}
                                    {stats?.topProducts?.length === 0 && <p className="text-muted-foreground text-sm">No sales yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow h-fit lg:sticky top-24">
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
