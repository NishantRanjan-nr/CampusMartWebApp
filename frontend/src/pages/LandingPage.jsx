import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    MagnifyingGlass,
    ArrowRight,
    Laptop,
    TShirt,
    Star,
    MapPin,
    Shield,
    Handshake,
    Sparkle
} from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
    {
        id: 'electronics',
        name: 'Electronics',
        icon: Laptop,
        image: 'https://images.pexels.com/photos/3184451/pexels-photo-3184451.jpeg',
        description: 'Laptops, cameras, gaming gear'
    },
    {
        id: 'clothes',
        name: 'Clothes',
        icon: TShirt,
        image: 'https://images.pexels.com/photos/5698856/pexels-photo-5698856.jpeg',
        description: 'Formal wear, streetwear, accessories'
    }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredItems, setFeaturedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedItems();
    }, []);

    const fetchFeaturedItems = async () => {
        try {
            const response = await axios.get(`${API}/items/featured`);
            setFeaturedItems(response.data);
        } catch (error) {
            console.error('Failed to fetch featured items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="min-h-screen" data-testid="landing-page">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center" data-testid="hero-section">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1758270704464-f980b03b9633?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBjYW1wdXMlMjBzb2NpYWxpemluZ3xlbnwwfHx8fDE3NzQ2MDE2MzZ8MA&ixlib=rb-4.1.0&q=85"
                        alt="Campus students"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm mb-6">
                                <Sparkle className="w-4 h-4" weight="fill" />
                                Student-to-Student Marketplace
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tighter mb-6"
                        >
                            Rent What You Need,<br />
                            <span className="text-accent">Share What You Have</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-white/80 mb-8 max-w-lg"
                        >
                            CampusMart connects students for affordable rentals. From electronics to event outfits, find what you need or earn from what you own.
                        </motion.p>

                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            onSubmit={handleSearch}
                            className="flex gap-3 max-w-md"
                        >
                            <div className="relative flex-1">
                                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search electronics, clothes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
                                    className="pl-12 h-12 bg-white border-0 text-black placeholder:text-slate-500"
=======
                                    className="pl-12 h-12 bg-white border-0 text-foreground"
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
                                    data-testid="hero-search-input"
                                />
                            </div>
                            <Button type="submit" size="lg" className="h-12 px-6" data-testid="hero-search-button">
                                Search
                            </Button>
                        </motion.form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex items-center gap-6 mt-8 text-white/60 text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Verified Students
                            </span>
                            <span className="flex items-center gap-2">
                                <Handshake className="w-4 h-4" />
                                Secure Deposits
                            </span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 lg:py-24 bg-background" data-testid="categories-section">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-4">
                            Browse Categories
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Find exactly what you need for campus life
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link to={`/browse?category=${category.id}`} data-testid={`category-${category.id}`}>
                                    <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                        <category.icon className="w-6 h-6 text-white" weight="bold" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-heading font-bold text-white">{category.name}</h3>
                                                        <p className="text-white/70 text-sm">{category.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Items Section */}
            <section className="py-16 lg:py-24 bg-muted/50" data-testid="featured-section">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                                Featured Listings
                            </h2>
                            <p className="text-muted-foreground">
                                Top-rated items from verified students
                            </p>
                        </div>
                        <Link to="/browse" data-testid="view-all-link">
                            <Button variant="outline" className="gap-2">
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="aspect-square bg-muted" />
                                    <CardContent className="p-4">
                                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : featuredItems.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Link to={`/item/${item.id}`} data-testid={`featured-item-${item.id}`}>
                                        <Card className="group overflow-hidden card-hover">
                                            <div className="aspect-square overflow-hidden bg-muted">
                                                <img
                                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=400'}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-heading font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-sm">
<<<<<<< HEAD
                                                    <span className="font-bold text-primary">₹{item.price_per_day}/day</span>
=======
                                                    <span className="font-bold text-primary">${item.price_per_day}/day</span>
>>>>>>> c5cc4d47a8b9320b68eaa3a56c0bc2ac66377a5a
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Star className="w-4 h-4 text-amber-500" weight="fill" />
                                                        <span>{item.avg_rating?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{item.location}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <p className="text-muted-foreground">No featured items yet. Be the first to list!</p>
                            <Link to="/dashboard/add-item" className="mt-4 inline-block">
                                <Button>List Your Item</Button>
                            </Link>
                        </Card>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24 bg-primary" data-testid="cta-section">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary-foreground tracking-tight mb-4">
                            Ready to Start Earning?
                        </h2>
                        <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
                            Turn your unused items into cash. List for free and start renting today.
                        </p>
                        <Link to="/dashboard/add-item" data-testid="cta-list-item">
                            <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                                List Your First Item
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
