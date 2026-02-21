import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, Input, Container } from '../../components/ui/Layout';
import { resetPassword } from '../../services/api';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { resetToken } = location.state || {};

    if (!resetToken) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await resetPassword({ resetToken, newPassword });
            toast.success(res.data.message);
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to reset password');
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
                        <h1 className="text-3xl font-display font-bold text-white mb-2">New Password</h1>
                        <p className="text-zinc-400">Create a strong password for your account.</p>
                    </div>

                    <Card className="bg-[#0a0a0a]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="New Password"
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                icon={Lock}
                            />
                            <Input
                                label="Confirm Password"
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                icon={Lock}
                            />
                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" isLoading={isLoading}>
                                Set New Password
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            </Container>
        </div>
    );
}
