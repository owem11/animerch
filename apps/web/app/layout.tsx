import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Animerch",
    description: "Premium Anime Merchandise",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                {/* Google Fonts: Orbitron for Cyber theme */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('animerch-theme');
                                    var supportedThemes = ['default', 'cyber', 'retro'];
                                    if (theme && supportedThemes.indexOf(theme) > -1) {
                                        document.documentElement.classList.add('theme-' + theme);
                                    } else {
                                        document.documentElement.classList.add('theme-default');
                                    }
                                } catch (e) {
                                    document.documentElement.classList.add('theme-default');
                                }
                            })();
                        `,
                    }}
                />
            </head>
            <body className="font-sans antialiased min-h-screen bg-background text-foreground">
                <AuthProvider>
                    <ThemeWrapper>
                        <div className="flex flex-col min-h-screen relative z-10">
                            <Navbar />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Footer />
                        </div>
                    </ThemeWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}
