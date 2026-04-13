import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Plus, UploadSimple, X } from '@phosphor-icons/react';
import axios from 'axios';

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
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef(null);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    useEffect(() => {
        if (initialValues) {
            const normalizedImages = Array.isArray(initialValues.images)
                ? initialValues.images.map((image) => String(image))
                : [];
            console.log('UploadForm received images:', normalizedImages);
            setFormData({
                ...baseFormState,
                ...initialValues,
                images: normalizedImages,
            });
        }
    }, [initialValues]);

    const normalizedType = useMemo(() => (formData.type === 'rent' ? 'rent' : 'sell'), [formData.type]);

    const updateForm = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const setImages = (updater) => {
        setFormData((prev) => {
            const nextImages = typeof updater === 'function' ? updater(prev.images || []) : updater;
            return {
                ...prev,
                images: nextImages.map((image) => String(image)),
            };
        });
    };

    const uploadToCloudinary = async (file) => {
        if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary environment variables are missing');
        }

        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', file);
        cloudinaryForm.append('upload_preset', uploadPreset);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            cloudinaryForm,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        return response.data.secure_url;
    };

    const handleFilesSelected = async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const remainingSlots = Math.max(0, 5 - (formData.images?.length || 0));
        const filesToUpload = files.slice(0, remainingSlots);
        if (!filesToUpload.length) return;

        setUploadingImages(true);
        try {
            const uploadedUrls = [];
            for (const file of filesToUpload) {
                const uploadedUrl = await uploadToCloudinary(file);
                uploadedUrls.push(uploadedUrl);
                console.log('UploadForm uploaded image URL:', uploadedUrl);
            }

            setImages((prev) => [...prev, ...uploadedUrls]);
        } catch (error) {
            console.error('Cloudinary upload failed:', error);
        } finally {
            setUploadingImages(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('UploadForm submitting images:', formData.images);
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
                <div className="flex items-center justify-between gap-3">
                    <Label>Listing Photos (up to 5)</Label>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={formData.images.length >= 5 || uploadingImages}
                        data-testid="upload-images-button"
                    >
                        <UploadSimple className="mr-2 h-4 w-4" />
                        {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    </Button>
                </div>
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handleFilesSelected}
                    className="hidden"
                    data-testid="image-file-input"
                />
                <p className="text-xs text-muted-foreground">
                    Pick photos from your device or camera. They will be uploaded to Cloudinary and saved as URLs.
                </p>

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
