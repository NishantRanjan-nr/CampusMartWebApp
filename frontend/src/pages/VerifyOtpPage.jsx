import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShoppingCart } from '@phosphor-icons/react';

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { verifyOtp, resendOtp, isAuthenticated } = useAuth();

    const initialEmail = searchParams.get('email') || '';
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    if (isAuthenticated) {
        navigate('/dashboard');
        return null;
    }

    const getErrorMessage = (error, fallback) => {
        if (error?.response?.data?.detail) {
            return error.response.data.detail;
        }
        if (error?.message === 'Network Error') {
            return 'Cannot connect to backend. Please start the backend server and try again.';
        }
        return fallback;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email || !otp) {
            toast.error('Please enter email and OTP');
            return;
        }

        setVerifying(true);
        try {
            await verifyOtp(email, otp);
            toast.success('Email verified successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to verify OTP'));
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Please enter your email first');
            return;
        }

        setResending(true);
        try {
            await resendOtp(email);
            toast.success('A new OTP has been sent');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to resend OTP'));
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4" data-testid="verify-otp-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-md"
            >
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                        <ShoppingCart className="w-7 h-7 text-primary-foreground" weight="bold" />
                    </div>
                    <span className="font-heading font-bold text-2xl">CampusMart</span>
                </Link>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-heading">Verify your email</CardTitle>
                        <CardDescription>
                            Enter the 6-digit OTP sent to your inbox to activate your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp-email">Email</Label>
                                <Input
                                    id="otp-email"
                                    type="email"
                                    placeholder="your@email.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="otp-code">OTP Code</Label>
                                <Input
                                    id="otp-code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={verifying}>
                                {verifying ? 'Verifying...' : 'Verify Email'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleResend}
                                disabled={resending}
                            >
                                {resending ? 'Sending...' : 'Resend OTP'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
