import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, Input, Container } from '../../components/ui/Layout';
import { ArrowLeft } from 'lucide-react';
import { register as registerApi } from '../../services/api';
import { toast } from 'react-toastify';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await registerApi({ fullName: formData.name, email: formData.email, password: formData.password });
            toast.success(res.data.message || 'Registration successful!');
            navigate('/verify-email', { state: { email: formData.email, tempId: res.data.userId } });
        } catch (error) {
            console.error("Registration failed", error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />

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
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Create an account</h1>
                        <p className="text-zinc-400">Start your journey to interview mastery.</p>
                    </div>

                    <Card className="bg-[#0a0a0a]">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <Input
                                label="Full Name"
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Password"
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                id="confirmPassword"
                                type="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />

                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </form>
                    </Card>

                    <p className="mt-6 text-center text-sm text-zinc-500">
                        Already have an account? {' '}
                        <Link to="/login" className="text-white hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </Container>
        </div>
    );
}
