import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
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
import { MagnifyingGlass, Funnel, Star, MapPin, X } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PRICE_MIN = 0;
const PRICE_MAX = 100;
const PRICE_STEP = 1;

export default function BrowsePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

    // Store products
    const [storeProducts, setStoreProducts] = useState([]);
    const [storeSearch, setStoreSearch] = useState('');
    const [storeCategory, setStoreCategory] = useState('all');
    const [storeLoading, setStoreLoading] = useState(true);

    const filteredStoreProducts = useMemo(() => {
        const query = storeSearch.trim().toLowerCase();
        const keywordTokens = query
            .split(/\s+/)
            .filter((token) => token.length > 0);

        return storeProducts.filter((product) => {
            const productTitle = product.title.toLowerCase();
            const productCategory = product.category.toLowerCase();
            const productDescription = (product.description || '').toLowerCase();

            const matchesSearch = keywordTokens.length === 0 ||
                keywordTokens.every((token) =>
                    productTitle.includes(token) ||
                    productCategory.includes(token) ||
                    productDescription.includes(token)
                );

            let matchesCategory;
            if (storeCategory === 'all') {
                matchesCategory = true;
            } else if (storeCategory === 'clothes') {
                matchesCategory = productCategory.includes('clothing') || productCategory.includes('men') || productCategory.includes('women');
            } else {
                matchesCategory = productCategory === storeCategory.toLowerCase();
            }

            return matchesSearch && matchesCategory;
        });
    }, [storeProducts, storeSearch, storeCategory]);
    const [location, setLocation] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const handleMaxPriceChange = (value) => {
        if (!Array.isArray(value) || value.length !== 1) return;
        const nextMax = Math.round(value[0]);
        const clampedMax = Math.min(PRICE_MAX, Math.max(PRICE_MIN, nextMax));
        setMaxPrice(clampedMax);
    };

    useEffect(() => {
        fetchItems();
    }, [searchParams]);

    useEffect(() => {
        if (category) {
            setStoreCategory(category.toLowerCase());
        } else {
            setStoreCategory('all');
        }
    }, [category]);

    useEffect(() => {
        const fetchStoreProducts = async () => {
            setStoreLoading(true);
            try {
                const response = await axios.get('https://fakestoreapi.com/products');
                setStoreProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch store products:', error);
            } finally {
                setStoreLoading(false);
            }
        };

        fetchStoreProducts();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            const searchQuery = searchParams.get('search');
            const categoryQuery = searchParams.get('category');

            if (searchQuery) params.append('search', searchQuery);
            if (categoryQuery) params.append('category', categoryQuery);
            if (maxPrice < PRICE_MAX) params.append('max_price', maxPrice);
            if (location) params.append('location', location);

            const response = await axios.get(`${API}/items?${params.toString()}`);
            let fetchedItems = response.data;

            // Sort items
            if (sortBy === 'price_low') {
                fetchedItems.sort((a, b) => a.price_per_day - b.price_per_day);
            } else if (sortBy === 'price_high') {
                fetchedItems.sort((a, b) => b.price_per_day - a.price_per_day);
            } else if (sortBy === 'rating') {
                fetchedItems.sort((a, b) => b.avg_rating - a.avg_rating);
            }

            setItems(fetchedItems);
        } catch (error) {
            console.error('Failed to fetch items:', error);
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
        setMaxPrice(PRICE_MAX);
        setLocation('');
        setSearchParams({});
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
                </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <Label className="text-sm font-semibold mb-3 block">Price per Day</Label>
                <div className="relative z-10 pointer-events-auto">
                    <Slider
                        value={[maxPrice]}
                        onValueChange={handleMaxPriceChange}
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={PRICE_STEP}
                        className="mb-2"
                        data-testid="filter-price-slider"
                    />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{PRICE_MIN}</span>
                    <span>₹{maxPrice}+</span>
                </div>
            </div>

            {/* Location */}
            <div className="filter-section">
                <Label className="text-sm font-semibold mb-3 block">Location</Label>
                <Input
                    type="text"
                    placeholder="Search location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-9"
                    data-testid="filter-location-input"
                />
            </div>

            {/* Apply/Clear */}
            <div className="flex gap-2">
                <Button onClick={fetchItems} className="flex-1" data-testid="filter-apply-button">
                    Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters} data-testid="filter-clear-button">
                    <X className="w-4 h-4" />
                </Button>
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
                        <div className="w-full lg:w-96">
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={storeSearch}
                                onChange={(e) => setStoreSearch(e.target.value)}
                                className="w-full h-10"
                                data-testid="store-search-input"
                            />
                        </div>

                        <Select value={storeCategory} onValueChange={setStoreCategory}>
                            <SelectTrigger className="w-48 h-10" data-testid="store-category-select">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="jewelery">Jewelery</SelectItem>
                                <SelectItem value="men's clothing">Men's Clothing</SelectItem>
                                <SelectItem value="women's clothing">Women's Clothing</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search..."
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

                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-heading font-bold">Store Products</h2>
                        <span className="text-sm text-muted-foreground">
                            {storeLoading ? 'Loading...' : `${filteredStoreProducts.length} results`}
                            {storeCategory !== 'all' && ` in ${storeCategory}`}
                        </span>
                    </div>

                    {storeLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, index) => (
                                <Card key={index} className="p-4 animate-pulse">
                                    <div className="h-40 bg-muted rounded-md mb-3" />
                                    <div className="h-4 bg-muted rounded mb-2" />
                                    <div className="h-4 w-1/2 bg-muted rounded" />
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredStoreProducts.map((product) => (
                                <Link key={product.id} to={`/item/${product.id}`} className="block">
                                    <Card className="hover:shadow-xl transition-all">
                                        <div className="h-44 w-full overflow-hidden rounded-md bg-white">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="h-full w-full object-contain p-4"
                                            />
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="text-sm font-semibold line-clamp-2" title={product.title}>
                                                {product.title}
                                            </h3>
                                            <p className="text-base font-bold text-primary mt-2">₹{product.price.toFixed(2)}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

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
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link to={`/item/${item.id}`} data-testid={`item-card-${item.id}`}>
                                            <Card className="group overflow-hidden card-hover">
                                                <div className="aspect-square overflow-hidden bg-muted relative">
                                                    <img
                                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=400'}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm text-xs font-medium capitalize">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-heading font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-primary">₹{item.price_per_day}/day</span>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Star className="w-4 h-4 text-amber-500" weight="fill" />
                                                            <span>{item.avg_rating?.toFixed(1) || '0.0'}</span>
                                                            <span>({item.review_count || 0})</span>
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
        </div>
    );
}
