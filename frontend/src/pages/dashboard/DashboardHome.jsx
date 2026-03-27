import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import axios from 'axios';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Package,
    ShoppingCart,
    CurrencyDollar,
    Clock,
    ArrowRight,
    Plus
} from '@phosphor-icons/react';

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
            value: `$${stats.total_earnings.toFixed(2)}`,
            icon: CurrencyDollar,
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
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your marketplace activity.
                    </p>
                </div>
                <Link to="/dashboard/add-item">
                    <Button className="gap-2" data-testid="add-item-button">
                        <Plus className="w-4 h-4" />
                        Add New Item
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="stat-card" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-heading font-bold mt-1">
                                            {loading ? '...' : stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} weight="bold" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/dashboard/listings" data-testid="view-listings-link">
                    <Card className="card-hover cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-heading font-semibold">My Listings</h3>
                                <p className="text-sm text-muted-foreground">Manage your items</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/dashboard/rentals" data-testid="view-rentals-link">
                    <Card className="card-hover cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-heading font-semibold">My Rentals</h3>
                                <p className="text-sm text-muted-foreground">Track your bookings</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/dashboard/messages" data-testid="view-messages-link">
                    <Card className="card-hover cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-heading font-semibold">Messages</h3>
                                <p className="text-sm text-muted-foreground">Chat with users</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Activity */}
            <Card data-testid="recent-activity-card">
                <CardHeader>
                    <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-4">
                                    <div className="w-10 h-10 bg-muted rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted rounded w-1/4" />
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
                                        <TableCell className="text-right text-muted-foreground">
                                            {format(new Date(activity.time), 'MMM d, h:mm a')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No recent activity</p>
                            <Link to="/browse" className="mt-2 inline-block">
                                <Button variant="outline" size="sm">Browse Marketplace</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
