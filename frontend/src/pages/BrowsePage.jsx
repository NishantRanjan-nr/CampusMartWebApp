import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Funnel, House, Laptop, MagnifyingGlass, SlidersHorizontal, TShirt, BookOpen } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import ProductCard from '../components/marketplace/ProductCard';
import RentModal from '../components/marketplace/RentModal';
import BuyModal from '../components/marketplace/BuyModal';
import { useAuth } from '../context/AuthContext';
import { getListingId } from '../lib/listing';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryChips = [
    { label: 'All', value: '', icon: House },
    { label: 'Electronics', value: 'electronics', icon: Laptop },
    { label: 'Clothes', value: 'clothes', icon: TShirt },
    { label: 'Books', value: 'books', icon: BookOpen },
];

export default function BrowsePage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [rentModalOpen, setRentModalOpen] = useState(false);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchItems();
    }, [searchParams, sortBy]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            const searchQuery = searchParams.get('search');
            const categoryQuery = searchParams.get('category');

            if (searchQuery) params.append('search', searchQuery);
            if (categoryQuery) params.append('category', categoryQuery);

            const queryString = params.toString();
            const productUrl = `${API}/products${queryString ? `?${queryString}` : ''}`;
            const itemUrl = `${API}/items${queryString ? `?${queryString}` : ''}`;

            let fetchedItems = [];
            try {
                const response = await axios.get(productUrl);
                fetchedItems = response.data;
            } catch (error) {
                const fallbackResponse = await axios.get(itemUrl);
                fetchedItems = fallbackResponse.data;
            }

            const listingPrice = (item) => {
                if (item.type === 'sell') {
                    return item.price ?? 0;
                }
                return item.rentDetails?.pricePerDay ?? item.price_per_day ?? 0;
            };

            if (sortBy === 'price_low') {
                fetchedItems.sort((a, b) => listingPrice(a) - listingPrice(b));
            } else if (sortBy === 'price_high') {
                fetchedItems.sort((a, b) => listingPrice(b) - listingPrice(a));
            } else if (sortBy === 'rating') {
                fetchedItems.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
            }

            setItems(fetchedItems);
        } catch (error) {
            console.error('Failed to fetch items:', error);
            toast.error('Could not load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (search.trim()) {
            newParams.set('search', search.trim());
        } else {
            newParams.delete('search');
        }
        setSearchParams(newParams);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('category', value);
        } else {
            newParams.delete('category');
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setSearchParams({});
    };

    const handleRentClick = (product) => {
        setSelectedProduct(product);
        setRentModalOpen(true);
    };

    const handleBuyNow = (product) => {
        setSelectedProduct(product);
        setBuyModalOpen(true);
    };

    const appendLocalRequest = (requestPayload) => {
        if (!selectedProduct) return;
        const selectedProductId = getListingId(selectedProduct);

        setItems((prev) => prev.map((item) => {
            if (getListingId(item) !== selectedProductId) return item;
            return {
                ...item,
                requests: [...(item.requests || []), requestPayload],
            };
        }));
    };

    const handleBuyRequest = async ({ type, paymentMethod }) => {
        if (!selectedProduct) return;
        const selectedProductId = getListingId(selectedProduct);
        if (!selectedProductId) return;

        const response = await axios.post(`${API}/request/${selectedProductId}`, {
            type,
            paymentMethod,
        });

        appendLocalRequest(response.data.request);
        toast.success('Purchase request sent. Waiting for seller approval.');
    };

    const handleRentRequest = async ({ type, paymentMethod, startDate, endDate }) => {
        if (!selectedProduct) return;
        const selectedProductId = getListingId(selectedProduct);
        if (!selectedProductId) return;

        const response = await axios.post(`${API}/request/${selectedProductId}`, {
            type,
            paymentMethod,
            startDate,
            endDate,
        });

        appendLocalRequest(response.data.request);
        toast.success('Rent request submitted');
    };

    const FilterContent = () => (
        <div className="space-y-6">
            <div className="filter-section">
                <Label className="mb-3 block text-sm font-semibold">Category</Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-all" checked={!category} onCheckedChange={() => handleCategoryChange('')} data-testid="filter-category-all" />
                        <label htmlFor="cat-all" className="text-sm">All Categories</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-electronics" checked={category === 'electronics'} onCheckedChange={(checked) => handleCategoryChange(checked ? 'electronics' : '')} data-testid="filter-category-electronics" />
                        <label htmlFor="cat-electronics" className="text-sm">Electronics</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-clothes" checked={category === 'clothes'} onCheckedChange={(checked) => handleCategoryChange(checked ? 'clothes' : '')} data-testid="filter-category-clothes" />
                        <label htmlFor="cat-clothes" className="text-sm">Clothes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-books" checked={category === 'books'} onCheckedChange={(checked) => handleCategoryChange(checked ? 'books' : '')} data-testid="filter-category-books" />
                        <label htmlFor="cat-books" className="text-sm">Books</label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-6 lg:py-10" data-testid="browse-page">
            <div className="section-shell space-y-8">
                <section className="rounded-[2rem] border border-border/70 bg-white px-5 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] dark:bg-card">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="section-kicker">Browse listings</p>
                            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                                {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Browse everything'}
                            </h1>
                            <p className="mt-3 text-muted-foreground">{loading ? 'Loading listings...' : `${items.length} items available`}</p>
                        </div>

                        <div className="flex flex-col gap-3 lg:w-[28rem]">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <MagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search listings..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-12 rounded-full border-border/70 bg-white pl-11 shadow-sm dark:bg-card"
                                        data-testid="browse-search-input"
                                    />
                                </div>
                            </form>

                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-11 w-[12rem] rounded-full border-border/70 bg-white dark:bg-card" data-testid="sort-select">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest</SelectItem>
                                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                                        <SelectItem value="rating">Top Rated</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="h-11 rounded-full border-border/70 bg-white px-4 dark:bg-card lg:hidden" data-testid="mobile-filter-trigger">
                                            <Funnel className="mr-2 h-4 w-4" />
                                            Filters
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-80 bg-background">
                                        <SheetHeader>
                                            <SheetTitle>Filters</SheetTitle>
                                        </SheetHeader>
                                        <div className="mt-6">
                                            <FilterContent />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        {categoryChips.map((chip) => {
                            const active = (chip.value || '') === (category || '');
                            const Icon = chip.icon;

                            return (
                                <Link key={chip.label} to={chip.value ? `/browse?category=${chip.value}` : '/browse'}>
                                    <Button variant={active ? 'default' : 'outline'} className="h-11 rounded-full px-5 font-medium">
                                        <Icon className="mr-2 h-4 w-4" />
                                        {chip.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <div className="flex gap-8">
                    <aside className="hidden w-72 flex-shrink-0 lg:block" data-testid="filter-sidebar">
                        <Card className="sticky top-24 rounded-[1.5rem] border border-border/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                            <h3 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em]">Filters</h3>
                            <FilterContent />
                        </Card>
                    </aside>

                    <div className="flex-1">
                        {loading ? (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="animate-pulse overflow-hidden rounded-[1.5rem] border border-border/70 bg-white dark:bg-card">
                                        <div className="aspect-[4/3] bg-muted" />
                                        <CardContent className="p-5">
                                            <div className="h-4 w-3/4 rounded bg-muted" />
                                            <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : items.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {items.map((item, index) => (
                                    <motion.div key={getListingId(item) || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.04 }}>
                                        <ProductCard product={item} onRequestRent={handleRentClick} onBuyNow={handleBuyNow} currentUserId={user?.id} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-[1.5rem] border border-border/70 bg-white p-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card" data-testid="no-items-message">
                                <div className="mx-auto max-w-sm">
                                    <MagnifyingGlass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 font-heading text-lg font-semibold">No items found</h3>
                                    <p className="mb-4 text-muted-foreground">Try adjusting your filters or search terms</p>
                                    <Button variant="outline" onClick={clearFilters} className="rounded-full">
                                        Clear Filters
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <RentModal open={rentModalOpen} onOpenChange={setRentModalOpen} product={selectedProduct} onSubmit={handleRentRequest} />
            <BuyModal open={buyModalOpen} onOpenChange={setBuyModalOpen} product={selectedProduct} onSubmit={handleBuyRequest} />
        </div>
    );
}
