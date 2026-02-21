import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, Input, Container } from '../../components/ui/Layout';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import { toast } from 'react-toastify';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unverifiedUser, setUnverifiedUser] = useState(null); // { email, userId }
    const navigate = useNavigate();

    const { login } = useAuth();
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await loginApi({ email, password });

            login(
                {
                    id: res.data.user.id,
                    fullName: res.data.user.fullName,
                    email: res.data.user.email,
                    role: res.data.user.role,
                    isBlocked: res.data.user.isBlocked,
                },
                res.data.token
            );

            toast.success('Login successful!');

            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login failed", error);
            if (error.response && error.response.status === 401 && error.response.data.userId) {
                setUnverifiedUser({ email, userId: error.response.data.userId });
            }
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />

            <Container className="max-w-md relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8">
                        <Link to="/" className="text-zinc-500 hover:text-white flex items-center mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h1>
                        <p className="text-zinc-400">Enter your credentials to access your account.</p>
                    </div>

                    <Card className="bg-[#0a0a0a]">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                label="Email"
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password" className="text-sm font-medium text-zinc-400">Password</label>
                                    <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot password?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" isLoading={isLoading}>
                                Sign In
                            </Button>

                            {unverifiedUser && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2 border-red-500 text-red-500 hover:bg-red-950/30"
                                    onClick={() => navigate('/verify-email', { state: { email: unverifiedUser.email, tempId: unverifiedUser.userId } })}
                                >
                                    Verify Email
                                </Button>
                            )}
                        </form>
                    </Card>

                    <p className="mt-6 text-center text-sm text-zinc-500">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-white hover:underline">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </Container>
        </div>
    );
}
