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
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col fixed h-screen" data-testid="dashboard-sidebar">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-40 glass border-b border-border/40 h-16" data-testid="dashboard-header">
                    <div className="flex items-center justify-between h-full px-4 lg:px-8">
                        {/* Mobile Menu */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-trigger">
                                    <List className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64">
                                <SidebarContent onItemClick={() => setMobileOpen(false)} />
                            </SheetContent>
                        </Sheet>

                        {/* Search */}
                        <div className="hidden sm:flex flex-1 max-w-md">
                            <div className="relative w-full">
                                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search your items..."
                                    className="pl-10 h-10 bg-secondary/50 border-0"
                                    data-testid="dashboard-search-input"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                data-testid="dashboard-theme-toggle"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </Button>

                            <Button variant="ghost" size="icon" className="relative" data-testid="notifications-button">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="gap-2 pl-2 pr-3" data-testid="user-dropdown-trigger">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary-foreground">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="hidden sm:block font-medium">{user?.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48" data-testid="user-dropdown-menu">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} data-testid="profile-dropdown-item">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-dropdown-item">
                                        <SignOut className="w-4 h-4 mr-2" />
                                        Log Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
