import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, CurrencyInr, Package, Plus, ShoppingCart } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_listings: 0,
        active_rentals: 0,
        total_earnings: 0,
        pending_requests: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activityRes] = await Promise.all([
                axios.get(`${API}/dashboard/stats`),
                axios.get(`${API}/dashboard/recent-activity`)
            ]);
            setStats(statsRes.data);
            setRecentActivity(activityRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Listings',
            value: stats.total_listings,
            icon: Package,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            title: 'Active Rentals',
            value: stats.active_rentals,
            icon: ShoppingCart,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            title: 'Total Earnings',
            value: `₹${stats.total_earnings.toFixed(2)}`,
            icon: CurrencyInr,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10'
        },
        {
            title: 'Pending Requests',
            value: stats.pending_requests,
            icon: Clock,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="space-y-8" data-testid="dashboard-home">
            <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] lg:flex-row lg:items-end lg:justify-between dark:bg-card">
                <div className="max-w-2xl">
                    <p className="section-kicker">Dashboard</p>
                    <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                    <p className="mt-3 text-muted-foreground">A simple snapshot of what is happening with your listings, rentals, and messages.</p>
                </div>
                <Link to="/dashboard/add-item">
                    <Button className="gap-2 rounded-full px-5" data-testid="add-item-button">
                        <Plus className="h-4 w-4" />
                        Add New Item
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((stat, index) => (
                    <motion.div key={stat.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.08 }}>
                        <Card className="stat-card rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="mt-1 text-2xl font-heading font-semibold tracking-[-0.04em]">{loading ? '...' : stat.value}</p>
                                    </div>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bgColor}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} weight="bold" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Link to="/dashboard/listings" data-testid="view-listings-link">
                    <Card className="card-hover h-full rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h3 className="font-heading text-lg font-semibold tracking-[-0.03em]">My Listings</h3>
                                <p className="text-sm text-muted-foreground">Manage your items</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/dashboard/rentals" data-testid="view-rentals-link">
                    <Card className="card-hover h-full rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h3 className="font-heading text-lg font-semibold tracking-[-0.03em]">My Rentals</h3>
                                <p className="text-sm text-muted-foreground">Track your bookings</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/dashboard/messages" data-testid="view-messages-link">
                    <Card className="card-hover h-full rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h3 className="font-heading text-lg font-semibold tracking-[-0.03em]">Messages</h3>
                                <p className="text-sm text-muted-foreground">Chat with users</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Card className="rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card" data-testid="recent-activity-card">
                <CardHeader>
                    <CardTitle className="font-heading text-lg font-semibold tracking-[-0.03em]">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex animate-pulse items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 rounded bg-muted" />
                                        <div className="h-3 w-1/4 rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentActivity.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Activity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.map((activity) => (
                                    <TableRow key={activity.id} data-testid={`activity-${activity.id}`}>
                                        <TableCell className="font-medium">{activity.action}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={statusColors[activity.status]}>
                                                {activity.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{format(new Date(activity.time), 'MMM d, h:mm a')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No recent activity</p>
                            <Link to="/browse" className="mt-2 inline-block">
                                <Button variant="outline" size="sm" className="rounded-full">Browse Marketplace</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
