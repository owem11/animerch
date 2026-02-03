"use client";

import { ThemeProvider as ThemeProviderBase } from "../context/ThemeContext";
import { CyberGrid } from "./CyberGrid";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProviderBase>
            <CyberGrid />
            {children}
        </ThemeProviderBase>
    );
}
