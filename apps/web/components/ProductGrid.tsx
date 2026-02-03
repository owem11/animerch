"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Product {
    id: number;
    title: string;
    sellingPrice: string;
    description: string;
    category: string;
    rating: string;
    imageUrl: string;
}

export function ProductGrid({ products }: { products: Product[] }) {
    const [showAll, setShowAll] = useState(false);
    const initialCount = 8; // 2 rows of 4 (on large screens)
    const displayedProducts = showAll ? products : products.slice(0, initialCount);

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} price={product.sellingPrice} />
                ))}
            </div>

            {products.length > initialCount && (
                <div className="flex justify-center relative">
                    <div className="absolute inset-x-0 h-px top-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowAll(!showAll)}
                        className="group relative bg-background border-primary/20 hover:border-primary px-8 rounded-full"
                    >
                        {showAll ? (
                            <span className="flex items-center gap-2">Show Less <ChevronUp className="h-4 w-4" /></span>
                        ) : (
                            <span className="flex items-center gap-2">View All Products <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" /></span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
