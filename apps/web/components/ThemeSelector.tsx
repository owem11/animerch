"use client";

import { useTheme } from "@/context/ThemeContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Zap, Sparkles, Monitor } from "lucide-react";

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Switch Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 [.theme-retro_&]:w-48 [.theme-retro_&]:p-2 [.theme-retro_&]:rounded-3xl [.theme-retro_&]:border-black">
                <DropdownMenuItem
                    onClick={() => setTheme('default')}
                    className="flex items-center gap-2 cursor-pointer transition-all duration-200 [.theme-retro_&]:px-4 [.theme-retro_&]:py-2 [.theme-retro_&]:rounded-full [.theme-retro_&]:hover:bg-accent [.theme-retro_&]:hover:text-black focus:bg-accent focus:text-accent-foreground"
                >
                    <Monitor className="h-4 w-4" />
                    <span className="font-heading">Default</span>
                    {theme === 'default' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('cyber')}
                    className="flex items-center gap-2 cursor-pointer transition-all duration-200 [.theme-retro_&]:px-4 [.theme-retro_&]:py-2 [.theme-retro_&]:rounded-full [.theme-retro_&]:hover:bg-accent [.theme-retro_&]:hover:text-black focus:bg-accent focus:text-accent-foreground"
                >
                    <Zap className="h-4 w-4 text-cyan-500" />
                    <span className="font-heading">Cyber</span>
                    {theme === 'cyber' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('retro')}
                    className="flex items-center gap-2 cursor-pointer transition-all duration-200 [.theme-retro_&]:px-4 [.theme-retro_&]:py-2 [.theme-retro_&]:rounded-full [.theme-retro_&]:hover:bg-accent [.theme-retro_&]:hover:text-black focus:bg-accent focus:text-accent-foreground"
                >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="font-heading">Retro</span>
                    {theme === 'retro' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
