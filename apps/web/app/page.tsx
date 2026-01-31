
import { ProductCard } from "@/components/ProductCard";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

interface Product {
    id: number;
    title: string;
    price: string;
    description: string;
    category: string;
    rating: string;
    imageUrl: string;
}

async function getProducts(params: Record<string, string>) {
    try {
        const searchParams = new URLSearchParams(params);
        const res = await fetch(`http://localhost:3001/api/products?${searchParams.toString()}`, {
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
        const res = await fetch("http://localhost:3001/api/products?sort=rating&limit=4", {
            next: { revalidate: 3600 },
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
        const res = await fetch("http://localhost:3001/api/products?sort=price_desc&limit=4", {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        return { data: [] };
    }
}

export default async function Home({ searchParams }: { searchParams: { search?: string; category?: string; sort?: string } }) {
    const productsData = await getProducts(searchParams as Record<string, string>);
    const recommendedData = await getRecommendedProducts();
    const mostBoughtData = await getMostBoughtProducts();

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
                                <ProductCard key={product.id} {...product} />
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
        <div className="container py-8 space-y-20">

            {/* Recommended Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Editor's Picks</span>
                </div>
                <div className="flex items-end justify-between border-b pb-4">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Recommended Merch</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendedData.data.map((product: Product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </section>

            {/* Most Bought / Trending Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Trending Now</span>
                </div>
                <div className="flex items-end justify-between border-b pb-4">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Most Bought</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mostBoughtData.data.map((product: Product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </section>

            {/* All Products with Dropbar/Collapse */}
            <section className="space-y-6">
                <div className="flex items-end justify-between border-b pb-4">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">All Collections</h2>
                    <p className="text-muted-foreground font-medium">{productsData.count} items</p>
                </div>

                <ProductGrid products={productsData.data} />
            </section>
        </div>
    );
}
