"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { ProfileEdit } from "@/components/profile/ProfileEdit";

export default function ProfilePage() {
    const { user, login, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<"dashboard" | "edit">("dashboard");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/profile");
        }
    }, [user, authLoading, router]);

    const handleUpdate = (updatedUser: any) => {
        login(localStorage.getItem("token") || "", updatedUser); // Update context
        // Optionally stay on edit slightly or move back
        // For now, let user choose to go back or see "Success" message
        // But better UX: go back to dashboard after short delay? 
        // Or just let them see the success message.
        // We will keep them on edit screen to see the success message, but they can click Back.
    };

    if (authLoading || !user) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    return (
        <div className="container max-w-4xl py-12">
            <h1 className="text-3xl font-black uppercase mb-8">My Account</h1>

            {view === "dashboard" ? (
                <ProfileDashboard
                    user={user}
                    onEdit={() => setView("edit")}
                />
            ) : (
                <ProfileEdit
                    user={user}
                    onCancel={() => setView("dashboard")}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}
