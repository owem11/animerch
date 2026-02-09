
import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-16">
            <div className="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                <div className="space-y-4 text-center md:text-left">
                    <Link href="/" className="text-2xl font-title font-black tracking-tight block">
                        ANIMERCH
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                        Premium anime merchandise for the modern fan.
                        Curated collection of apparel, figures, and accessories.
                    </p>
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <h4 className="font-semibold tracking-wide">SHOP</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/?category=Apparel" className="hover:text-foreground transition-colors">Apparel</Link></li>
                        <li><Link href="/?category=Figures" className="hover:text-foreground transition-colors">Figures</Link></li>
                        <li><Link href="/?category=Accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
                        <li><Link href="/?sort=rating" className="hover:text-foreground transition-colors">Best Sellers</Link></li>
                    </ul>
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <h4 className="font-semibold tracking-wide">ACCOUNT</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
                        <li><Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
                        <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
                        <li><Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                    </ul>
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <h4 className="font-semibold tracking-wide">ABOUT</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="#" className="hover:text-foreground transition-colors">Our Story</Link></li>
                        <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                        <li><Link href="#" className="hover:text-foreground transition-colors">Shipping Policy</Link></li>
                        <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} ANIMERCH. All rights reserved.
            </div>
        </footer>
    );
}
