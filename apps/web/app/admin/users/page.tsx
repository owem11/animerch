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
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto py-10">
                <div className="mb-6">
                    <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-end">
                        <h1 className="text-3xl font-bold">Manage Users</h1>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">{u.id}</td>
                                    <td className="p-4 align-middle font-medium">{u.username}</td>
                                    <td className="p-4 align-middle">{u.email}</td>
                                    <td className="p-4 align-middle capitalize">{u.role}</td>
                                    <td className="p-4 align-middle">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle text-right">
                                        <Link href={`/admin/users/${u.id}`} className="text-primary hover:underline font-medium">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
