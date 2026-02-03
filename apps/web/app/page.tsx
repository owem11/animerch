
import { ProductCard } from "@/components/ProductCard";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react";

interface Product {
    id: number;
    title: string;
    sellingPrice: string;
    description: string;
    category: string;
    rating: string;
    imageUrl: string;
}

async function getProducts(params: Record<string, string>) {
    try {
        const searchParams = new URLSearchParams(params);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"}/api/products?${searchParams.toString()}`, {
            cache: "no-store",
        });
        if (!res.ok) {
            console.error("Failed to fetch products:", res.status, res.statusText);
            return { data: [], count: 0 };
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return { data: [], count: 0 };
    }
}

async function getRecommendedProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"}/api/products?sort=rating&limit=4`, {
            cache: "no-store",
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        return { data: [] };
    }
}

async function getMostBoughtProducts() {
    try {
        // Mocking "Most Bought" using price_desc for now to show premium items
        // In a real scenario, this would fetch based on order volume
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"}/api/products?sort=price_desc&limit=4`, {
            cache: "no-store",
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        return { data: [] };
    }
}

async function getNewArrivals() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"}/api/products?sort=createdAt&limit=4`, {
            cache: "no-store",
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        console.error("New Arrivals error:", error);
        return { data: [] };
    }
}

export default async function Home({ searchParams }: { searchParams: { search?: string; category?: string; sort?: string } }) {
    const productsData = await getProducts(searchParams as Record<string, string>);
    const recommendedData = await getRecommendedProducts();
    const mostBoughtData = await getMostBoughtProducts();
    const newArrivalsData = await getNewArrivals();

    // If searching or filtering, show simple results view
    if (searchParams.search || searchParams.category) {
        return (
            <div className="container py-8">
                <section className="space-y-6">
                    <div className="flex items-end justify-between border-b pb-4">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase">
                                {searchParams.search ? `Results for "${searchParams.search}"` :
                                    searchParams.category ? `${searchParams.category}` : "Products"}
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                {productsData.count} items found
                            </p>
                        </div>
                        <Link href="/">
                            <Button variant="ghost">Clear Filters</Button>
                        </Link>
                    </div>

                    {productsData.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {productsData.data.map((product: Product) => (
                                <ProductCard key={product.id} {...product} price={product.sellingPrice} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground">
                            <p className="text-lg">No products found.</p>
                            <Link href="/">
                                <Button variant="link" className="mt-2">Back to Home</Button>
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        );
    }

    // Default Homepage View
    return (
        <div className="min-h-screen cyber-grid">
            <div className="container py-12 space-y-24 relative z-10">

                {/* Recommended Section */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-[2px] w-12 bg-primary" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Editor&apos;s Picks</span>
                    </div>
                    <div className="flex items-end justify-between border-b border-border/40 pb-6">
                        <h2 className="text-7xl font-heading font-black tracking-[-0.04em] uppercase">Recommended</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {recommendedData.data.map((product: Product) => (
                            <ProductCard key={product.id} {...product} price={product.sellingPrice} />
                        ))}
                    </div>
                </section>

                {/* New Arrivals Section */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-[2px] w-12 bg-primary" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Just Dropped</span>
                    </div>
                    <div className="flex items-end justify-between border-b border-border/40 pb-6">
                        <h2 className="text-7xl font-heading font-black tracking-[-0.04em] uppercase">New Arrivals</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {newArrivalsData.data.length > 0 ? (
                            newArrivalsData.data.map((product: Product) => (
                                <ProductCard key={product.id} {...product} price={product.sellingPrice} />
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center text-muted-foreground">
                                <p>No new arrivals yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Most Bought / Trending Section */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-[2px] w-12 bg-primary" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Trending Now</span>
                    </div>
                    <div className="flex items-end justify-between border-b border-border/40 pb-6">
                        <h2 className="text-7xl font-heading font-black tracking-[-0.04em] uppercase">Most Bought</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {mostBoughtData.data.map((product: Product) => (
                            <ProductCard key={product.id} {...product} price={product.sellingPrice} />
                        ))}
                    </div>
                </section>

                {/* All Products with Dropbar/Collapse */}
                <section className="space-y-10">
                    <div className="flex items-end justify-between border-b border-border/40 pb-6">
                        <h2 className="text-7xl font-heading font-black tracking-[-0.04em] uppercase">Collections</h2>
                        <p className="text-muted-foreground font-black text-xs tracking-widest">{productsData.count} ITEMS</p>
                    </div>

                    <ProductGrid products={productsData.data} />
                </section>
            </div>
        </div>
    );
}
