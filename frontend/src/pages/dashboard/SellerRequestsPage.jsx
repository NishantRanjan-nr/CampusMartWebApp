import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusClasses = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function SellerRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchSellerRequests = async () => {
        try {
            const response = await axios.get(`${API}/seller/requests`);
            setRequests(response.data);
        } catch (error) {
            toast.error('Failed to load seller requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellerRequests();
    }, []);

    const updateRequest = async (request, status) => {
        setUpdatingId(request.requestId);
        try {
            await axios.patch(`${API}/request/${request.productId}/${request.requestId}`, { status });
            setRequests((prev) => prev.map((item) => (
                item.requestId === request.requestId ? { ...item, status } : item
            )));
            toast.success(`Request ${status}`);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update request');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6" data-testid="seller-requests-page">
            <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight">Seller Requests</h1>
                <p className="text-muted-foreground mt-1">Review buy and rent requests before confirmation.</p>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[...Array(3)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-5">
                                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                                <div className="h-4 bg-muted rounded w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : requests.length > 0 ? (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <Card key={request.requestId} data-testid={`seller-request-${request.requestId}`}>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">{request.productTitle}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Buyer: {request.buyerName || request.buyerId}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Type: {request.type} | Payment: Meet and Pay
                                        </p>
                                        {request.type === 'rent' && request.startDate && request.endDate && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Dates: {request.startDate} to {request.endDate}
                                            </p>
                                        )}
                                    </div>

                                    <Badge className={statusClasses[request.status] || statusClasses.pending}>
                                        {request.status}
                                    </Badge>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90"
                                        disabled={request.status !== 'pending' || updatingId === request.requestId}
                                        onClick={() => updateRequest(request, 'approved')}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={request.status !== 'pending' || updatingId === request.requestId}
                                        onClick={() => updateRequest(request, 'rejected')}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center">
                        <h3 className="text-lg font-semibold">No requests yet</h3>
                        <p className="text-muted-foreground mt-2">Incoming buy or rent requests will appear here.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
