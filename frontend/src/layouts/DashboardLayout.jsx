import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import axios from 'axios';
import {
    House,
    Package,
    ShoppingCart,
    Plus,
    ChatCircle,
    User,
    SignOut,
    Sun,
    Moon,
    Bell,
    MagnifyingGlass,
    List,
    Storefront
} from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const navItems = [
    { path: '/dashboard', icon: House, label: 'Dashboard', exact: true },
    { path: '/dashboard/listings', icon: Package, label: 'My Listings' },
    { path: '/dashboard/rentals', icon: ShoppingCart, label: 'My Rentals' },
    { path: '/dashboard/requests', icon: Bell, label: 'Requests' },
    { path: '/dashboard/add-item', icon: Plus, label: 'Add Item' },
    { path: '/dashboard/messages', icon: ChatCircle, label: 'Messages' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
    }, [location]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${API}/messages/unread-count`);
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const NavLink = ({ item, onClick }) => (
        <Link
            to={item.path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path, item.exact)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
        >
            <item.icon className="w-5 h-5" weight={isActive(item.path, item.exact) ? 'fill' : 'regular'} />
            <span className="font-medium">{item.label}</span>
            {item.label === 'Messages' && unreadCount > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                </span>
            )}
        </Link>
    );

    const SidebarContent = ({ onItemClick }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link to="/" className="flex items-center gap-2" data-testid="dashboard-logo">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Storefront className="w-6 h-6 text-primary-foreground" weight="bold" />
                    </div>
                    <span className="font-heading font-bold text-xl">CampusMart</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink key={item.path} item={item} onClick={onItemClick} />
                ))}
            </nav>

            {/* Back to Marketplace */}
            <div className="p-4 border-t border-border">
                <Link
                    to="/browse"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    data-testid="back-to-marketplace"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">Back to Marketplace</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex" data-testid="dashboard-layout">
            <aside className="hidden lg:flex w-72 border-r border-border/60 bg-white/80 backdrop-blur-xl flex-col fixed h-screen dark:bg-card/80" data-testid="dashboard-sidebar">
                <SidebarContent />
            </aside>

            <div className="flex-1 lg:ml-72">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl" data-testid="dashboard-header">
                    <div className="section-shell flex h-16 items-center justify-between gap-4 lg:h-20">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full lg:hidden" data-testid="mobile-menu-trigger">
                                    <List className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <SidebarContent onItemClick={() => setMobileOpen(false)} />
                            </SheetContent>
                        </Sheet>

                        <div className="hidden flex-1 sm:flex">
                            <div className="relative w-full max-w-xl">
                                <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search your items..."
                                    className="h-12 rounded-full border-border/70 bg-white pl-11 shadow-sm dark:bg-card"
                                    data-testid="dashboard-search-input"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="dashboard-theme-toggle">
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            <Button variant="ghost" size="icon" className="relative rounded-full" data-testid="notifications-button">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="gap-2 rounded-full px-2 pr-3" data-testid="user-dropdown-trigger">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                                            <span className="text-sm font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="hidden sm:block font-medium">{user?.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52" data-testid="user-dropdown-menu">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} data-testid="profile-dropdown-item">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-dropdown-item">
                                        <SignOut className="mr-2 h-4 w-4" />
                                        Log Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <main className="section-shell py-5 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
