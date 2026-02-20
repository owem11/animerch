"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, Package, Search, Key, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const UPDATES = [
    {
        title: "Robust Product Search",
        description: "Search is now case-insensitive and covers titles, categories, and anime series.",
        icon: <Search className="h-5 w-5 text-blue-500" />
    },
    {
        title: "Enhanced Security",
        description: "Added password visibility toggles and confirmation fields to keep accounts safe.",
        icon: <Key className="h-5 w-5 text-purple-500" />
    },
    {
        title: "Duplicate Protection",
        description: "The system now automatically prevents creating products with identical titles.",
        icon: <Package className="h-5 w-5 text-orange-500" />
    },
    {
        title: "Uptime Monitoring",
        description: "Real-time system health status now visible directly on your dashboard.",
        icon: <Activity className="h-5 w-5 text-green-500" />
    }
];

export function RecentUpdatesModal() {
    const [isOpen, setIsOpen] = useState(false);
    const VERSION = "1.2.0"; // Increment this to show the modal again for new updates

    useEffect(() => {
        const hasSeenUpdates = localStorage.getItem(`admin_updates_seen_${VERSION}`);
        if (!hasSeenUpdates) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem(`admin_updates_seen_${VERSION}`, "true");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-card border shadow-2xl rounded-2xl overflow-hidden"
                    >
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
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">What's New!</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Version {VERSION}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {UPDATES.map((update, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="mt-1">{update.icon}</div>
                                        <div>
                                            <h3 className="font-bold text-sm uppercase tracking-tight mb-1">{update.title}</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{update.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Button
                                    onClick={handleClose}
                                    className="w-full h-12 font-black uppercase tracking-widest text-xs"
                                >
                                    Awesome, Let's Go!
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
