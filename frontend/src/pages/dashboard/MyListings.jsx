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
import { Plus, DotsThree, Pencil, Trash, Eye, Star, Package } from '@phosphor-icons/react';

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold tracking-tight">My Listings</h1>
                    <p className="text-muted-foreground mt-1">
                        {items.length} {items.length === 1 ? 'item' : 'items'} listed
                    </p>
                </div>
                <Link to="/dashboard/add-item">
                    <Button className="gap-2" data-testid="add-new-item-button">
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                </Link>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-video bg-muted" />
                            <CardContent className="p-4">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="overflow-hidden" data-testid={`listing-card-${item.id}`}>
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                    <img
                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=400'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <Badge
                                        variant="secondary"
                                        className={`absolute top-3 left-3 ${item.is_available
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                    >
                                        {item.is_available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-heading font-semibold truncate">{item.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                <span className="font-medium text-primary">${item.price_per_day}/day</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500" weight="fill" />
                                                    {item.avg_rating?.toFixed(1) || '0.0'}
                                                </span>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`listing-menu-${item.id}`}>
                                                    <DotsThree className="w-5 h-5" weight="bold" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/item/${item.id}`} className="flex items-center">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/dashboard/edit-item/${item.id}`} className="flex items-center" data-testid={`edit-item-${item.id}`}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => toggleAvailability(item.id, item.is_available)}
                                                >
                                                    <Package className="w-4 h-4 mr-2" />
                                                    {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="text-destructive"
                                                    data-testid={`delete-item-${item.id}`}
                                                >
                                                    <Trash className="w-4 h-4 mr-2" />
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
                <Card className="p-12 text-center" data-testid="no-listings-message">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading font-semibold text-lg mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Start earning by listing your first item
                    </p>
                    <Link to="/dashboard/add-item">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Your First Item
                        </Button>
                    </Link>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
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
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid="confirm-delete-button"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
