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
        college: user?.college || ''
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
                college: formData.college
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
            college: user?.college || ''
        });
        setEditing(false);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6" data-testid="profile-page">
            <div className="rounded-[2rem] border border-border/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                <p className="section-kicker">Profile</p>
                <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em]">Personal information</h1>
                <p className="mt-2 text-muted-foreground">Keep your account details current so listings and chats stay accurate.</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <Card className="rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="font-heading text-lg">Personal Information</CardTitle>
                            {!editing && (
                                <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid="edit-profile-button" className="rounded-full">
                                    Edit
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-2xl font-semibold text-background">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-heading text-lg font-semibold">{user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        <Separator />

                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1.5 h-12 rounded-full" data-testid="profile-name-input" />
                                </div>
                                <div>
                                    <Label htmlFor="college">College</Label>
                                    <Input id="college" name="college" value={formData.college} onChange={handleChange} placeholder="Your college" className="mt-1.5 h-12 rounded-full" data-testid="profile-college-input" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" onClick={handleCancel} className="rounded-full">Cancel</Button>
                                    <Button onClick={handleSave} disabled={loading} data-testid="save-profile-button" className="rounded-full">{loading ? 'Saving...' : 'Save Changes'}</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-border/70 p-4">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Name</p>
                                            <p className="mt-1 font-medium">{user?.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-border/70 p-4">
                                    <div className="flex items-center gap-3">
                                        <Envelope className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Email</p>
                                            <p className="mt-1 font-medium">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-border/70 p-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">College</p>
                                            <p className="mt-1 font-medium">{user?.college || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-border/70 p-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Member Since</p>
                                            <p className="mt-1 font-medium">{user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-[1.5rem] border border-border/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card">
                    <CardHeader>
                        <CardTitle className="font-heading text-lg">Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={logout} data-testid="logout-button" className="rounded-full">Sign Out</Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
