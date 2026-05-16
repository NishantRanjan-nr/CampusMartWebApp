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
import { UploadSimple, X, ImageSquare, CircleNotch } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';
import { optimizeCloudinaryImageUrl } from '../../lib/image';

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
    const [pendingFiles, setPendingFiles] = useState([]);
    const [pendingPreviews, setPendingPreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef(null);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    useEffect(() => {
        if (initialValues) {
            const normalizedImages = Array.isArray(initialValues.images)
                ? initialValues.images.map((image) => String(image))
                : [];
            setFormData({
                ...baseFormState,
                ...initialValues,
                images: normalizedImages,
            });
            setPendingFiles([]);
            setPendingPreviews([]);
        }
    }, [initialValues]);

    // Generate preview URLs for pending files
    useEffect(() => {
        const previews = pendingFiles.map((file) => URL.createObjectURL(file));
        setPendingPreviews(previews);

        // Cleanup blob URLs on unmount or when files change
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [pendingFiles]);

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
            throw new Error(
                'Cloudinary is not configured. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in your .env file.'
            );
        }

        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', file);
        cloudinaryForm.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: cloudinaryForm,
                }
            );

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Cloudinary upload error:', data);
                throw new Error(data.error?.message || 'Upload to Cloudinary failed');
            }

            console.log('Cloudinary response:', data);
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    const handleFilesSelected = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        setPendingFiles((prev) => {
            const remainingSlots = Math.max(0, 5 - ((formData.images?.length || 0) + prev.length));
            return [...prev, ...files.slice(0, remainingSlots)];
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePendingFile = (index) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        const uploadedUrls = [];

        for (const file of pendingFiles) {
            try {
                const uploadedUrl = await uploadToCloudinary(file);
                uploadedUrls.push(uploadedUrl);
            } catch (error) {
                const detail =
                    error?.response?.data?.error?.message ||
                    error?.message ||
                    'Upload failed';
                throw new Error(`Failed to upload "${file.name}": ${detail}`);
            }
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploadingImages) return;

        setUploadingImages(true);
        try {
            const uploadedUrls = await uploadImages();
            const combinedImages = [...(formData.images || []).map((image) => String(image)), ...uploadedUrls];
            const nextFormData = { ...formData, images: combinedImages, type: normalizedType };
            await onSubmit(nextFormData);
            // Only clear pending files after successful submit
            setPendingFiles([]);
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error(error.message || 'Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    const totalImages = formData.images.length + pendingFiles.length;

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
                        disabled={totalImages >= 5 || uploadingImages}
                        data-testid="upload-images-button"
                    >
                        <UploadSimple className="mr-2 h-4 w-4" />
                        Add Photos
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

                {/* Image preview grid — uploaded + pending */}
                {(formData.images.length > 0 || pendingFiles.length > 0) ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {/* Already-uploaded images */}
                        {formData.images.map((url, index) => (
                            <div
                                key={`uploaded-${index}`}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                            >
                                <img
                                    src={optimizeCloudinaryImageUrl(url)}
                                    alt={`Listing ${index + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}

                        {/* Pending files — local previews */}
                        {pendingFiles.map((file, index) => (
                            <div
                                key={`pending-${file.name}-${index}`}
                                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40 bg-muted"
                            >
                                <img
                                    src={pendingPreviews[index]}
                                    alt={file.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removePendingFile(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                                    <span className="text-[10px] text-white truncate block">Ready to upload</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/40 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageSquare className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to add photos</p>
                    </div>
                )}

                {totalImages > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {formData.images.length} uploaded, {pendingFiles.length} ready to upload — {5 - totalImages} slots remaining
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={loading || uploadingImages}
                data-testid="submit-upload-form"
            >
                {uploadingImages ? (
                    <>
                        <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                        Uploading images...
                    </>
                ) : loading ? (
                    'Saving...'
                ) : (
                    submitLabel
                )}
            </Button>
        </form>
    );
}
