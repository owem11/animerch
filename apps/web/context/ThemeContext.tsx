"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'cyber' | 'retro';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('default');

    useEffect(() => {
        // Load saved theme on mount
        const savedTheme = localStorage.getItem('animerch-theme') as Theme;
        const finalTheme = (savedTheme && ['default', 'cyber', 'retro'].includes(savedTheme))
            ? savedTheme
            : 'default';

        setTheme(finalTheme);
        applyTheme(finalTheme);
    }, []);

    const applyTheme = (newTheme: Theme) => {
        // Apply to BOTH html and body for maximum CSS compatibility
        const htmlEl = document.documentElement;
        const bodyEl = document.body;

        // Remove ALL theme classes first
        htmlEl.classList.remove('theme-default', 'theme-cyber', 'theme-retro');
        bodyEl.classList.remove('theme-default', 'theme-cyber', 'theme-retro');

        // Add new theme class
        htmlEl.classList.add(`theme-${newTheme}`);
        bodyEl.classList.add(`theme-${newTheme}`);
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('animerch-theme', newTheme);
        applyTheme(newTheme);
    };

    // ALWAYS wrap children in Provider - no conditional return
    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
