import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, DotsThree, Pencil, Trash, Star, Package } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MyListings() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await axios.get(`${API}/items/my-listings`);
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await axios.delete(`${API}/items/${deleteId}`);
            setItems(items.filter(item => item.id !== deleteId));
            toast.success('Item deleted successfully');
        } catch (error) {
            toast.error('Failed to delete item');
        } finally {
            setDeleteId(null);
        }
    };

    const toggleAvailability = async (itemId, currentStatus) => {
        try {
            await axios.put(`${API}/items/${itemId}`, {
                is_available: !currentStatus
            });
            setItems(items.map(item =>
                item.id === itemId ? { ...item, is_available: !currentStatus } : item
            ));
            toast.success(currentStatus ? 'Item marked as unavailable' : 'Item is now available');
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    return (
        <div className="space-y-6" data-testid="my-listings-page">
            <div className="rounded-[2rem] border border-border/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="section-kicker">Listings</p>
                        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em]">My Listings</h1>
                        <p className="mt-2 text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'} listed</p>
                    </div>
                    <Link to="/dashboard/add-item">
                        <Button className="gap-2 rounded-full px-5" data-testid="add-new-item-button">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse overflow-hidden rounded-[1.5rem] border border-border/70 bg-white dark:bg-card">
                            <div className="aspect-[4/3] bg-muted" />
                            <CardContent className="p-5">
                                <div className="h-4 w-3/4 rounded bg-muted" />
                                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                            <Card className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card" data-testid={`listing-card-${item.id}`}>
                                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                    {item.images?.[0] ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                            No image
                                        </div>
                                    )}
                                    <Badge variant="secondary" className={`absolute right-3 top-3 rounded-full px-3 py-1 ${item.type === 'rent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                        {item.type === 'rent' ? 'For Rent' : 'For Sale'}
                                    </Badge>
                                    <Badge variant="secondary" className={`absolute left-3 top-3 rounded-full px-3 py-1 ${item.is_available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {item.is_available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                </div>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-heading text-lg font-semibold tracking-[-0.03em]">{item.title}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                    {item.type === 'sell' ? `INR ${item.price ?? 0}` : `INR ${item.rentDetails?.pricePerDay ?? item.price_per_day ?? 0}/day`}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-amber-500" weight="fill" />
                                                    {item.avg_rating?.toFixed(1) || '0.0'}
                                                </span>
                                            </div>
                                            {item.type === 'rent' && (
                                                <p className="mt-1 text-xs font-medium text-muted-foreground">
                                                    {(item.rentRequests || []).some((request) => request.status === 'approved')
                                                        ? 'Rented'
                                                        : (item.rentRequests || []).some((request) => request.status === 'pending') || item.rentDetails?.isAvailable === false
                                                            ? 'Requested'
                                                            : 'Available'}
                                                </p>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" data-testid={`listing-menu-${item.id}`}>
                                                    <DotsThree className="h-5 w-5" weight="bold" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/dashboard/edit-item/${item.id}`} className="flex items-center" data-testid={`edit-item-${item.id}`}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleAvailability(item.id, item.is_available)}>
                                                    <Package className="mr-2 h-4 w-4" />
                                                    {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-destructive" data-testid={`delete-item-${item.id}`}>
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[1.5rem] border border-border/70 bg-white p-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card" data-testid="no-listings-message">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-heading text-lg font-semibold">No listings yet</h3>
                    <p className="mb-4 text-muted-foreground">Start earning by listing your first item</p>
                    <Link to="/dashboard/add-item">
                        <Button className="gap-2 rounded-full px-5">
                            <Plus className="h-4 w-4" />
                            Add Your First Item
                        </Button>
                    </Link>
                </Card>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The item will be permanently removed from your listings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="confirm-delete-button">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
