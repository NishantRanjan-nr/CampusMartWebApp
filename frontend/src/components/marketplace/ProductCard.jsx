
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Star } from '@phosphor-icons/react';
import { getListingId } from '../../lib/listing';

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
    const navigate = useNavigate();
    const itemId = getListingId(product);
    const isRent = product.type === 'rent';
    const requestStatus = getRequestStatus(product, currentUserId);
    const primaryPrice = isRent
        ? product.rentDetails?.pricePerDay ?? product.price_per_day ?? 0
        : product.price ?? 0;
    const imageSrc = product.images?.[0];

    const openItemDetail = () => {
        if (itemId) {
            navigate(`/item/${itemId}`);
        }
    };

    const handleCardKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openItemDetail();
        }
    };

    const stopCardNavigation = (action) => (event) => {
        event.stopPropagation();
        action(product);
    };

    return (
        <Card
            className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:bg-card dark:shadow-none"
            onClick={openItemDetail}
            onKeyDown={handleCardKeyDown}
            role="link"
            tabIndex={0}
            aria-label={`View details for ${product.title}`}
            data-testid={`product-card-${itemId}`}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(event) => {
                            event.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        No image
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/65 to-transparent" />
                <Badge className={`absolute left-4 top-4 rounded-full px-3 py-1 ${isRent ? 'bg-white/90 text-slate-950' : 'bg-slate-950/85 text-white'}`}>
                    {isRent ? 'For Rent' : 'For Sale'}
                </Badge>
            </div>

            <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                    <h3 className="line-clamp-1 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">{product.title}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-foreground">
                        {isRent ? `INR ${primaryPrice}/day` : `INR ${primaryPrice}`}
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500" weight="fill" />
                        <span>{product.avg_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{product.location}</span>
                </div>

                {requestStatus && (
                    <div className={`text-xs font-medium ${requestStatus.className}`} data-testid={`request-status-${itemId}`}>
                        {requestStatus.label}
                    </div>
                )}

                {isRent ? (
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            className="w-full rounded-full"
                            variant="default"
                            onClick={stopCardNavigation(onBuyNow)}
                            data-testid={`buy-action-${itemId}`}
                            type="button"
                        >
                            Buy
                        </Button>
                        <Button
                            className="w-full rounded-full"
                            variant="outline"
                            onClick={stopCardNavigation(onRequestRent)}
                            data-testid={`rent-action-${itemId}`}
                            type="button"
                        >
                            Rent
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full rounded-full"
                        variant="default"
                        onClick={stopCardNavigation(onBuyNow)}
                        data-testid={`buy-action-${itemId}`}
                        type="button"
                    >
                        Buy Now
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
