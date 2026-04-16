import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { toast } from 'sonner';
import ProductCard from '../components/marketplace/ProductCard';
import RentModal from '../components/marketplace/RentModal';
import BuyModal from '../components/marketplace/BuyModal';
import { useAuth } from '../context/AuthContext';
import { getListingId } from '../lib/listing';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BrowsePage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [rentModalOpen, setRentModalOpen] = useState(false);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchItems();
    }, [searchParams]);

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

            // Sort items
            if (sortBy === 'price_low') {
                fetchedItems.sort((a, b) => listingPrice(a) - listingPrice(b));
            } else if (sortBy === 'price_high') {
                fetchedItems.sort((a, b) => listingPrice(b) - listingPrice(a));
            } else if (sortBy === 'rating') {
                fetchedItems.sort((a, b) => b.avg_rating - a.avg_rating);
            }

            setItems(fetchedItems);
        } catch (error) {
            console.error('Failed to fetch items:', error);
            toast.error('Could not load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
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
        if (value && value !== 'all') {
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
            const nextRequests = [...(item.requests || []), requestPayload];
            return {
                ...item,
                requests: nextRequests,
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
            {/* Category */}
            <div className="filter-section">
                <Label className="text-sm font-semibold mb-3 block">Category</Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="cat-all"
                            checked={!category}
                            onCheckedChange={() => handleCategoryChange('')}
                            data-testid="filter-category-all"
                        />
                        <label htmlFor="cat-all" className="text-sm">All Categories</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="cat-electronics"
                            checked={category === 'electronics'}
                            onCheckedChange={(checked) => handleCategoryChange(checked ? 'electronics' : '')}
                            data-testid="filter-category-electronics"
                        />
                        <label htmlFor="cat-electronics" className="text-sm">Electronics</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="cat-clothes"
                            checked={category === 'clothes'}
                            onCheckedChange={(checked) => handleCategoryChange(checked ? 'clothes' : '')}
                            data-testid="filter-category-clothes"
                        />
                        <label htmlFor="cat-clothes" className="text-sm">Clothes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="cat-books"
                            checked={category === 'books'}
                            onCheckedChange={(checked) => handleCategoryChange(checked ? 'books' : '')}
                            data-testid="filter-category-books"
                        />
                        <label htmlFor="cat-books" className="text-sm">Books</label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-6 lg:py-10" data-testid="browse-page">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
                            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Browse Items'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {loading ? 'Loading...' : `${items.length} items available`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search listings..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-48 lg:w-64 h-10"
                                    data-testid="browse-search-input"
                                />
                            </div>
                        </form>

                        {/* Sort */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-40 h-10" data-testid="sort-select">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price_low">Price: Low to High</SelectItem>
                                <SelectItem value="price_high">Price: High to Low</SelectItem>
                                <SelectItem value="rating">Top Rated</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Mobile Filter Button */}
                        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="lg:hidden" data-testid="mobile-filter-trigger">
                                    <Funnel className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
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

                <div className="flex gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block w-64 flex-shrink-0" data-testid="filter-sidebar">
                        <Card className="p-6 sticky top-24">
                            <h3 className="font-heading font-semibold mb-4">Filters</h3>
                            <FilterContent />
                        </Card>
                    </aside>

                    {/* Items Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <div className="aspect-square bg-muted" />
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
                                        key={getListingId(item) || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <ProductCard
                                            product={item}
                                            onRequestRent={handleRentClick}
                                            onBuyNow={handleBuyNow}
                                            currentUserId={user?.id}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center" data-testid="no-items-message">
                                <div className="max-w-sm mx-auto">
                                    <MagnifyingGlass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-heading font-semibold text-lg mb-2">No items found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Try adjusting your filters or search terms
                                    </p>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <RentModal
                open={rentModalOpen}
                onOpenChange={setRentModalOpen}
                product={selectedProduct}
                onSubmit={handleRentRequest}
            />

            <BuyModal
                open={buyModalOpen}
                onOpenChange={setBuyModalOpen}
                product={selectedProduct}
                onSubmit={handleBuyRequest}
            />
        </div>
    );
}
