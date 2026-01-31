
import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-16">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Link href="/" className="text-2xl font-black tracking-tight">
                        ANIMERCH
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Premium anime merchandise for the modern fan.
                        Curated collection of apparel, figures, and accessories.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold tracking-wide">SHOP</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/?category=Apparel" className="hover:text-foreground">Apparel</Link></li>
                        <li><Link href="/?category=Figures" className="hover:text-foreground">Figures</Link></li>
                        <li><Link href="/?category=Accessories" className="hover:text-foreground">Accessories</Link></li>
                        <li><Link href="/?sort=rating" className="hover:text-foreground">Best Sellers</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold tracking-wide">ACCOUNT</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/profile" className="hover:text-foreground">Profile</Link></li>
                        <li><Link href="/cart" className="hover:text-foreground">Cart</Link></li>
                        <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
                        <li><Link href="/signup" className="hover:text-foreground">Sign Up</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold tracking-wide">ABOUT</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="#" className="hover:text-foreground">Our Story</Link></li>
                        <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
                        <li><Link href="#" className="hover:text-foreground">Shipping Policy</Link></li>
                        <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} ANIMERCH. All rights reserved.
            </div>
        </footer>
    );
}
