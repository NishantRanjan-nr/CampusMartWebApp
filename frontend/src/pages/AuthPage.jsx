import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, EyeSlash } from '@phosphor-icons/react';

export default function AuthPage() {
    const navigate = useNavigate();
    const { login, signup, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup form
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupLocation, setSignupLocation] = useState('');

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/dashboard');
        return null;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!signupName || !signupEmail || !signupPassword) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (signupPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signup(signupName, signupEmail, signupPassword, signupLocation);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4" data-testid="auth-page">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                        <ShoppingCart className="w-7 h-7 text-primary-foreground" weight="bold" />
                    </div>
                    <span className="font-heading font-bold text-2xl">CampusMart</span>
                </Link>

                <Card className="border-border/50">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value="login">
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-heading">Welcome back</CardTitle>
                                <CardDescription>
                                    Enter your credentials to access your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="your@email.edu"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            data-testid="login-email-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                data-testid="login-password-input"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                        data-testid="login-submit-button"
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            </CardContent>
                        </TabsContent>

                        {/* Signup Tab */}
                        <TabsContent value="signup">
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-heading">Create account</CardTitle>
                                <CardDescription>
                                    Join the student marketplace community
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={signupName}
                                            onChange={(e) => setSignupName(e.target.value)}
                                            data-testid="signup-name-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="your@email.edu"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            data-testid="signup-email-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="signup-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                data-testid="signup-password-input"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-location">Campus/Location (optional)</Label>
                                        <Input
                                            id="signup-location"
                                            type="text"
                                            placeholder="e.g., North Campus"
                                            value={signupLocation}
                                            onChange={(e) => setSignupLocation(e.target.value)}
                                            data-testid="signup-location-input"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                        data-testid="signup-submit-button"
                                    >
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
