import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Star } from '@phosphor-icons/react';

function getRequestStatus(product, currentUserId) {
    const requests = product.requests || [];
    if (!requests.length) return null;

    const relevantRequest = currentUserId
        ? requests.find((request) => (request.buyerId || request.buyer_id) === currentUserId)
        : requests[0];

    if (!relevantRequest) return null;

    const normalizedStatus = relevantRequest.status;
    if (normalizedStatus === 'approved') {
        return { label: 'Approved', className: 'text-green-600 dark:text-green-400' };
    }
    if (normalizedStatus === 'rejected') {
        return { label: 'Rejected', className: 'text-red-600 dark:text-red-400' };
    }
    return { label: 'Pending Approval', className: 'text-amber-600 dark:text-amber-400' };
}

export default function ProductCard({ product, onRequestRent, onBuyNow, currentUserId }) {
    const isRent = product.type === 'rent';
    const requestStatus = getRequestStatus(product, currentUserId);
    const primaryPrice = isRent
        ? product.rentDetails?.pricePerDay ?? product.price_per_day ?? 0
        : product.price ?? 0;
    const imageSrc = product.images?.[0];

    return (
        <Card className="group overflow-hidden card-hover" data-testid={`product-card-${product.id}`}>
            <div className="aspect-square overflow-hidden bg-muted relative">
                <Link to={`/item/${product.id}`}>
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="listing"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                            No image
                        </div>
                    )}
                </Link>

                <Badge
                    className={`absolute top-3 left-3 ${
                        isRent
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                >
                    {isRent ? 'For Rent' : 'For Sale'}
                </Badge>
            </div>

            <CardContent className="p-4 space-y-3">
                <div>
                    <Link to={`/item/${product.id}`}>
                        <h3 className="font-heading font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {product.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                        {isRent ? `INR ${primaryPrice}/day` : `INR ${primaryPrice}`}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-amber-500" weight="fill" />
                        <span>{product.avg_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{product.location}</span>
                </div>

                {requestStatus && (
                    <div className={`text-xs font-medium ${requestStatus.className}`} data-testid={`request-status-${product.id}`}>
                        {requestStatus.label}
                    </div>
                )}

                {isRent ? (
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            className="w-full"
                            variant="default"
                            onClick={() => onBuyNow(product)}
                            data-testid={`buy-action-${product.id}`}
                        >
                            Buy Now
                        </Button>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => onRequestRent(product)}
                            data-testid={`rent-action-${product.id}`}
                        >
                            Rent
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full"
                        variant="default"
                        onClick={() => onBuyNow(product)}
                        data-testid={`buy-action-${product.id}`}
                    >
                        Buy Now
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
