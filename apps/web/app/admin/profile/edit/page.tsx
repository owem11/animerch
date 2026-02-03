"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export default function AdminProfileEditPage() {
    const { user, login, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        imageUrl: "",
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login?redirect=/admin/profile/edit");
            } else if (user.role !== "admin") {
                router.push("/profile");
            } else {
                setFormData({
                    username: user.username || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    imageUrl: user.imageUrl || "",
                });
            }
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetchApi(`/api/users/${user?.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            const updatedUser = await res.json();
            login(localStorage.getItem("token") || "", updatedUser);
            router.push("/admin/profile");
        } catch (error) {
            console.error(error);
            // In a real app, show error toast
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="container max-w-2xl py-12">
            <Link href="/admin/profile" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Profile
            </Link>

            <div className="space-y-6 border p-6 rounded-xl bg-card shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold">Edit Admin Profile</h1>
                    <p className="text-sm text-muted-foreground">Update your administrator details.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Avatar URL</Label>
                        <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link href="/admin/profile">
                            <Button variant="ghost" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
