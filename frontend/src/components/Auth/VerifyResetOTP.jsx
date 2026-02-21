import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, Input, Container } from '../../components/ui/Layout';
import { verifyResetOTP, resendOTP } from '../../services/api';
import { toast } from 'react-toastify';
import { KeyRound } from 'lucide-react';

export default function VerifyResetOTP() {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, email } = location.state || {};

    if (!userId) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await verifyResetOTP({ userId, otp });
            toast.success(res.data.message);
            // Navigate to reset password page, passing reset token
            navigate('/reset-password', { state: { resetToken: res.data.resetToken } });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />
            <Container className="max-w-md relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Verify OTP</h1>
                        <p className="text-zinc-400">Enter the code sent to {email}</p>
                    </div>

                    <Card className="bg-[#0a0a0a]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="OTP Code"
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                icon={KeyRound}
                            />
                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" isLoading={isLoading}>
                                Verify Code
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={async () => {
                                    try {
                                        await resendOTP({ userId, email });
                                        toast.success('OTP Resent!');
                                    } catch (error) {
                                        toast.error('Failed to resend OTP');
                                    }
                                }}
                                className="text-sm text-zinc-500 hover:text-white transition-colors"
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>
                    </Card>
                </motion.div>
            </Container>
        </div>
    );
}
