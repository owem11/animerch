
import { AddToCartButton } from "@/components/AddToCartButton";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"}/api/products/${id}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen cyber-grid">
            <div className="container py-6 md:py-12">
                <Link href="/" className="text-xs md:text-sm text-muted-foreground hover:text-foreground mb-6 md:mb-8 block">
                    ← Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
                    {/* Image Section */}
                    <div className="relative aspect-square bg-muted rounded-xl md:rounded-2xl overflow-hidden border">
                        <img
                            src={product.imageUrl || "https://placehold.co/600"}
                            alt={product.title}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    {product.category} / {product.anime}
                                </span>
                                <div className="flex items-center gap-1 text-primary">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="font-bold">{product.rating}</span>
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-tight uppercase">
                                {product.title}
                            </h1>

                            <p className="text-2xl md:text-3xl font-bold">
                                ₹{Number(product.sellingPrice).toFixed(2)}
                            </p>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert">
                            <p>{product.description}</p>
                        </div>

                        <div className="space-y-6 pt-6 border-t">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="w-full sm:w-auto">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block tracking-widest">Select Size</label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.availableSizes ? (
                                            product.availableSizes.split(",").map((size: string) => (
                                                <div key={size} className="h-10 min-w-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/30 text-xs hover:border-primary transition-colors cursor-pointer">
                                                    {size.trim()}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/30 text-xs">
                                                One Size
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block tracking-widest">Available Colors</label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.availableColors ? (
                                            product.availableColors.split(",").map((color: string) => (
                                                <div key={color} className="h-10 min-w-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/30 text-xs hover:border-primary transition-colors cursor-pointer">
                                                    {color.trim()}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/30 text-xs">
                                                Standard
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <div className="flex-1">
                                    <AddToCartButton productId={product.id} />
                                </div>
                                <Button variant="outline" size="lg" className="sm:w-auto w-full">Wishlist</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
