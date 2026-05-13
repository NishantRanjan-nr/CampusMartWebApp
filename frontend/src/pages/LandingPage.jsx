import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Handshake, Laptop, MapPin, Shield, Sparkle, Star, TShirt } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { getListingId } from '../lib/listing';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
    {
        id: 'electronics',
        name: 'Electronics',
        icon: Laptop,
        image: 'https://images.pexels.com/photos/3184451/pexels-photo-3184451.jpeg',
        description: 'Laptops, cameras, gaming gear',
    },
    {
        id: 'clothes',
        name: 'Clothes',
        icon: TShirt,
        image: 'https://images.pexels.com/photos/5698856/pexels-photo-5698856.jpeg',
        description: 'Formal wear, streetwear, accessories',
    },
    {
        id: 'books',
        name: 'Books',
        icon: BookOpen,
        image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
        description: 'Textbooks, novels, and study material',
    },
];

const discoverStats = [
    { value: '2k+', label: 'student listings' },
    { value: '4.8/5', label: 'average trust score' },
    { value: '24h', label: 'typical response time' },
];

const browsePills = [
    { label: 'Electronics', to: '/browse?category=electronics' },
    { label: 'Clothes', to: '/browse?category=clothes' },
    { label: 'Books', to: '/browse?category=books' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredItems, setFeaturedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchFeaturedItems();
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-background" data-testid="landing-page">
            <section className="relative isolate overflow-hidden min-h-[720px] lg:min-h-[640px]" data-testid="hero-section">
                <div className="absolute inset-0 -z-10 h-full w-full">
                    <img
                        src="https://images.unsplash.com/photo-1758270704464-f980b03b9633?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBjYW1wdXMlMjBzb2NpYWxpemluZ3xlbnwwfHx8fDE3NzQ2MDE2MzZ8MA&ixlib=rb-4.1.0&q=85"
                        alt="Campus students"
                        className="h-full w-full object-cover filter blur-sm brightness-75 saturate-75"
                    />
                    <div className="absolute inset-0 hero-overlay" />
                </div>
                <div className="section-shell relative z-10 py-12 lg:py-16 flex items-center justify-center min-h-[inherit]">
                    <div className="mx-auto max-w-2xl w-full text-center text-white">
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-xs font-semibold text-white/95 backdrop-blur-lg">
                            <Sparkle className="h-3.5 w-3.5 text-amber-200" weight="fill" />
                            Premium student marketplace
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="mt-6 space-y-4">
                            <h1 className="text-4xl font-heading font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                                Rent what you need.
                                <span className="block">Share what you own.</span>
                            </h1>
                            <p className="text-base leading-7 text-white/80 sm:text-lg mx-auto max-w-lg">
                                A premium, student-first marketplace for essentials, event wear, and textbooks. Search faster, rent smarter.
                            </p>
                        </motion.div>

                        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} onSubmit={handleSearch} className="mt-7 rounded-2xl border border-white/20 bg-white/12 p-3 backdrop-blur-xl shadow-2xl shadow-black/20">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <ArrowRight className="sr-only" />
                                    <Input
                                        type="text"
                                        placeholder="Search laptops, jackets, books..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-13 border-0 bg-white bg-opacity-95 pl-4 pr-2 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-0 rounded-xl"
                                        data-testid="hero-search-input"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-13 rounded-full px-7 text-sm font-semibold" data-testid="hero-search-button">
                                    Search
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </motion.form>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="mt-5 flex flex-wrap gap-2 justify-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-lg">
                                <Shield className="h-3.5 w-3.5" />
                                Verified students
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-lg">
                                <Star className="h-3.5 w-3.5 text-amber-300" weight="fill" />
                                Trusted listings
                            </span>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-20 lg:py-24 bg-slate-50/50 dark:bg-slate-950/30" data-testid="categories-section">
                <div className="section-shell">
                        <div className="mx-auto mb-10 max-w-2xl text-center">
                            <p className="section-kicker">Categories</p>
                            <h2 className="mt-4 section-title">Everything students need, in one place</h2>
                            <p className="mt-5 text-lg leading-8 text-muted-foreground">From gadgets to notes, discover categories designed for campus life.</p>
                        </div>

                    <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                        {categories.map((category, index) => (
                            <motion.div key={category.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }} viewport={{ once: true, amount: 0.25 }}>
                                <Link to={`/browse?category=${category.id}`} data-testid={`category-${category.id}`}>
                                    <Card className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)] dark:bg-card dark:shadow-none">
                                        <div className="relative h-72 overflow-hidden">
                                            <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

                                            <div className="absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/15 bg-white/12 p-4 text-white backdrop-blur-xl">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                                                        <category.icon className="h-6 w-6" weight="bold" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Category</div>
                                                        <h3 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.04em]">{category.name}</h3>
                                                        <p className="mt-2 text-sm leading-6 text-white/75">{category.description}</p>
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

            <section className="bg-slate-100 py-20 dark:bg-slate-950 dark:text-white" data-testid="featured-section">
                <div className="section-shell">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="section-kicker text-slate-500 dark:text-white/50">Featured Listings</p>
                            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Find what students actually want</h2>
                            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-white/70">Browse quality listings from your campus community without the clutter.</p>
                        </div>
                        <Link to="/browse" data-testid="view-all-link">
                            <Button variant="secondary" className="h-12 gap-2 rounded-full px-6 font-semibold dark:text-slate-950">
                                View all listings
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12">
                        {loading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i} className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                                        <div className="aspect-[4/5] animate-pulse bg-slate-200 dark:bg-white/10" />
                                        <CardContent className="p-5">
                                            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
                                            <div className="mt-3 h-4 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
                                            <div className="mt-4 h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : featuredItems.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredItems.map((item, index) => {
                                    const itemId = getListingId(item);

                                    return (
                                        <motion.div key={itemId || index} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }} viewport={{ once: true, amount: 0.2 }}>
                                            <Card className="group h-full cursor-pointer overflow-hidden rounded-[1.5rem] border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white transition-all duration-300 hover:-translate-y-1 dark:hover:bg-white/10 dark:hover:shadow-[0_24px_80px_rgba(15,23,42,0.28)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]" onClick={() => itemId && navigate(`/item/${itemId}`)} onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    if (itemId) navigate(`/item/${itemId}`);
                                                }
                                            }} role="link" tabIndex={0} aria-label={`View details for ${item.title}`} data-testid={`featured-item-${itemId}`}>
                                                <div className="aspect-[4/5] overflow-hidden bg-slate-200 dark:bg-white/10">
                                                    {item.images?.[0] ? (
                                                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(event) => {
                                                            event.currentTarget.style.display = 'none';
                                                        }} />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-300 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>
                                                <CardContent className="space-y-4 p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="line-clamp-2 font-heading text-lg font-semibold tracking-[-0.03em] transition-colors group-hover:text-slate-700 dark:group-hover:text-white/90">{item.title}</h3>
                                                        <div className="rounded-full border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-white/80">Featured</div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            {item.type === 'sell'
                                                                ? `INR ${item.price ?? 0}`
                                                                : `INR ${item.rentDetails?.pricePerDay ?? item.price_per_day ?? 0}/day`}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-slate-500 dark:text-white/70">
                                                            <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" weight="fill" />
                                                            <span>{item.avg_rating?.toFixed(1) || '0.0'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/55">
                                                        <MapPin className="h-4 w-4" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center text-slate-900 dark:text-white">
                                <p className="text-slate-500 dark:text-white/70">No featured items yet. Be the first to list.</p>
                                <Link to="/dashboard/add-item" className="mt-5 inline-block">
                                    <Button variant="secondary" className="rounded-full px-6 font-semibold text-slate-950 dark:text-slate-950">
                                        List your item
                                    </Button>
                                </Link>
                            </Card>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-20" data-testid="cta-section">
                <div className="section-shell">
                    <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-white px-6 py-12 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:px-10 lg:px-14 lg:py-16 dark:bg-card dark:shadow-none">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(248,250,252,1)_100%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />
                        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="max-w-2xl">
                                <p className="section-kicker">Start listing</p>
                                <h2 className="mt-4 section-title">Turn unused items into income, without friction.</h2>
                                <p className="mt-5 text-lg leading-8 text-muted-foreground">A focused listing flow helps students trust what they see and act faster. Put spare items in front of the right people today.</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} viewport={{ once: true }} className="flex flex-col gap-3">
                                <Link to="/dashboard/add-item" data-testid="cta-list-item">
                                    <Button size="lg" className="h-14 w-full rounded-full px-8 font-semibold sm:w-auto">
                                        List your first item
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link to="/browse" className="sm:self-end">
                                    <Button variant="outline" size="lg" className="h-14 w-full rounded-full border-border/70 px-8 font-semibold sm:w-auto">
                                        Browse the marketplace
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
