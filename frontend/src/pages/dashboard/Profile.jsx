import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, MapPin, Envelope, Calendar } from '@phosphor-icons/react';
import { format } from 'date-fns';

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        location: user?.location || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name: formData.name,
                location: formData.location
            });
            toast.success('Profile updated!');
            setEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            location: user?.location || ''
        });
        setEditing(false);
    };

    return (
        <div className="max-w-2xl mx-auto" data-testid="profile-page">
            <h1 className="text-2xl font-heading font-bold tracking-tight mb-6">Profile</h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                            {!editing && (
                                <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid="edit-profile-button">
                                    Edit
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-foreground">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg">{user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        <Separator />

                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1.5"
                                        data-testid="profile-name-input"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g., North Campus"
                                        className="mt-1.5"
                                        data-testid="profile-location-input"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={loading} data-testid="save-profile-button">
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{user?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Envelope className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{user?.location || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Member Since</p>
                                        <p className="font-medium">
                                            {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={logout} data-testid="logout-button">
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
