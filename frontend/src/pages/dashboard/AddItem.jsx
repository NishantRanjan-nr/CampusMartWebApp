import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
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
import { ArrowLeft, Plus, X, UploadSimple, Spinner, Link as LinkIcon } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const defaultImages = {
    electronics: 'https://images.unsplash.com/photo-1760462788374-fe0d2d4ba4d1?w=800',
    clothes: 'https://images.unsplash.com/photo-1574089511111-14c8dbb77b2a?w=800',
    books: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
};

export default function AddItem() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price_per_day: '',
        deposit: '',
        location: '',
        condition: 'Good',
        size: '',
        images: []
    });
    const [imageUrl, setImageUrl] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const uploadToCloudinary = async (file) => {
        const cloudFormData = new FormData();
        cloudFormData.append('file', file);
        cloudFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            cloudFormData
        );
        return response.data.secure_url;
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const remainingSlots = 5 - formData.images.length;
        if (files.length > remainingSlots) {
            toast.error(`You can only add ${remainingSlots} more image(s) (max 5)`);
            return;
        }

        // Validate file sizes (max 10MB each)
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`"${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const urls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...urls]
            }));
            toast.success(`${files.length} image(s) uploaded successfully!`);
        } catch (error) {
            console.error('Upload error:', error);
            const cloudinaryMsg = error.response?.data?.error?.message;
            if (cloudinaryMsg) {
                toast.error(`Upload failed: ${cloudinaryMsg}`);
            } else if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
                toast.error('Cloudinary environment variables are not set. Check your .env file.');
            } else {
                toast.error('Failed to upload image. Please check your Cloudinary settings.');
            }
        } finally {
            setUploading(false);
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
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

        setLoading(true);
        try {
            const payload = {
                ...formData,
                price_per_day: parseFloat(formData.price_per_day),
                deposit: parseFloat(formData.deposit),
                images: formData.images.length > 0 ? formData.images : [defaultImages[formData.category] || defaultImages.electronics]
            };

            await axios.post(`${API}/items`, payload);
            toast.success('Item listed successfully!');
            navigate('/dashboard/listings');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto" data-testid="add-item-page">
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
                    <h1 className="text-2xl font-heading font-bold tracking-tight">Add New Item</h1>
                    <p className="text-muted-foreground">List your item for rent</p>
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
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g., MacBook Pro 14-inch"
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
                                        placeholder="Describe your item, its features, and any conditions..."
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
                                        <Select
                                            value={formData.condition}
                                            onValueChange={(value) => handleSelectChange('condition', value)}
                                        >
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
                                            placeholder="15.00"
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
                                            placeholder="50.00"
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
                                    placeholder="e.g., North Campus, Building A"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="mt-1.5"
                                    data-testid="location-input"
                                />
                            </div>

                            {/* Images */}
                            <div className="space-y-4">
                                <h3 className="font-heading font-semibold">Images</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upload up to 5 images from your device. If none provided, a default image will be used.
                                </p>

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    data-testid="file-upload-input"
                                />

                                {/* Upload buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading || formData.images.length >= 5}
                                        className="flex-1"
                                        data-testid="upload-image-button"
                                    >
                                        {uploading ? (
                                            <>
                                                <Spinner className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <UploadSimple className="w-4 h-4 mr-2" />
                                                Upload from device
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowUrlInput(!showUrlInput)}
                                        className="text-xs text-muted-foreground"
                                    >
                                        <LinkIcon className="w-3 h-3 mr-1" />
                                        Paste URL
                                    </Button>
                                </div>

                                {/* URL input (toggle) */}
                                {showUrlInput && (
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
                                )}

                                {/* Image previews */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                                                    data-testid={`remove-image-${index}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Remaining slots indicator */}
                                {formData.images.length > 0 && formData.images.length < 5 && (
                                    <p className="text-xs text-muted-foreground">
                                        {5 - formData.images.length} image slot(s) remaining
                                    </p>
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
                                    disabled={loading || uploading}
                                    className="flex-1"
                                    data-testid="submit-item-button"
                                >
                                    {loading ? 'Creating...' : 'List Item'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
