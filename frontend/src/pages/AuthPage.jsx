import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, EyeSlash } from '@phosphor-icons/react';

const COLLEGE_OPTIONS = [
    'Jharkhand Raksha Shakti University',
    'Banaras Hindu University (BHU)',
    'Delhi University (DU)',
    'Jawaharlal Nehru University (JNU)',
    'Jamia Millia Islamia',
    'University of Hyderabad',
    'Aligarh Muslim University (AMU)',
    'Indian Institute of Technology Delhi (IIT Delhi)',
    'Indian Institute of Technology Bombay (IIT Bombay)',
    'Indian Institute of Technology Kanpur (IIT Kanpur)',
    'Indian Institute of Technology Kharagpur (IIT Kharagpur)',
    'National Institute of Technology Trichy (NIT Trichy)',
    'National Institute of Technology Surathkal (NIT Surathkal)',
    'National Institute of Technology Warangal (NIT Warangal)',
    'National Institute of Technology Rourkela (NIT Rourkela)',
    'Indian Institute of Science (IISc Bangalore)',
];

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
    const [signupCollege, setSignupCollege] = useState('');
    const [signupCourse, setSignupCourse] = useState('');
    const [signupCollegeError, setSignupCollegeError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const getAuthErrorMessage = (error, fallbackMessage) => {
        if (error?.response?.data?.detail) {
            return error.response.data.detail;
        }
        if (error?.message === 'Network Error') {
            return 'Cannot connect to backend. Please start the backend server and try again.';
        }
        return fallbackMessage;
    };

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
            toast.error(getAuthErrorMessage(error, 'Invalid credentials'));
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (!signupName || !signupEmail || !signupPassword) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!signupCollege) {
            setSignupCollegeError('Please select your college');
            toast.error('Please select your college');
            return;
        }

        if (signupPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signup(signupName, signupEmail, signupPassword, signupCollege, signupCourse);
            toast.success('OTP sent to your email. Verify to continue.');
            navigate(`/verify-otp?email=${encodeURIComponent(signupEmail)}`);
        } catch (error) {
            toast.error(getAuthErrorMessage(error, 'Failed to create account'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 py-6 lg:px-8 lg:py-10" data-testid="auth-page">
            <div className="section-shell grid items-center gap-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[0.95fr_1.05fr]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hidden lg:block">
                    <div className="rounded-[2rem] border border-border/70 bg-white p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:bg-card">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <ShoppingCart className="h-6 w-6" weight="bold" />
                            </div>
                            <span className="font-heading text-2xl font-semibold tracking-[-0.04em]">CampusMart</span>
                        </Link>

                        <div className="mt-10 space-y-4">
                            <p className="section-kicker">Student marketplace</p>
                        </div>

                        <div className="mt-8 space-y-6">
                            <div className="rounded-[1.5rem] border border-border/70 bg-muted p-5">
                                <div className="text-2xl font-heading font-semibold tracking-[-0.04em]">Verified</div>
                                <div className="mt-1 text-sm text-muted-foreground">Students only</div>
                            </div>
                            <div className="rounded-[1.5rem] border border-border/70 bg-muted p-5">
                                <div className="text-2xl font-heading font-semibold tracking-[-0.04em]">Fast</div>
                                <div className="mt-1 text-sm text-muted-foreground">Quick requests and replies</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
                    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-border/70 bg-white p-4 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:bg-card lg:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3 px-2 pt-1">
                            <div>
                                <p className="section-kicker">Account access</p>
                                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.05em]">Sign in or create an account</h2>
                            </div>
                            <Link to="/" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground">Back home</Link>
                        </div>

                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-muted p-1">
                                <TabsTrigger value="login" className="rounded-full" data-testid="login-tab">Sign In</TabsTrigger>
                                <TabsTrigger value="signup" className="rounded-full" data-testid="signup-tab">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="mt-6">
                                <CardHeader className="space-y-1 px-0 pb-4">
                                    <CardTitle className="font-heading text-xl">Welcome back</CardTitle>
                                    <CardDescription>Enter your credentials to access your account</CardDescription>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-email">Email</Label>
                                            <Input id="login-email" type="email" placeholder="your@email.edu" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} data-testid="login-email-input" className="h-12 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="login-password">Password</Label>
                                            <div className="relative">
                                                <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} data-testid="login-password-input" className="h-12 rounded-full pr-12" />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                        <Button type="submit" className="h-12 w-full rounded-full font-semibold" disabled={loading} data-testid="login-submit-button">
                                            {loading ? 'Signing in...' : 'Sign In'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </TabsContent>

                            <TabsContent value="signup" className="mt-6">
                                <CardHeader className="space-y-1 px-0 pb-4">
                                    <CardTitle className="font-heading text-xl">Create account</CardTitle>
                                    <CardDescription>Join the student marketplace community</CardDescription>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <form className="space-y-4" onSubmit={handleSignup}>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-name">Full Name</Label>
                                            <Input id="signup-name" type="text" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} data-testid="signup-name-input" className="h-12 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email">Email</Label>
                                            <Input id="signup-email" type="email" placeholder="your@email.edu" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} data-testid="signup-email-input" className="h-12 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Password</Label>
                                            <div className="relative">
                                                <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} data-testid="signup-password-input" className="h-12 rounded-full pr-12" />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-college">College</Label>
                                            <Select value={signupCollege} onValueChange={(value) => {
                                                setSignupCollege(value);
                                                if (value) setSignupCollegeError('');
                                            }}>
                                                <SelectTrigger id="signup-college" data-testid="signup-college-select" className="h-12 rounded-full">
                                                    <SelectValue placeholder="Select your college" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {COLLEGE_OPTIONS.map((college) => (
                                                        <SelectItem key={college} value={college}>{college}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {signupCollegeError ? <p className="text-sm text-destructive" data-testid="signup-college-error">{signupCollegeError}</p> : null}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-course">Course (optional)</Label>
                                            <Input id="signup-course" type="text" placeholder="e.g., B.Tech CSE" value={signupCourse} onChange={(e) => setSignupCourse(e.target.value)} data-testid="signup-course-input" className="h-12 rounded-full" />
                                        </div>
                                        <Button type="submit" className="h-12 w-full rounded-full font-semibold" disabled={loading}>
                                            {loading ? 'Creating account...' : 'Create Account'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </TabsContent>
                        </Tabs>

                        <p className="mt-5 text-center text-sm text-muted-foreground">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
