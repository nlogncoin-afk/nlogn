import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, Input, Container } from '../../components/ui/Layout';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '../../services/api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await forgotPassword(email);
            toast.success(res.data.message);
            // Navigate to verify OTP page, passing user ID state
            navigate('/verify-reset-otp', { state: { userId: res.data.userId, email } });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send OTP');
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
                        <Link to="/login" className="text-zinc-500 hover:text-white flex items-center mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-zinc-400">Enter your email to receive a verification code.</p>
                    </div>

                    <Card className="bg-[#0a0a0a]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={Mail}
                            />
                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" isLoading={isLoading}>
                                Send OTP
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            </Container>
        </div>
    );
}
