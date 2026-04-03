import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from '@phosphor-icons/react';

export default function ItemDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`https://fakestoreapi.com/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            navigate('/browse');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-background py-6 lg:py-10" data-testid="item-detail-page">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 gap-2"
                    data-testid="back-button"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Browse
                </Button>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="overflow-hidden">
                            <div className="aspect-square bg-white p-8">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                    data-testid="product-image"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-foreground mb-2" data-testid="product-title">
                                {product.title}
                            </h1>
                            <p className="text-sm text-muted-foreground capitalize" data-testid="product-category">
                                {product.category}
                            </p>
                        </div>

                        <div className="text-4xl font-bold text-primary" data-testid="product-price">
                            ₹{product.price.toFixed(2)}
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-heading font-semibold mb-3">Description</h3>
                                <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
                                    {product.description}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button className="flex-1 gap-2" size="lg" data-testid="add-to-cart-button">
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
