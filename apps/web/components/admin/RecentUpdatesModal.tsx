"use client";

import { useState, useEffect } from "react";
import { X, Bell, Package, Search, Key, Activity, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UPDATES = [
    {
        title: "LRS-Integrated Contact Portal",
        description: "Users can now submit support queries via /support. Each submission triggers the AI Lead Responder and appears in your dashboard.",
        icon: <HelpCircle className="h-5 w-5 text-blue-400" />,
        date: "Feb 2026"
    },
    {
        title: "Uptime Monitoring",
        description: "Real-time system health status, sourced from UptimeRobot, is now visible directly on your dashboard.",
        icon: <Activity className="h-5 w-5 text-green-500" />,
        date: "Feb 2026"
    },
    {
        title: "Duplicate Protection",
        description: "The system now automatically prevents creating products with identical titles.",
        icon: <Package className="h-5 w-5 text-orange-500" />,
        date: "Feb 2026"
    },
    {
        title: "Robust Product Search",
        description: "Search is now case-insensitive and covers titles, categories, and anime series.",
        icon: <Search className="h-5 w-5 text-purple-500" />,
        date: "Feb 2026"
    },
    {
        title: "Enhanced Auth Security",
        description: "Added password visibility toggles and confirmation fields to keep accounts safe.",
        icon: <Key className="h-5 w-5 text-yellow-500" />,
        date: "Feb 2026"
    },
];

const VERSION = "1.3.0"; // Bump this string to re-show the popup for new updates

export function RecentUpdatesModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasSeenUpdates = localStorage.getItem(`admin_updates_seen_${VERSION}`);
        if (!hasSeenUpdates) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                setTimeout(() => setVisible(true), 10); // trigger CSS transition
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            setIsOpen(false);
            localStorage.setItem(`admin_updates_seen_${VERSION}`, "true");
        }, 250);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"}`}
        >
            <div
                className={`relative w-full max-w-lg bg-card border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
            >
                {/* Gradient top bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bell className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">What's New</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Version {VERSION}</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {UPDATES.map((update, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="mt-0.5 shrink-0">{update.icon}</div>
                                <div>
                                    <h3 className="font-bold text-sm uppercase tracking-tight mb-0.5">{update.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{update.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <Button onClick={handleClose} className="w-full h-12 font-black uppercase tracking-widest text-xs">
                            Awesome, Let's Go!
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WhatsNewCarousel() {
    const [index, setIndex] = useState(0);
    const total = UPDATES.length;

    const prev = () => setIndex((i) => (i - 1 + total) % total);
    const next = () => setIndex((i) => (i + 1) % total);

    const update = UPDATES[index];

    return (
        <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col h-72 lg:h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest">What's New</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                        {index + 1} / {total}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-muted text-muted-foreground rounded-full">v1.3.0</span>
                </div>
            </div>

            {/* Card body — fills remaining space */}
            <div className="flex-1 relative rounded-2xl border bg-background p-6 flex flex-col justify-between overflow-hidden">
                {/* Decorative background blob */}
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full blur-3xl opacity-20 bg-primary" />

                <div>
                    <div className="mb-4">{update.icon}</div>
                    <h3 className="text-lg font-black uppercase tracking-tight leading-tight mb-2">{update.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{update.description}</p>
                </div>

                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-4">{update.date}</div>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-between mt-4">
                <button
                    onClick={prev}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                </button>
                {/* Dot indicators */}
                <div className="flex gap-1.5">
                    {UPDATES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={next}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
                >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
