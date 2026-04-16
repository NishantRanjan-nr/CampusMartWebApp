import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { MagnifyingGlass, Sun, Moon, User, SignOut, House, Package, ShoppingCart } from '@phosphor-icons/react';

export default function PublicLayout() {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/40" data-testid="public-header">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-primary-foreground" weight="bold" />
                            </div>
                            <span className="font-heading font-bold text-xl hidden sm:block">CampusMart</span>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search electronics, clothes, books..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 h-10 bg-secondary/50 border-0 focus-visible:ring-primary"
                                    data-testid="header-search-input"
                                />
                            </div>
                        </form>

                        {/* Nav Items */}
                        <nav className="flex items-center gap-2 lg:gap-4">
                            <Link to="/" data-testid="home-link">
                                <Button variant="ghost" size="sm" className="hidden sm:flex">
                                    Home
                                </Button>
                            </Link>
                            <Link to="/browse" data-testid="browse-link">
                                <Button variant="ghost" size="sm" className="hidden sm:flex">
                                    Browse
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                data-testid="theme-toggle"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </Button>

                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-trigger">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <span className="text-sm font-medium text-primary-foreground">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48" data-testid="user-menu-dropdown">
                                        <div className="px-2 py-1.5">
                                            <p className="text-sm font-medium">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="dashboard-menu-item">
                                            <House className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/listings')} data-testid="listings-menu-item">
                                            <Package className="w-4 h-4 mr-2" />
                                            My Listings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-menu-item">
                                            <SignOut className="w-4 h-4 mr-2" />
                                            Log Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/auth" data-testid="auth-link">
                                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                                        <User className="w-4 h-4 mr-2" />
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="md:hidden pb-3">
                        <div className="relative">
                            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 bg-secondary/50 border-0"
                                data-testid="mobile-search-input"
                            />
                        </div>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-auto" data-testid="public-footer">
                <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-primary-foreground" weight="bold" />
                                </div>
                                <span className="font-heading font-bold text-xl">CampusMart</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The student marketplace for renting electronics, clothes, and books.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold mb-3">Marketplace</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/browse?category=electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
                                <li><Link to="/browse?category=clothes" className="hover:text-foreground transition-colors">Clothes</Link></li>
                                <li><Link to="/browse?category=books" className="hover:text-foreground transition-colors">Books</Link></li>
                                <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse All</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold mb-3">Account</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                                <li><Link to="/dashboard/add-item" className="hover:text-foreground transition-colors">List an Item</Link></li>
                                <li><Link to="/dashboard/rentals" className="hover:text-foreground transition-colors">My Rentals</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold mb-3">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><span className="hover:text-foreground transition-colors cursor-pointer">Help Center</span></li>
                                <li><span className="hover:text-foreground transition-colors cursor-pointer">Safety Tips</span></li>
                                <li><span className="hover:text-foreground transition-colors cursor-pointer">Contact Us</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} CampusMart. Made for students, by students. --this website is made by Nr.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
