import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import UploadForm from '../../components/marketplace/UploadForm';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AddItem() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCreateItem = async (values) => {
        if (!values.title || !values.description || !values.category || !values.location) {
            toast.error('Please fill all required fields');
            return;
        }

        if (values.type === 'sell' && !values.price) {
            toast.error('Please add a price for sale listing');
            return;
        }

        if (values.type === 'rent' && !values.pricePerDay) {
            toast.error('Please add a price per day for rent listing');
            return;
        }

        const listingImages = Array.isArray(values.images)
            ? values.images.map((image) => String(image))
            : [];

        console.log('AddItem images before sending to backend:', listingImages);

        const payload = {
            title: values.title,
            description: values.description,
            category: values.category,
            type: values.type,
            price: values.type === 'sell' ? parseFloat(values.price) : null,
            rentDetails: values.type === 'rent'
                ? {
                    pricePerDay: parseFloat(values.pricePerDay),
                    isAvailable: true,
                }
                : null,
            deposit: values.deposit ? parseFloat(values.deposit) : 0,
            location: values.location,
            condition: values.condition,
            size: values.size || null,
            images: listingImages,
        };

        setLoading(true);
        try {
            try {
                await axios.post(`${API}/products`, payload);
            } catch (error) {
                await axios.post(`${API}/items`, payload);
            }
            toast.success('Listing created successfully');
            navigate('/dashboard/listings');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto" data-testid="add-item-page">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="back-button">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-heading font-bold tracking-tight">Add New Item</h1>
                    <p className="text-muted-foreground">Create a For Sale or For Rent listing</p>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                    <CardContent className="p-6">
                        <UploadForm loading={loading} submitLabel="List Item" onSubmit={handleCreateItem} />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
