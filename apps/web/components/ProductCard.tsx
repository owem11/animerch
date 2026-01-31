
import Link from "next/link";
import { Star } from "lucide-react";

interface ProductCardProps {
    id: number;
    title: string;
    price: string | number;
    imageUrl: string;
    category: string;
    rating: string | number;
}

export function ProductCard({ id, title, price, imageUrl, category, rating }: ProductCardProps) {
    return (
        <Link href={`/product/${id}`} className="group block h-full">
            <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                        src={imageUrl || "https://placehold.co/400"}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow">
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
                        <span>{category}</span>
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>{rating}</span>
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary/80 transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="text-xl font-bold">${Number(price).toFixed(2)}</span>
                        <span className="text-xs font-medium text-primary underline underline-offset-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
