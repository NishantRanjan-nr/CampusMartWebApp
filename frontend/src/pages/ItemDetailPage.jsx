import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Star } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { getListingId } from '../lib/listing';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

export default function ItemDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [item, setItem] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchItem = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`${API}/items/${id}`);
                if (isMounted) {
                    const itemData = response.data;
                    setItem(itemData);
                    setActiveImage(0);

                    if (itemData?.owner_id) {
                        try {
                            const sellerResponse = await axios.get(`${API}/users/${itemData.owner_id}`);
                            if (isMounted) {
                                setSeller(sellerResponse.data);
                            }
                        } catch (sellerError) {
                            if (isMounted) {
                                setSeller(null);
                            }
                        }
                    } else if (isMounted) {
                        setSeller(null);
                    }
                }
            } catch (fetchError) {
                if (!isMounted) return;

                if (fetchError.response?.status === 404) {
                    setError('Item not found.');
                } else {
                    setError('Could not load this item right now.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchItem();
        } else {
            setLoading(false);
            setError('Invalid item link.');
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
    const primaryImage = images[activeImage] || images[0] || '';
    const price = item?.price ?? item?.rentDetails?.pricePerDay ?? item?.price_per_day ?? 0;
    const sellerName = seller?.name || item?.owner_name || 'Seller';
    const sellerCollege = seller?.college || item?.owner_college || 'Not set';
    const sellerCourse = seller?.course || item?.owner_course || 'Not set';
    const sellerInitial = sellerName?.charAt?.(0)?.toUpperCase() || 'S';
    const canChatWithSeller = Boolean(item?.owner_id && user?.id !== item.owner_id);

    if (loading) {
        return (
            <div className="min-h-screen py-8 lg:py-12">
                <div className="section-shell">
                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        <Card className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white dark:bg-card">
                            <div className="aspect-[4/3] animate-pulse bg-muted" />
                            <CardContent className="space-y-4 p-6">
                                <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                                <div className="h-24 w-full animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card className="h-fit rounded-[1.5rem] border border-border/70 bg-white p-6 dark:bg-card">
                                <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
                                <div className="mt-6 h-24 w-full animate-pulse rounded bg-muted" />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-8 lg:py-12">
                <div className="section-shell">
                    <Card className="mx-auto max-w-2xl rounded-[1.5rem] border border-border/70 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                        <h1 className="font-heading text-2xl font-semibold tracking-[-0.04em]">{error}</h1>
                        <p className="mt-3 text-muted-foreground">Head back to the marketplace and continue browsing listings.</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Button onClick={() => navigate('/browse')} className="rounded-full">Back to Browse</Button>
                            <Button variant="outline" asChild className="rounded-full">
                                <Link to="/">Go Home</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 lg:py-12" data-testid="item-detail-page">
            <div className="section-shell">
                <Button variant="ghost" className="mb-6 gap-2 px-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <Card className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                            <div className="aspect-[4/3] bg-muted">
                                {primaryImage ? (
                                    <img
                                        src={primaryImage}
                                        alt={item?.title || 'Item image'}
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        No image available
                                    </div>
                                )}
                            </div>

                            {images.length > 1 && (
                                <CardContent className="flex gap-3 overflow-x-auto p-4">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${getListingId(item)}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImage(index)}
                                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border transition ${activeImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-border/70'}`}
                                        >
                                            <img src={image} alt={`${item?.title || 'Item'} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-6">
                        <Card className="rounded-[1.5rem] border border-border/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <Badge className="mb-3 rounded-full px-3 py-1">Marketplace Item</Badge>
                                    <h1 className="font-heading text-3xl font-semibold tracking-[-0.05em] lg:text-4xl">{item?.title}</h1>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {item?.location || 'Campus marketplace'}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-500" weight="fill" />
                                    {item?.avg_rating?.toFixed?.(1) || '0.0'} rating
                                </span>
                            </div>

                            <div className="mt-6 rounded-[1.5rem] bg-muted p-5">
                                <div className="text-sm font-medium text-muted-foreground">Price</div>
                                <div className="mt-1 text-3xl font-heading font-semibold tracking-[-0.04em] text-foreground">
                                    {formatCurrency(price)}
                                    {item?.type === 'rent' ? '/day' : ''}
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <h2 className="text-lg font-semibold">Description</h2>
                                <p className="text-sm leading-7 text-muted-foreground">{item?.description || 'No description provided by the seller.'}</p>
                            </div>
                        </Card>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Card className="rounded-[1.5rem] border border-border/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                                <h2 className="text-base font-semibold">Listing details</h2>
                                <div className="mt-4 grid gap-4">
                                    <div className="rounded-2xl border border-border/70 p-4">
                                        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Item ID</div>
                                        <div className="mt-2 break-all text-sm font-medium">{getListingId(item)}</div>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 p-4">
                                        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Availability</div>
                                        <div className="mt-2 text-sm font-medium">{item?.is_available === false ? 'Unavailable' : 'Available'}</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-[1.5rem] border border-border/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                                <h2 className="text-base font-semibold">Seller details</h2>
                                <div className="mt-4 flex items-start gap-4 rounded-2xl border border-border/70 p-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                                        {sellerInitial}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-base font-medium">{sellerName}</div>
                                        <div className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">College:</span> {sellerCollege}</div>
                                        <div className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Course:</span> {sellerCourse}</div>
                                        <div className="mt-4">
                                            {isAuthenticated ? (
                                                canChatWithSeller ? (
                                                    <Button onClick={() => navigate(`/chat/${id}`)} className="w-full rounded-full sm:w-auto">Chat with Seller</Button>
                                                ) : (
                                                    <Button variant="outline" disabled className="w-full rounded-full sm:w-auto">This is your listing</Button>
                                                )
                                            ) : (
                                                <Button asChild className="w-full rounded-full sm:w-auto">
                                                    <Link to="/auth">Sign in to chat</Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}