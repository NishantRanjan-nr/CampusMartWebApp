import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import UploadForm from '../../components/marketplace/UploadForm';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [itemData, setItemData] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`${API}/items/${id}`);
                const item = response.data;
                setIsAvailable(item.rentDetails?.isAvailable ?? item.is_available ?? true);
                setItemData({
                    title: item.title || '',
                    description: item.description || '',
                    category: item.category || '',
                    type: item.type || 'rent',
                    price: item.price != null ? String(item.price) : '',
                    pricePerDay: item.rentDetails?.pricePerDay != null
                        ? String(item.rentDetails.pricePerDay)
                        : (item.price_per_day != null ? String(item.price_per_day) : ''),
                    deposit: item.deposit != null ? String(item.deposit) : '',
                    location: item.location || '',
                    condition: item.condition || 'Good',
                    size: item.size || '',
                    images: item.images || [],
                });
            } catch (error) {
                toast.error('Failed to load item');
                navigate('/dashboard/listings');
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, navigate]);

    const handleUpdateItem = async (values) => {
        const payload = {
            title: values.title,
            description: values.description,
            category: values.category,
            type: values.type,
            price: values.type === 'sell' ? parseFloat(values.price) : null,
            rentDetails: values.type === 'rent'
                ? {
                    pricePerDay: parseFloat(values.pricePerDay),
                    isAvailable,
                }
                : null,
            deposit: values.deposit ? parseFloat(values.deposit) : 0,
            location: values.location,
            condition: values.condition,
            size: values.size || null,
            images: values.images || [],
            is_available: isAvailable,
        };

        setSaving(true);
        try {
            await axios.put(`${API}/items/${id}`, payload);
            toast.success('Item updated successfully');
            navigate('/dashboard/listings');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update item');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto" data-testid="edit-item-page">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="back-button">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-heading font-bold tracking-tight">Edit Item</h1>
                    <p className="text-muted-foreground">Update listing details for sale or rent</p>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
                            <div>
                                <Label>Availability</Label>
                                <p className="text-sm text-muted-foreground">
                                    {isAvailable ? 'Available' : 'Unavailable'}
                                </p>
                            </div>
                            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                        </div>

                        <UploadForm
                            initialValues={itemData}
                            loading={saving}
                            submitLabel="Save Changes"
                            onSubmit={handleUpdateItem}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
