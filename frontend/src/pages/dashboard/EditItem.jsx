import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price_per_day: '',
        deposit: '',
        location: '',
        condition: 'Good',
        size: '',
        images: [],
        is_available: true
    });
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await axios.get(`${API}/items/${id}`);
            const item = response.data;
            setFormData({
                title: item.title,
                description: item.description,
                category: item.category,
                price_per_day: item.price_per_day.toString(),
                deposit: item.deposit.toString(),
                location: item.location,
                condition: item.condition,
                size: item.size || '',
                images: item.images || [],
                is_available: item.is_available
            });
        } catch (error) {
            toast.error('Failed to load item');
            navigate('/dashboard/listings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addImage = () => {
        if (!imageUrl.trim()) return;
        if (formData.images.length >= 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl.trim()]
        }));
        setImageUrl('');
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category || !formData.price_per_day || !formData.deposit || !formData.location) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                price_per_day: parseFloat(formData.price_per_day),
                deposit: parseFloat(formData.deposit)
            };

            await axios.put(`${API}/items/${id}`, payload);
            toast.success('Item updated successfully!');
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    data-testid="back-button"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-heading font-bold tracking-tight">Edit Item</h1>
                    <p className="text-muted-foreground">Update your listing details</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div>
                                    <Label>Item Availability</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.is_available ? 'Available for rent' : 'Currently unavailable'}
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.is_available}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                                    data-testid="availability-switch"
                                />
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="mt-1.5"
                                        data-testid="item-title-input"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="mt-1.5"
                                        data-testid="item-description-input"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => handleSelectChange('category', value)}
                                        >
                                            <SelectTrigger className="mt-1.5" data-testid="category-select">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="electronics">Electronics</SelectItem>
                                                <SelectItem value="clothes">Clothes</SelectItem>
                                                <SelectItem value="books">Books</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Condition *</Label>
                                        <Select
                                            value={formData.condition}
                                            onValueChange={(value) => handleSelectChange('condition', value)}
                                        >
                                            <SelectTrigger className="mt-1.5" data-testid="condition-select">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New">New</SelectItem>
                                                <SelectItem value="Like New">Like New</SelectItem>
                                                <SelectItem value="Good">Good</SelectItem>
                                                <SelectItem value="Fair">Fair</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {formData.category === 'clothes' && (
                                    <div>
                                        <Label htmlFor="size">Size</Label>
                                        <Input
                                            id="size"
                                            name="size"
                                            value={formData.size}
                                            onChange={handleChange}
                                            className="mt-1.5"
                                            data-testid="size-input"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Pricing */}
                            <div className="space-y-4">
                                <h3 className="font-heading font-semibold">Pricing</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price_per_day">Price per Day (₹) *</Label>
                                        <Input
                                            id="price_per_day"
                                            name="price_per_day"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price_per_day}
                                            onChange={handleChange}
                                            className="mt-1.5"
                                            data-testid="price-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="deposit">Deposit (₹) *</Label>
                                        <Input
                                            id="deposit"
                                            name="deposit"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.deposit}
                                            onChange={handleChange}
                                            className="mt-1.5"
                                            data-testid="deposit-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="mt-1.5"
                                    data-testid="location-input"
                                />
                            </div>

                            {/* Images */}
                            <div className="space-y-4">
                                <h3 className="font-heading font-semibold">Images</h3>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Paste image URL..."
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        data-testid="image-url-input"
                                    />
                                    <Button type="button" variant="outline" onClick={addImage} data-testid="add-image-button">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1"
                                    data-testid="save-item-button"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
