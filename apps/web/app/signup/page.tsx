
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetchApi("/auth/signup", {
                method: "POST",
                body: JSON.stringify({ email, password, username }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Signup failed");
            }

            // Log to Google Sheet (Graceful handling)
            try {
                await fetch("https://script.google.com/macros/s/AKfycbySiYS8xOSJ0nb6XQcRjPu_jgR8EjKzyuST86huScoL1G18sAvoWn3mLKuoPtkOUYNk/exec", {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        username,
                        email,
                    }),
                });
            } catch (sheetError) {
                console.error("Failed to log to Google Sheet", sheetError);
            }

            // Redirect to login on success
            router.push("/login?signup=success");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="container max-w-md py-12 md:py-20 px-6">
            <h1 className="text-2xl md:text-3xl font-black uppercase mb-8 text-center tracking-tighter">Create Account</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="text-destructive text-xs md:text-sm font-medium bg-destructive/5 p-4 rounded-lg border border-destructive/10">{error}</div>}

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="OtakuKing99"
                        className="h-12 bg-muted/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-muted/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-muted/20"
                    />
                </div>

                <Button type="submit" className="w-full h-12 text-xs font-black tracking-widest uppercase">
                    Sign Up
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
