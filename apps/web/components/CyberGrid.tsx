"use client";

import { useTheme } from "@/context/ThemeContext";

export function CyberGrid() {
    const { theme } = useTheme();

    if (theme !== 'cyber') return null;

    return (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{
                zIndex: 0,
                backgroundImage: `
                    linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 229, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
            }}
            aria-hidden="true"
        />
    );
}
