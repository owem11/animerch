
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, ShoppingCart, User as UserIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeSelector } from "./ThemeSelector";

export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/?search=${search}`);
    };

    return (
        <div className="flex flex-col w-full">
            {/* Top Bar: Logo */}
            <div className="w-full flex justify-center py-12 border-b border-border/50">
                <h1 className="text-8xl font-heading font-black tracking-[-0.05em] hover:tracking-[0.05em] transition-all duration-700 uppercase">
                    <Link href="/">ANIMERCH</Link>
                </h1>
            </div>

            {/* Navigation Bar */}
            <nav className="w-full border-b bg-background sticky top-0 z-50">
                <div className="container flex items-center justify-between h-20">
                    {/* Left: Categories / Sort */}
                    <div className="flex items-center gap-8 text-[11px] font-black tracking-[0.15em] uppercase">
                        <Link href="/" className="hover:text-primary transition-colors">HOME</Link>

                        {/* Category Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                Categories <ChevronDown className="h-3 w-3" />
                            </button>
                            <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="bg-background border rounded-md shadow-lg py-2 flex flex-col">
                                    {[
                                        "Anime T-Shirt",
                                        "Hoodies",
                                        "Toys",
                                        "Accessories",
                                        "Rings",
                                        "Mugs",
                                        "Keychains",
                                        "Shoes",
                                        "Mouse Pads"
                                    ].map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/?category=${encodeURIComponent(cat)}`}
                                            className="px-4 py-2 hover:bg-muted text-sm transition-colors"
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link href="/?sort=rating" className="hover:text-primary/80 transition-colors">BEST SELLERS</Link>
                        <Link href="/?sort=price_desc" className="hover:text-primary/80 transition-colors">PREMIUM</Link>
                    </div>

                    {/* Center: Search */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md mx-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search merch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-11 pl-12 rounded-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
                        />
                    </form>

                    {/* Right: Auth & Cart */}
                    <div className="flex items-center gap-6">
                        <ThemeSelector />
                        {user ? (
                            <>
                                {user.role !== 'admin' && (
                                    <Link href="/cart">
                                        <Button variant="ghost" size="icon" className="relative h-10 w-10">
                                            <ShoppingCart className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" className="text-[10px] font-black tracking-widest uppercase">
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <Link href={user.role === 'admin' ? "/admin/profile" : "/profile"}>
                                    <Button variant="ghost" size="icon" className="rounded-full border border-border h-10 w-10 overflow-hidden">
                                        {user.imageUrl ? (
                                            <img src={user.imageUrl} alt={user.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5" />
                                        )}
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={logout} className="text-[10px] font-black tracking-widest">
                                    LOGOUT
                                </Button>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button className="font-heading font-black tracking-widest text-[11px] h-11 px-8 rounded-full [.theme-cyber_&]:bg-primary [.theme-cyber_&]:text-white [.theme-retro_&]:retro-button">
                                    LOGIN
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
