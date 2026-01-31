import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
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
        <html lang="en">
            <body className="font-sans antialiased min-h-screen bg-background text-foreground">
                <AuthProvider>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
