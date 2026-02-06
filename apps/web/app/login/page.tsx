
"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
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


            // Strict Role Separation
            if (isAdmin && data.user.role !== 'admin') {
                throw new Error("Unauthorized access. You are not an admin. Please use User Login.");
            }
            if (!isAdmin && data.user.role === 'admin') {
                throw new Error("Admin accounts must log in via the Admin Login.");
            }

            const redirectPath = isAdmin ? "/admin" : (searchParams.get("redirect") || "/");
            login(data.token, data.user, redirectPath);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setError("");
        try {
            const res = await fetchApi("/auth/google", {
                method: "POST",
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Google login failed");
            }

            const data = await res.json();
            const redirectPath = searchParams.get("redirect") || "/";
            login(data.token, data.user, redirectPath);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="container max-w-md py-12 md:py-20 px-6">
            <h1 className="text-2xl md:text-3xl font-black uppercase mb-8 text-center tracking-tighter">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {successMessage && <div className="text-green-600 bg-green-50 border border-green-100 p-4 rounded-lg text-xs md:text-sm font-medium text-center">{successMessage}</div>}
                {error && <div className="text-destructive text-xs md:text-sm font-medium bg-destructive/5 p-4 rounded-lg border border-destructive/10">{error}</div>}

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
                    {isAdmin ? "Log In as Admin" : "Log In"}
                </Button>

                {!isAdmin && (
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-background px-2 text-muted-foreground font-black">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError("Google Login Failed")}
                                theme="filled_black"
                                shape="square"
                                size="large"
                                width="100%"
                            />
                        </div>
                    </div>
                )}

                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => setIsAdmin(!isAdmin)}
                        className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 decoration-border"
                    >
                        {isAdmin ? "Standard User Login" : "Admin Login Portal"}
                    </button>
                </div>

                {!isAdmin && (
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                )}
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
