"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface ProfileEditProps {
    user: any;
    onCancel: () => void;
    onUpdate: (user: any) => void;
}

export function ProfileEdit({ user, onCancel, onUpdate }: ProfileEditProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Form State
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [imageUrl, setImageUrl] = useState(user?.imageUrl || "");
    const [address, setAddress] = useState(user?.address || "");
    const [phone, setPhone] = useState(user?.phone || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetchApi("/api/users/profile", {
                method: "PUT",
                body: JSON.stringify({
                    username,
                    imageUrl,
                    address,
                    phone
                }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                onUpdate(updatedUser); // Notify parent to update context/state
                setMessage("success:Profile updated successfully!");
            } else {
                setMessage("error:Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            setMessage("error:An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-xl p-6 bg-card animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold uppercase tracking-wide">Edit Details</h3>
                <Button variant="ghost" size="sm" onClick={onCancel}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                    <div className={`p-3 rounded text-sm font-medium flex items-center gap-2 ${message.startsWith("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        <div className={`w-2 h-2 rounded-full ${message.startsWith("success") ? "bg-green-600" : "bg-red-600"}`} />
                        {message.split(":")[1]}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email (Read Only)</label>
                        <Input value={email} disabled className="bg-muted opacity-70" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Avatar URL</label>
                        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Anime St, Tokyo" />
                </div>

                <div className="pt-4 flex gap-4 border-t mt-4">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="w-full md:w-auto">
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
