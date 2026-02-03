"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Phone, Edit, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminProfilePage() {
    const { user, login, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login?redirect=/admin/profile");
            } else if (user.role !== "admin") {
                router.push("/profile");
            }
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="container max-w-4xl py-12">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>

            <h1 className="text-3xl font-black uppercase mb-8">Admin Profile</h1>

            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Admin Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl bg-card shadow-sm relative overflow-hidden">

                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ShieldCheck className="w-32 h-32" />
                    </div>

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center justify-center space-y-4 md:border-r border-border/50 pr-6 z-10">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/10 ring-2 ring-primary/20 shadow-xl">
                            <img
                                src={user?.imageUrl || "https://placehold.co/200?text=ADMIN"}
                                alt={user?.username}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight">{user?.username}</h2>
                            <Badge variant="default" className="mt-2 uppercase text-[10px] tracking-widest font-bold">
                                Administrator
                            </Badge>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="md:col-span-2 flex flex-col justify-between z-10">
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
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <Link href="/admin">
                                <Button variant="secondary" className="gap-2">
                                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                                </Button>
                            </Link>
                            <Link href="/admin/profile/edit">
                                <Button className="gap-2" variant="outline">
                                    <Edit className="h-4 w-4" /> Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
