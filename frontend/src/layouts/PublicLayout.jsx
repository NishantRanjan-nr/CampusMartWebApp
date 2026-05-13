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

const quickLinks = [
    { label: 'Browse', to: '/browse' },
    { label: 'Electronics', to: '/browse?category=electronics' },
    { label: 'Clothes', to: '/browse?category=clothes' },
    { label: 'Books', to: '/browse?category=books' },
];

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
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl" data-testid="public-header">
                <div className="section-shell">
                    <div className="flex min-h-16 items-center gap-4 py-3 lg:min-h-20">
                        <Link to="/" className="flex shrink-0 items-center gap-3" data-testid="logo-link">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <ShoppingCart className="h-6 w-6" weight="bold" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="font-heading text-xl font-semibold tracking-[-0.04em]">CampusMart</div>
                                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Simple marketplace</div>
                            </div>
                        </Link>

                        <form onSubmit={handleSearch} className="hidden flex-1 px-2 md:block lg:px-6">
                            <div className="relative mx-auto max-w-2xl">
                                <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search items, people, or categories"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-12 rounded-full border-border/70 bg-white pl-11 pr-4 shadow-sm focus-visible:ring-primary dark:bg-card"
                                    data-testid="header-search-input"
                                />
                            </div>
                        </form>

                        <nav className="ml-auto flex items-center gap-2 lg:gap-3">
                            <div className="hidden items-center gap-1 rounded-full border border-border/70 bg-white px-2 py-1 shadow-sm xl:flex dark:bg-card">
                                {quickLinks.map((link) => (
                                    <Link key={link.label} to={link.to} data-testid={`${link.label.toLowerCase()}-link`}>
                                        <Button variant="ghost" size="sm" className="h-10 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground">
                                            {link.label}
                                        </Button>
                                    </Link>
                                ))}
                            </div>

                            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="theme-toggle">
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-trigger">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-semibold text-background">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52" data-testid="user-menu-dropdown">
                                        <div className="px-2 py-1.5">
                                            <p className="text-sm font-medium">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="dashboard-menu-item">
                                            <House className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/listings')} data-testid="listings-menu-item">
                                            <Package className="mr-2 h-4 w-4" />
                                            My Listings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-menu-item">
                                            <SignOut className="mr-2 h-4 w-4" />
                                            Log Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/auth" data-testid="auth-link">
                                    <Button size="sm" className="h-10 rounded-full px-5 font-semibold">
                                        <User className="mr-2 h-4 w-4" />
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </nav>
                    </div>

                    <form onSubmit={handleSearch} className="pb-4 md:hidden">
                        <div className="relative">
                            <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 rounded-full border-border/70 bg-white pl-11 shadow-sm dark:bg-card"
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
            <footer className="mt-auto border-t border-border/60 bg-white/80 backdrop-blur-xl dark:bg-card/80" data-testid="public-footer">
                <div className="section-shell py-10 lg:py-14">
                    <div className="grid gap-10 md:grid-cols-4">
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                    <ShoppingCart className="h-6 w-6" weight="bold" />
                                </div>
                                <span className="font-heading text-xl font-semibold">CampusMart</span>
                            </div>
                            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                                A clean student marketplace for renting and buying essentials without clutter.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Marketplace</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/browse?category=electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
                                <li><Link to="/browse?category=clothes" className="hover:text-foreground transition-colors">Clothes</Link></li>
                                <li><Link to="/browse?category=books" className="hover:text-foreground transition-colors">Books</Link></li>
                                <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse All</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Account</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                                <li><Link to="/dashboard/add-item" className="hover:text-foreground transition-colors">List an Item</Link></li>
                                <li><Link to="/dashboard/rentals" className="hover:text-foreground transition-colors">My Rentals</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><span className="hover:text-foreground transition-colors cursor-pointer">Help Center</span></li>
                                <li><span className="hover:text-foreground transition-colors cursor-pointer">Safety Tips</span></li>
                                <li><span className="hover:text-foreground transition-colors cursor-pointer">Contact Us</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 border-t border-border/70 pt-6 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} CampusMart. Made for students, by students.---this website is made by nr</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
