
"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const successMessage = searchParams.get("signup") === "success" ? "Account created successfully! Please log in." : "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetchApi("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Login failed");
            }

            const data = await res.json();
            login(data.token, data.user, searchParams.get("redirect") || "/");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="container max-w-md py-20">
            <h1 className="text-3xl font-black uppercase mb-8 text-center">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {successMessage && <div className="text-green-600 bg-green-50 p-3 rounded text-sm font-medium text-center">{successMessage}</div>}
                {error && <div className="text-destructive text-sm font-medium">{error}</div>}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full">
                    Log In
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
