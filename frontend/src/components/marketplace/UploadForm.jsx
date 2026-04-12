import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Plus, X } from '@phosphor-icons/react';

const baseFormState = {
    title: '',
    description: '',
    category: '',
    type: 'sell',
    price: '',
    pricePerDay: '',
    deposit: '',
    location: '',
    condition: 'Good',
    size: '',
    images: [],
};

export default function UploadForm({ initialValues, loading, submitLabel, onSubmit }) {
    const [formData, setFormData] = useState({ ...baseFormState, ...(initialValues || {}) });
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (initialValues) {
            setFormData({ ...baseFormState, ...initialValues });
        }
    }, [initialValues]);

    const normalizedType = useMemo(() => (formData.type === 'rent' ? 'rent' : 'sell'), [formData.type]);

    const updateForm = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addImage = () => {
        if (!imageUrl.trim()) return;
        if (formData.images.length >= 5) return;
        updateForm('images', [...formData.images, imageUrl.trim()]);
        setImageUrl('');
    };

    const removeImage = (index) => {
        updateForm('images', formData.images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, type: normalizedType });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="upload-form">
            <div className="space-y-2">
                <Label>Listing Type *</Label>
                <Tabs value={normalizedType} onValueChange={(value) => updateForm('type', value)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sell" data-testid="type-sell-tab">For Sale</TabsTrigger>
                        <TabsTrigger value="rent" data-testid="type-rent-tab">For Rent</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g., MacBook Pro 14-inch"
                        value={formData.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                        className="mt-1.5"
                        data-testid="item-title-input"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your listing..."
                        value={formData.description}
                        onChange={(e) => updateForm('description', e.target.value)}
                        rows={4}
                        className="mt-1.5"
                        data-testid="item-description-input"
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => updateForm('category', value)}>
                            <SelectTrigger className="mt-1.5" data-testid="category-select">
                                <SelectValue placeholder="Select category" />
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
                        <Select value={formData.condition} onValueChange={(value) => updateForm('condition', value)}>
                            <SelectTrigger className="mt-1.5" data-testid="condition-select">
                                <SelectValue placeholder="Select condition" />
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
                            placeholder="e.g., M, L, XL"
                            value={formData.size}
                            onChange={(e) => updateForm('size', e.target.value)}
                            className="mt-1.5"
                            data-testid="size-input"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="font-heading font-semibold">Pricing</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    {normalizedType === 'sell' ? (
                        <div>
                            <Label htmlFor="price">Price (INR) *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="2500"
                                value={formData.price}
                                onChange={(e) => updateForm('price', e.target.value)}
                                className="mt-1.5"
                                data-testid="sell-price-input"
                            />
                        </div>
                    ) : (
                        <div>
                            <Label htmlFor="pricePerDay">Price Per Day (INR) *</Label>
                            <Input
                                id="pricePerDay"
                                name="pricePerDay"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="250"
                                value={formData.pricePerDay}
                                onChange={(e) => updateForm('pricePerDay', e.target.value)}
                                className="mt-1.5"
                                data-testid="rent-price-input"
                            />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="deposit">Deposit (INR)</Label>
                        <Input
                            id="deposit"
                            name="deposit"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Optional"
                            value={formData.deposit}
                            onChange={(e) => updateForm('deposit', e.target.value)}
                            className="mt-1.5"
                            data-testid="deposit-input"
                        />
                    </div>
                </div>
            </div>

            <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                    id="location"
                    name="location"
                    placeholder="e.g., North Campus, Hostel Block A"
                    value={formData.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    className="mt-1.5"
                    data-testid="location-input"
                />
            </div>

            <div className="space-y-3">
                <Label>Image URLs (up to 5)</Label>
                <div className="flex gap-2">
                    <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        data-testid="image-url-input"
                    />
                    <Button type="button" variant="outline" onClick={addImage} disabled={formData.images.length >= 5}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {formData.images.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                        {formData.images.map((image, index) => (
                            <Card key={`${image}-${index}`}>
                                <CardContent className="p-3 flex items-center justify-between gap-2">
                                    <span className="text-xs truncate">{image}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={loading} data-testid="submit-upload-form">
                {loading ? 'Saving...' : submitLabel}
            </Button>
        </form>
    );
}
