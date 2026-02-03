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
            <div className="relative overflow-hidden rounded-xl border border-border/40 
                [.theme-retro_&]:border-black [.theme-retro_&]:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] [.theme-retro_&]:rounded-none 
                [.theme-cyber_&]:border-secondary/20 [.theme-cyber_&]:hover:border-secondary [.theme-cyber_&]:hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]
                bg-card text-card-foreground transition-all duration-500 h-full flex flex-col
                hover:-translate-y-2 hover:shadow-2xl hover:border-primary/20">
                <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                        src={imageUrl || "https://placehold.co/400"}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        <span>{category}</span>
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>{rating}</span>
                        </div>
                    </div>
                    <h3 className="font-heading text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
                        {title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-xl font-black tracking-tighter">₹{Number(price).toFixed(2)}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-white bg-primary px-3 py-1 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            View DETAILS
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
