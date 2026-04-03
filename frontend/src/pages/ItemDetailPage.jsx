import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from '@phosphor-icons/react';
=======
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { format, differenceInDays, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Star,
    MapPin,
    User,
    CalendarBlank,
    ShieldCheck,
    ChatCircle,
    ArrowLeft,
    Heart,
    Share
} from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a

export default function ItemDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
<<<<<<< HEAD
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`https://fakestoreapi.com/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
=======
    const { isAuthenticated, user } = useAuth();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        fetchItem();
        fetchReviews();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await axios.get(`${API}/items/${id}`);
            setItem(response.data);
        } catch (error) {
            console.error('Failed to fetch item:', error);
            toast.error('Item not found');
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
            navigate('/browse');
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
=======
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${API}/reviews/item/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const calculateTotal = () => {
        if (!dateRange.from || !dateRange.to || !item) return { days: 0, total: 0 };
        const days = Math.max(1, differenceInDays(dateRange.to, dateRange.from));
        const total = days * item.price_per_day;
        return { days, total };
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to book');
            navigate('/auth');
            return;
        }

        if (!dateRange.from || !dateRange.to) {
            toast.error('Please select rental dates');
            return;
        }

        if (item.owner_id === user.id) {
            toast.error("You can't book your own item");
            return;
        }

        setBookingLoading(true);
        try {
            await axios.post(`${API}/bookings`, {
                item_id: id,
                start_date: dateRange.from.toISOString(),
                end_date: dateRange.to.toISOString()
            });
            toast.success('Booking request sent!');
            navigate('/dashboard/rentals');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create booking');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to send a message');
            navigate('/auth');
            return;
        }

        if (!messageContent.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setSendingMessage(true);
        try {
            await axios.post(`${API}/messages`, {
                receiver_id: item.owner_id,
                content: messageContent,
                item_id: id
            });
            toast.success('Message sent!');
            setMessageOpen(false);
            setMessageContent('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

<<<<<<< HEAD
    if (!product) return null;
=======
    if (!item) return null;

    const { days, total } = calculateTotal();
    const isOwner = user?.id === item.owner_id;
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a

    return (
        <div className="min-h-screen bg-background py-6 lg:py-10" data-testid="item-detail-page">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 gap-2"
                    data-testid="back-button"
                >
                    <ArrowLeft className="w-4 h-4" />
<<<<<<< HEAD
                    Back to Browse
                </Button>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image */}
=======
                    Back
                </Button>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
<<<<<<< HEAD
                        <Card className="overflow-hidden">
                            <div className="aspect-square bg-white p-8">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                    data-testid="product-image"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Product Details */}
=======
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square rounded-2xl overflow-hidden bg-muted" data-testid="main-image">
                                <img
                                    src={item.images?.[selectedImage] || 'https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=800'}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Thumbnails */}
                            {item.images && item.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {item.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden gallery-thumb ${selectedImage === idx ? 'active' : ''}`}
                                            data-testid={`thumbnail-${idx}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Item Details */}
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-6"
                    >
<<<<<<< HEAD
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-foreground mb-2" data-testid="product-title">
                                {product.title}
                            </h1>
                            <p className="text-sm text-muted-foreground capitalize" data-testid="product-category">
                                {product.category}
                            </p>
                        </div>

                        <div className="text-4xl font-bold text-primary" data-testid="product-price">
                            ₹{product.price.toFixed(2)}
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-heading font-semibold mb-3">Description</h3>
                                <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
                                    {product.description}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button className="flex-1 gap-2" size="lg" data-testid="add-to-cart-button">
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </Button>
                        </div>
                    </motion.div>
                </div>
=======
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium capitalize">
                                    {item.category}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                    {item.condition}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-2" data-testid="item-title">
                                {item.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-500" weight="fill" />
                                    <span className="font-medium text-foreground">{item.avg_rating?.toFixed(1) || '0.0'}</span>
                                    <span>({item.review_count || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{item.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-heading font-bold text-primary" data-testid="item-price">
                                ${item.price_per_day}
                            </span>
                            <span className="text-muted-foreground">/ day</span>
                            <span className="ml-4 text-sm text-muted-foreground">
                                + ${item.deposit} deposit
                            </span>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <h3 className="font-heading font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed" data-testid="item-description">
                                {item.description}
                            </p>
                            {item.size && (
                                <p className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Size:</span> {item.size}
                                </p>
                            )}
                        </div>

                        {/* Owner Info */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                            <span className="text-lg font-medium text-primary-foreground">
                                                {item.owner_name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{item.owner_name}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                                Verified Student
                                            </p>
                                        </div>
                                    </div>
                                    {!isOwner && (
                                        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2" data-testid="contact-owner-button">
                                                    <ChatCircle className="w-4 h-4" />
                                                    Contact
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Message {item.owner_name}</DialogTitle>
                                                    <DialogDescription>
                                                        Send a message about {item.title}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 mt-4">
                                                    <Textarea
                                                        placeholder="Hi! I'm interested in renting this item..."
                                                        value={messageContent}
                                                        onChange={(e) => setMessageContent(e.target.value)}
                                                        rows={4}
                                                        data-testid="message-textarea"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" onClick={() => setMessageOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={handleSendMessage}
                                                            disabled={sendingMessage}
                                                            data-testid="send-message-button"
                                                        >
                                                            {sendingMessage ? 'Sending...' : 'Send Message'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking Card */}
                        {!isOwner && (
                            <Card className="border-primary/20" data-testid="booking-card">
                                <CardHeader>
                                    <CardTitle className="text-lg">Book This Item</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Select Dates</label>
                                        <Calendar
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            disabled={(date) => date < new Date()}
                                            className="rounded-md border"
                                            data-testid="booking-calendar"
                                        />
                                    </div>

                                    {dateRange.from && dateRange.to && (
                                        <div className="bg-muted rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Rental ({days} {days === 1 ? 'day' : 'days'})</span>
                                                <span>${total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Deposit (refundable)</span>
                                                <span>${item.deposit.toFixed(2)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-semibold">
                                                <span>Total</span>
                                                <span>${(total + item.deposit).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleBooking}
                                        disabled={bookingLoading || !dateRange.from || !dateRange.to}
                                        data-testid="book-now-button"
                                    >
                                        {bookingLoading ? 'Processing...' : 'Book Now'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {isOwner && (
                            <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-900/10">
                                <CardContent className="p-4">
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        This is your listing. You can edit it from your dashboard.
                                    </p>
                                    <Link to={`/dashboard/edit-item/${id}`}>
                                        <Button variant="outline" className="mt-3" data-testid="edit-listing-button">
                                            Edit Listing
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <section className="mt-12 lg:mt-16" data-testid="reviews-section">
                    <h2 className="text-xl sm:text-2xl font-heading font-bold mb-6">
                        Reviews ({reviews.length})
                    </h2>

                    {reviews.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <Card key={review.id} data-testid={`review-${review.id}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium">
                                                    {review.reviewer_name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">{review.reviewer_name}</span>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-500' : 'text-muted'}`}
                                                                weight={i < review.rating ? 'fill' : 'regular'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No reviews yet. Be the first to rent and review!</p>
                        </Card>
                    )}
                </section>
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
            </div>
        </div>
    );
}
