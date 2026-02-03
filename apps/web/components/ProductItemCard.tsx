import Link from "next/link";

interface ProductItemCardProps {
    productId: number;
    productTitle: string;
    productImage: string;
    price: string | number;
    quantity: number;
    showViewDetails?: boolean;
    actionButton?: React.ReactNode;
}

export function ProductItemCard({
    productId,
    productTitle,
    productImage,
    price,
    quantity,
    showViewDetails = true,
    actionButton
}: ProductItemCardProps) {
    return (
        <div className="flex items-center gap-4">
            <Link
                href={`/product/${productId}`}
                className="h-16 w-16 bg-white rounded-md border flex-shrink-0 overflow-hidden block"
            >
                {productImage && (
                    <img
                        src={productImage}
                        alt={productTitle}
                        className="h-full w-full object-cover hover:scale-105 transition-transform"
                    />
                )}
            </Link>
            <div className="flex-1">
                <Link
                    href={`/product/${productId}`}
                    className="font-medium hover:text-primary transition-colors block"
                >
                    {productTitle}
                </Link>
                {showViewDetails && (
                    <Link
                        href={`/product/${productId}`}
                        className="text-xs font-medium text-primary underline underline-offset-4 mb-1 inline-block"
                    >
                        View Details
                    </Link>
                )}
                <p className="text-sm text-muted-foreground">
                    Qty: {quantity} × ₹{Number(price).toFixed(2)}
                </p>
            </div>
            {actionButton && <div>{actionButton}</div>}
        </div>
    );
}
