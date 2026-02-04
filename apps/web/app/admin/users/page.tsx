"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";

export default function AdminUsersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== "admin") {
                router.push("/login");
                return;
            }

            const loadUsers = async () => {
                try {
                    const res = await fetchApi("/api/admin/users");
                    if (res.ok) {
                        const data = await res.json();
                        setUsers(data);
                        setFilteredUsers(data);
                    }
                } catch (error) {
                    console.error("Failed to load users", error);
                } finally {
                    setLoading(false);
                }
            };

            loadUsers();
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        setFilteredUsers(
            users.filter(
                (u) =>
                    u.username?.toLowerCase().includes(lowerSearch) ||
                    u.email.toLowerCase().includes(lowerSearch) ||
                    String(u.id).includes(lowerSearch)
            )
        );
    }, [search, users]);

    if (loading || authLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen cyber-grid">
            <div className="container mx-auto py-10 px-6">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <Link href="/admin" className="text-muted-foreground hover:text-foreground text-[10px] items-center mb-2 uppercase tracking-widest font-bold hidden sm:flex">
                            <ArrowLeft className="h-3 w-3 mr-1" /> Dashboard
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Manage Users</h1>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10 h-11 bg-muted/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-black tracking-widest">ID</th>
                                    <th className="px-6 py-4 font-black tracking-widest">User</th>
                                    <th className="px-6 py-4 font-black tracking-widest">Email</th>
                                    <th className="px-6 py-4 font-black tracking-widest">Role</th>
                                    <th className="px-6 py-4 font-black tracking-widest">Joined</th>
                                    <th className="px-6 py-4 text-right font-black tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">#{u.id}</td>
                                        <td className="px-6 py-4 font-bold tracking-tight">{u.username}</td>
                                        <td className="px-6 py-4 text-xs font-medium">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs uppercase font-bold">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/users/${u.id}`} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                                DETAILS
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold tracking-widest uppercase text-xs">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
