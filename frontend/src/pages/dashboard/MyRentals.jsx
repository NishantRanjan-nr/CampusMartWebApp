import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, CalendarBlank, Check, X } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export default function MyRentals() {
    const { user } = useAuth();
    const [myRentals, setMyRentals] = useState([]);
    const [incomingBookings, setIncomingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewOpen, setReviewOpen] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const [rentalsRes, incomingRes] = await Promise.all([
                axios.get(`${API}/bookings/my-rentals`),
                axios.get(`${API}/bookings/incoming`)
            ]);
            setMyRentals(rentalsRes.data);
            setIncomingBookings(incomingRes.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, status) => {
        try {
            await axios.put(`${API}/bookings/${bookingId}/status`, { status });
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to update booking');
        }
    };

    const handleSubmitReview = async (booking) => {
        if (!reviewComment.trim()) {
            toast.error('Please add a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            await axios.post(`${API}/reviews`, {
                item_id: booking.item_id,
                booking_id: booking.id,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success('Review submitted!');
            setReviewOpen(null);
            setReviewRating(5);
            setReviewComment('');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const BookingCard = ({ booking, isOwner }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Card data-testid={`booking-card-${booking.id}`}>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        {/* Item Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                                src={booking.item_image || 'https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=200'}
                                alt={booking.item_title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-heading font-semibold truncate">{booking.item_title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isOwner ? `Rented by ${booking.renter_name}` : `From ${booking.owner_name}`}
                                    </p>
                                </div>
                                <Badge variant="secondary" className={statusColors[booking.status]}>
                                    {booking.status}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <CalendarBlank className="w-4 h-4" />
                                    {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
                                </span>
                                <span className="font-medium text-foreground">
                                    ₹{booking.total_price.toFixed(2)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                                {isOwner && booking.status === 'pending' && (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                            className="gap-1"
                                            data-testid={`confirm-booking-${booking.id}`}
                                        >
                                            <Check className="w-4 h-4" />
                                            Confirm
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                            className="gap-1"
                                            data-testid={`decline-booking-${booking.id}`}
                                        >
                                            <X className="w-4 h-4" />
                                            Decline
                                        </Button>
                                    </>
                                )}

                                {isOwner && booking.status === 'confirmed' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateBookingStatus(booking.id, 'active')}
                                        data-testid={`start-rental-${booking.id}`}
                                    >
                                        Start Rental
                                    </Button>
                                )}

                                {isOwner && booking.status === 'active' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                                        data-testid={`complete-rental-${booking.id}`}
                                    >
                                        Mark Complete
                                    </Button>
                                )}

                                {!isOwner && booking.status === 'completed' && (
                                    <Dialog open={reviewOpen === booking.id} onOpenChange={(open) => setReviewOpen(open ? booking.id : null)}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="gap-1" data-testid={`review-button-${booking.id}`}>
                                                <Star className="w-4 h-4" />
                                                Leave Review
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Review {booking.item_title}</DialogTitle>
                                                <DialogDescription>
                                                    Share your experience with this rental
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Rating</label>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setReviewRating(star)}
                                                                className="p-1"
                                                                data-testid={`rating-star-${star}`}
                                                            >
                                                                <Star
                                                                    className={`w-8 h-8 transition-colors ${star <= reviewRating ? 'text-amber-500' : 'text-muted'}`}
                                                                    weight={star <= reviewRating ? 'fill' : 'regular'}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Comment</label>
                                                    <Textarea
                                                        placeholder="How was your experience?"
                                                        value={reviewComment}
                                                        onChange={(e) => setReviewComment(e.target.value)}
                                                        rows={3}
                                                        data-testid="review-comment-textarea"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setReviewOpen(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSubmitReview(booking)}
                                                        disabled={submittingReview}
                                                        data-testid="submit-review-button"
                                                    >
                                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {!isOwner && booking.status === 'pending' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                        data-testid={`cancel-booking-${booking.id}`}
                                    >
                                        Cancel Request
                                    </Button>
                                )}

                                <Link to={`/dashboard/messages/${isOwner ? booking.renter_id : booking.owner_id}`}>
                                    <Button size="sm" variant="ghost">
                                        Message
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="space-y-6" data-testid="my-rentals-page">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight">My Rentals</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your bookings and rental requests
                </p>
            </div>

            <Tabs defaultValue="renting" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="renting" data-testid="renting-tab">
                        Items I'm Renting ({myRentals.length})
                    </TabsTrigger>
                    <TabsTrigger value="incoming" data-testid="incoming-tab">
                        Incoming Requests ({incomingBookings.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="renting" className="mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="w-24 h-24 bg-muted rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-1/2" />
                                            <div className="h-3 bg-muted rounded w-1/3" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : myRentals.length > 0 ? (
                        <div className="space-y-4">
                            {myRentals.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} isOwner={false} />
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center" data-testid="no-rentals-message">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-heading font-semibold text-lg mb-2">No rentals yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Browse the marketplace to find items to rent
                            </p>
                            <Link to="/browse">
                                <Button>Browse Items</Button>
                            </Link>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="incoming" className="mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="w-24 h-24 bg-muted rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-1/2" />
                                            <div className="h-3 bg-muted rounded w-1/3" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : incomingBookings.length > 0 ? (
                        <div className="space-y-4">
                            {incomingBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} isOwner={true} />
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center" data-testid="no-incoming-message">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-heading font-semibold text-lg mb-2">No booking requests</h3>
                            <p className="text-muted-foreground mb-4">
                                Requests for your listings will appear here
                            </p>
                            <Link to="/dashboard/add-item">
                                <Button>Add a Listing</Button>
                            </Link>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
