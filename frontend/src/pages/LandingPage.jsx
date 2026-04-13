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
    BookOpen,
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
    },
    {
        id: 'books',
        name: 'Books',
        icon: BookOpen,
        image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
        description: 'Textbooks, novels, and study material'
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
        <div className="min-h-screen overflow-x-hidden bg-background" data-testid="landing-page">
            <section className="relative isolate overflow-hidden" data-testid="hero-section">
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(22,78,99,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,1)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(15,23,42,1)_100%)]" />
                <div className="absolute inset-0 -z-10 opacity-40 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] dark:opacity-20 dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />

                <div className="container mx-auto px-4 lg:px-8 pt-10 lg:pt-14 pb-16 lg:pb-24">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                            >
                                <Sparkle className="w-4 h-4 text-slate-900 dark:text-cyan-300" weight="fill" />
                                Premium student marketplace
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.05 }}
                                className="mt-8"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                                    CampusMart / curated rentals
                                </p>
                                <h1 className="mt-5 max-w-2xl text-5xl font-heading font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl lg:leading-[0.95] dark:text-white">
                                    Rent what you need.
                                    <span className="block text-gradient dark:text-cyan-300">Share what you own.</span>
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
                                    A premium, student-first marketplace for essentials, event wear, and textbooks. Search faster, rent smarter, and turn unused items into dependable income.
                                </p>
                            </motion.div>

                            <motion.form
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.12 }}
                                onSubmit={handleSearch}
                                className="mt-8 rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                    <div className="relative flex-1">
                                        <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            type="text"
                                            placeholder="Search laptops, jackets, books, cameras..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-14 border-0 bg-transparent pl-12 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-white dark:placeholder:text-slate-500"
                                            data-testid="hero-search-input"
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="h-14 rounded-2xl px-8 font-semibold" data-testid="hero-search-button">
                                        Search listings
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.form>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.2 }}
                                className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                            >
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <Shield className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                                    Verified students only
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <Handshake className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                                    Secure deposits and handoff
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <Star className="h-4 w-4 text-amber-500" weight="fill" />
                                    Top-rated campus listings
                                </span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.28 }}
                                className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3"
                            >
                                {[
                                    { value: '4.8/5', label: 'Average rating' },
                                    { value: '2k+', label: 'Student listings' },
                                    { value: '24h', label: 'Typical response' },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-3xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                                        <div className="text-2xl font-heading font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                                            {stat.value}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="relative"
                        >
                            <div className="absolute -left-4 top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/10" />
                            <div className="absolute -right-6 bottom-16 h-32 w-32 rounded-full bg-slate-900/10 blur-3xl dark:bg-indigo-500/10" />

                            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                                <div className="relative aspect-[4/5] min-h-[560px]">
                                    <img
                                        src="https://images.unsplash.com/photo-1758270704464-f980b03b9633?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBjYW1wdXMlMjBzb2NpYWxpemluZ3xlbnwwfHx8fDE3NzQ2MDE2MzZ8MA&ixlib=rb-4.1.0&q=85"
                                        alt="Campus students"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent dark:from-slate-950 dark:via-slate-950/55 dark:to-slate-950/20" />

                                    <div className="absolute inset-x-6 top-6 flex items-center justify-between rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.22em] text-white/55 dark:text-white/45">Curated pick</div>
                                            <div className="mt-1 text-sm font-medium text-white dark:text-slate-100">Student essentials near you</div>
                                        </div>
                                        <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white/10 dark:text-slate-100">
                                            Live now
                                        </div>
                                    </div>

                                    <div className="absolute inset-x-6 bottom-6 space-y-4">
                                        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-xs uppercase tracking-[0.22em] text-white/55 dark:text-white/45">Most requested</div>
                                                    <div className="mt-1 text-lg font-semibold text-white dark:text-slate-100">Dell Latitude 7420</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-white/60 dark:text-white/45">from</div>
                                                    <div className="text-lg font-semibold text-white dark:text-cyan-300">₹250/day</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center gap-3 text-sm text-white/75 dark:text-slate-300">
                                                <MapPin className="h-4 w-4" />
                                                Engineering block, 2 km away
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Fast checkout', value: '2 min' },
                                                { label: 'Trusted host', value: '4.9 rating' },
                                            ].map((item) => (
                                                <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100">
                                                    <div className="text-xs uppercase tracking-[0.2em] text-white/45 dark:text-white/40">{item.label}</div>
                                                    <div className="mt-2 text-xl font-semibold text-white dark:text-slate-100">{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-20 lg:py-28 bg-white/50 dark:bg-slate-950/40" data-testid="categories-section">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Browse by category</p>
                        <h2 className="mt-4 text-3xl font-heading font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
                            Clear navigation for the things students actually rent
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                            Keep the browsing experience focused. Each category is designed like a premium card with strong imagery, generous spacing, and a direct route to discovery.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: index * 0.08 }}
                                viewport={{ once: true, amount: 0.3 }}
                            >
                                <Link to={`/browse?category=${category.id}`} data-testid={`category-${category.id}`}>
                                    <Card className="group overflow-hidden border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
                                        <div className="relative h-72 overflow-hidden">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                                            <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-xl">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                                                        <category.icon className="h-6 w-6" weight="bold" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Category</div>
                                                        <h3 className="mt-1 text-2xl font-heading font-semibold tracking-[-0.04em]">{category.name}</h3>
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

            <section className="bg-slate-950 py-20 lg:py-28 text-white dark:bg-slate-950" data-testid="featured-section">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Featured listings</p>
                            <h2 className="mt-4 text-3xl font-heading font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                                Curated items with strong trust signals and clear value
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-white/68">
                                Surface the most relevant listings without visual noise. The cards below emphasize price, credibility, and location before anything else.
                            </p>
                        </div>
                        <Link to="/browse" data-testid="view-all-link">
                            <Button variant="secondary" className="h-12 gap-2 rounded-full px-6 font-semibold text-slate-950">
                                View all listings
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12">
                        {loading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i} className="overflow-hidden border-white/10 bg-white/5">
                                        <div className="aspect-[4/5] animate-pulse bg-white/10" />
                                        <CardContent className="p-5">
                                            <div className="h-4 w-3/4 rounded bg-white/10" />
                                            <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
                                            <div className="mt-4 h-4 w-2/3 rounded bg-white/10" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : featuredItems.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.45, delay: index * 0.08 }}
                                        viewport={{ once: true, amount: 0.25 }}
                                    >
                                        <Link to={`/item/${item.id}`} data-testid={`featured-item-${item.id}`}>
                                            <Card className="group h-full overflow-hidden border-white/10 bg-white/5 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
                                                <div className="aspect-[4/5] overflow-hidden bg-white/10">
                                                    <img
                                                        src={item.images?.[0]}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                </div>
                                                <CardContent className="space-y-4 p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="line-clamp-2 text-lg font-heading font-semibold tracking-[-0.03em] transition-colors group-hover:text-cyan-300">
                                                            {item.title}
                                                        </h3>
                                                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                                                            Featured
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-cyan-300">
                                                            {item.type === 'sell'
                                                                ? `₹${item.price ?? 0}`
                                                                : `₹${item.rentDetails?.pricePerDay ?? item.price_per_day ?? 0}/day`}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-white/70">
                                                            <Star className="h-4 w-4 text-amber-400" weight="fill" />
                                                            <span>{item.avg_rating?.toFixed(1) || '0.0'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-white/55">
                                                        <MapPin className="h-4 w-4" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-white/10 bg-white/5 p-12 text-center text-white">
                                <p className="text-white/70">No featured items yet. Be the first to list.</p>
                                <Link to="/dashboard/add-item" className="mt-5 inline-block">
                                    <Button variant="secondary" className="rounded-full px-6 font-semibold text-slate-950">
                                        List your item
                                    </Button>
                                </Link>
                            </Card>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-20 lg:py-28 bg-white/40 dark:bg-slate-950/40" data-testid="cta-section">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-12 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:px-10 lg:px-14 lg:py-16 dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(248,250,252,1)_100%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />
                        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                viewport={{ once: true }}
                                className="max-w-2xl"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Start listing</p>
                                <h2 className="mt-4 text-3xl font-heading font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
                                    Turn unused items into income, without friction.
                                </h2>
                                <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                                    A polished listing flow helps students trust what they see and act faster. Put your spare items in front of the right people today.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.08 }}
                                viewport={{ once: true }}
                                className="flex flex-col gap-3"
                            >
                                <Link to="/dashboard/add-item" data-testid="cta-list-item">
                                    <Button size="lg" className="h-14 w-full rounded-full px-8 font-semibold sm:w-auto">
                                        List your first item
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link to="/browse" className="sm:self-end">
                                    <Button variant="outline" size="lg" className="h-14 w-full rounded-full border-slate-300 px-8 font-semibold sm:w-auto">
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
