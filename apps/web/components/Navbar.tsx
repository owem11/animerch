
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, ShoppingCart, User as UserIcon, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "../context/ThemeContext";

export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState("");

    const { theme } = useTheme();
    const [randomNavColor, setRandomNavColor] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/?search=${search}`);
    };

    const retroPalette = [
        '#FACD55', // Yellow
        '#72E1B1', // Mint Green
        '#F7889F', // Pink
        '#7BDBFF', // Light Blue
        '#E354A8', // Magenta
        '#CEB1F2'  // Light Purple
    ];

    useEffect(() => {
        if (theme === 'retro') {
            const randomColor = retroPalette[Math.floor(Math.random() * retroPalette.length)];
            setRandomNavColor(randomColor);
        }
    }, [theme]);

    return (
        <div className="flex flex-col w-full">
            {/* Top Bar: Logo */}
            <div className="w-full flex justify-center py-6 md:py-12 border-b border-border/50">
                <h1 className="text-4xl md:text-8xl font-title font-black tracking-[-0.05em] hover:tracking-[0.05em] hover:scale-[1.02] transition-[tracking,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] uppercase select-none">
                    <Link href="/" className="block">ANIMERCH</Link>
                </h1>
            </div>

            {/* Navigation Bar */}
            <nav
                style={theme === 'retro' ? { '--nav-bg-color': randomNavColor } as React.CSSProperties : {}}
                className={`w-full border-b bg-background sticky top-0 z-50 [.theme-default_&]:bg-black [.theme-default_&]:text-white [.theme-default_&]:border-white/10 
                    ${theme === 'retro' ? 'random-nav-bg' : ''}`}
            >
                <div className="container flex items-center justify-between h-16 md:h-20">
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="[.theme-default_&]:text-white"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    {/* Left: Categories / Sort (Desktop) */}
                    <div className="hidden md:flex items-center gap-8 text-[11px] font-black tracking-[0.15em] uppercase text-foreground/80">
                        <Link href="/" className="hover:text-primary transition-colors duration-500 ease-in-out">HOME</Link>

                        {/* Category Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 hover:text-primary transition-colors duration-500 ease-in-out">
                                Categories <ChevronDown className="h-3 w-3" />
                            </button>
                            <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="bg-background border rounded-md shadow-lg py-2 flex flex-col [.theme-default_&]:bg-black [.theme-default_&]:border-white/10">
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
                                            className="px-4 py-2 mx-1 rounded-md hover:bg-muted text-sm transition-colors [.theme-default_&]:hover:bg-white/10 category-item"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link href="/?sort=rating" className="hover:text-primary transition-colors duration-500 ease-in-out">BEST SELLERS</Link>
                        <Link href="/?sort=price_desc" className="hover:text-primary transition-colors duration-500 ease-in-out">PREMIUM</Link>
                    </div>

                    {/* Center: Search (Hidden on small mobile, shown on md+) */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground [.theme-default_&]:text-white/60" />
                        <Input
                            placeholder="Search merch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 md:h-11 pl-10 md:pl-12 rounded-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary transition-all [.theme-default_&]:bg-white/10 [.theme-default_&]:text-white [.theme-default_&]:placeholder:text-white/40"
                        />
                    </form>

                    {/* Right: Auth & Cart */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <ThemeSelector />
                        {user ? (
                            <>
                                {user.role !== 'admin' && (
                                    <Link href="/cart">
                                        <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10 [.theme-default_&]:text-white">
                                            <ShoppingCart className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link href="/admin" className="hidden sm:block">
                                        <Button variant="ghost" className="text-[10px] font-black tracking-widest uppercase [.theme-default_&]:text-white">
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <Link href={user.role === 'admin' ? "/admin/profile" : "/profile"}>
                                    <Button variant="ghost" size="icon" className="rounded-full border border-border h-9 w-9 md:h-10 md:w-10 overflow-hidden [.theme-default_&]:border-white/20 [.theme-default_&]:text-white">
                                        {user.imageUrl ? (
                                            <img src={user.imageUrl} alt={user.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5" />
                                        )}
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={logout} className="hidden sm:flex text-[10px] font-black tracking-widest [.theme-default_&]:text-white">
                                    LOGOUT
                                </Button>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button className="font-heading font-black tracking-widest text-[10px] md:text-[11px] h-9 md:h-11 px-4 md:px-8 rounded-full [.theme-cyber_&]:bg-primary [.theme-cyber_&]:text-white [.theme-retro_&]:retro-button [.theme-default_&]:bg-white [.theme-default_&]:text-black">
                                    LOGIN
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-background border-t p-4 space-y-4 animate-in slide-in-from-top duration-300 [.theme-default_&]:bg-black">
                        {/* Search in Mobile Menu (only shown when hidden in bar) */}
                        <form onSubmit={handleSearch} className="relative sm:hidden">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground [.theme-default_&]:text-white/60" />
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 pl-10 rounded-full bg-muted/30 border-none [.theme-default_&]:bg-white/10 [.theme-default_&]:text-white"
                            />
                        </form>

                        <div className="flex flex-col gap-4 text-sm font-black tracking-widest uppercase items-center py-4">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
                            <div className="w-full h-[1px] bg-border/50" />
                            <span className="text-xs text-muted-foreground tracking-[0.3em]">CATEGORIES</span>
                            <div className="grid grid-cols-2 gap-2 w-full text-[10px] text-center">
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
                                        className="py-2 hover:bg-muted rounded-md"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                            <div className="w-full h-[1px] bg-border/50" />
                            <Link href="/?sort=rating" onClick={() => setIsMobileMenuOpen(false)}>BEST SELLERS</Link>
                            <Link href="/?sort=price_desc" onClick={() => setIsMobileMenuOpen(false)}>PREMIUM</Link>
                            {user?.role === 'admin' && (
                                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>DASHBOARD</Link>
                            )}
                            {user && (
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-destructive">LOGOUT</button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
