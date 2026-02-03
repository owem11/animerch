
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
        <div className="container py-12">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 block">
                ← Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Image Section */}
                <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border">
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

                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                            {product.title}
                        </h1>

                        <p className="text-3xl font-bold">
                            ₹{Number(product.sellingPrice).toFixed(2)}
                        </p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert">
                        <p>{product.description}</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                        <div className="flex flex-row gap-6">
                            <div className="w-auto">
                                <label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">Size</label>
                                <div className="flex flex-wrap gap-2">
                                    {product.availableSizes ? (
                                        product.availableSizes.split(",").map((size: string) => (
                                            <div key={size} className="h-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/50 text-sm">
                                                {size.trim()}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/50 text-sm">
                                            One Size
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-auto">
                                <label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {product.availableColors ? (
                                        product.availableColors.split(",").map((color: string) => (
                                            <div key={color} className="h-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/50 text-sm">
                                                {color.trim()}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-10 px-4 border rounded-md flex items-center justify-center font-medium bg-muted/50 text-sm">
                                            Standard
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <AddToCartButton productId={product.id} />
                            <Button variant="outline" size="lg">Wishlist</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
