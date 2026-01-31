
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    username?: string;
    role: string;
    imageUrl?: string;
    address?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetchApi("/auth/me");
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                    } else {
                        localStorage.removeItem("token");
                    }
                } catch (error) {
                    console.error("Auth check failed", error);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = (token: string, userData: User, redirectPath: string = "/") => {
        localStorage.setItem("token", token);
        setUser(userData);
        router.push(redirectPath);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
