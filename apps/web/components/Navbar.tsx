
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, ShoppingCart, User as UserIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
            <div className="w-full flex justify-center py-8 border-b">
                <Link href="/" className="text-6xl font-black tracking-tighter hover:tracking-widest transition-all duration-500">
                    ANIMERCH
                </Link>
            </div>

            {/* Navigation Bar */}
            <nav className="w-full border-b bg-background sticky top-0 z-50">
                <div className="container flex items-center justify-between h-16">
                    {/* Left: Categories / Sort (could be dropdowns here or on page) */}
                    {/* Left: Categories / Sort */}
                    <div className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-primary/80 transition-colors">HOME</Link>

                        {/* Category Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 hover:text-primary/80 transition-colors uppercase">
                                Categories <ChevronDown className="h-4 w-4" />
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search merch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 rounded-full bg-background border border-input focus-visible:ring-1 focus-visible:ring-primary shadow-sm hover:border-primary/50 transition-colors"
                        />
                    </form>

                    {/* Right: Auth & Cart */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {user.role !== 'admin' && (
                                    <Link href="/cart">
                                        <Button variant="ghost" size="icon" className="relative">
                                            <ShoppingCart className="h-5 w-5" />
                                            {/* TODO: Cart count badge */}
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" className="text-xs font-bold uppercase">
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <Link href={user.role === 'admin' ? "/admin/profile" : "/profile"}>
                                    <Button variant="ghost" size="icon" className="rounded-full border border-transparent hover:border-border overflow-hidden">
                                        {user.imageUrl ? (
                                            <img src={user.imageUrl} alt={user.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5" />
                                        )}
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={logout} className="text-xs">
                                    LOGOUT
                                </Button>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button>LOGIN</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
