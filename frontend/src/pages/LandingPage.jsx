import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Terminal, Brain, Users, CheckCircle, ChevronRight, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Container, Section, Card } from '../components/ui/Layout';

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
                <Container className="flex items-center justify-between h-16 relative">
                    <span className="text-xl font-display font-bold tracking-tighter">nlogn</span>
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-zinc-400">
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#process" className="hover:text-white transition-colors">Process</a>
                        <a href="#why" className="hover:text-white transition-colors">Why Us</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                        <Button variant="white" size="sm" onClick={() => navigate('/register')}>Book Interview</Button>
                    </div>
                </Container>
            </nav>

            {/* Hero Section */}
            <Section className="pt-32 pb-20 md:pt-48 md:pb-32 flex items-center justify-center min-h-[80vh]">
                <Container className="text-center relative z-10">
                    <FadeIn>
                        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] text-glow mb-8">
                            INTERVIEWS<br />
                            ARE A DIFFERENT<br />
                            GAME.
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2} className="max-w-2xl mx-auto mb-10">
                        <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed">
                            Simulate real SDE-1 interviews before your placement season begins.
                            Master the pressure, not just the code.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="bg-white text-black hover:bg-zinc-200 w-full sm:w-auto" onClick={() => navigate('/register')}>
                            Book Interview <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Learn More
                        </Button>
                    </FadeIn>
                </Container>

                {/* Background Grid/Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
            </Section>

            {/* About Section */}
            <Section id="about" className="bg-zinc-950/50">
                <Container>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <FadeIn>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">What is nlogn?</h2>
                            <div className="space-y-6 text-lg text-zinc-400">
                                <p>
                                    We are an interview simulation platform designed specifically for SDE-1 aspirants.
                                    Most students know DSA, but fail to communicate their thoughts under pressure.
                                </p>
                                <p>
                                    nlogn provides that crucial bridge between LeetCode and the actual interview room.
                                    Real environments, real constraints, and honest feedback.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.2} className="relative h-[400px] rounded-2xl overflow-hidden glass-card flex items-center justify-center">
                            {/* Abstract decorative element */}
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
                            <Terminal className="w-24 h-24 text-zinc-600 relative z-10" />
                        </FadeIn>
                    </div>
                </Container>
            </Section>

            {/* Who is this for */}
            <Section>
                <Container>
                    <FadeIn className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Who is this for?</h2>
                    </FadeIn>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="hover:border-zinc-700">
                            <Users className="w-10 h-10 mb-6 text-white" />
                            <h3 className="text-xl font-bold mb-3">Placement Students</h3>
                            <p className="text-zinc-400">Final year students preparing for campus drives and off-campus opportunities.</p>
                        </Card>
                        <Card className="hover:border-zinc-700">
                            <Code className="w-10 h-10 mb-6 text-white" />
                            <h3 className="text-xl font-bold mb-3">DSA Learners</h3>
                            <p className="text-zinc-400">You've solved 500+ problems but have never explained your code to a human.</p>
                        </Card>
                        <Card className="hover:border-zinc-700">
                            <Brain className="w-10 h-10 mb-6 text-white" />
                            <h3 className="text-xl font-bold mb-3">Career Switchers</h3>
                            <p className="text-zinc-400">Professionals moving from service-based to product-based companies.</p>
                        </Card>
                    </div>
                </Container>
            </Section>

            {/* Booking Process */}
            <Section id="process" className="bg-zinc-950/30">
                <Container>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">How It Works</h2>
                        <p className="text-zinc-400">Simple, streamlined, effective.</p>
                    </div>

                    <div className="relative">
                        {/* Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-zinc-800 -translate-y-1/2 z-0" />

                        <div className="grid md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { step: "01", title: "Register", desc: "Create your account in seconds." },
                                { step: "02", title: "Select Slot", desc: "Choose a time that works for you." },
                                { step: "03", title: "Video Interview", desc: "60 mins with an industry expert." },
                                { step: "04", title: "Feedback", desc: "Detailed report on your performance." }
                            ].map((item, i) => (
                                <FadeIn key={i} delay={i * 0.1}>
                                    <div className="bg-black border border-zinc-800 p-6 rounded-xl text-center md:text-left h-full">
                                        <span className="block text-4xl font-display font-bold text-zinc-700 mb-4">{item.step}</span>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="text-zinc-400 text-sm">{item.desc}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Why Choose NlogN */}
            <Section id="why">
                <Container>
                    <div className="mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">We Don’t Just Test Code.</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            "Problem Solving", "DSA Optimization", "Communication", "Code Quality"
                        ].map((feature, i) => (
                            <Card key={i} className="group">
                                <div className="h-1 w-12 bg-zinc-800 group-hover:bg-white transition-colors duration-300 mb-6" />
                                <h3 className="text-2xl font-display font-bold mb-2">{feature}</h3>
                                <p className="text-zinc-500 text-sm group-hover:text-zinc-300 transition-colors">
                                    Rigorous evaluation of your {feature.toLowerCase()} skills.
                                </p>
                            </Card>
                        ))}
                    </div>
                </Container>
            </Section>

            {/* Founder Section */}
            <Section className="py-32 bg-black">
                <Container className="max-w-3xl text-center">
                    <FadeIn>
                        <div className="mb-12">
                            <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">The Story</p>
                            <h2 className="text-3xl md:text-4xl font-display font-bold">Hello and welcome to nlogn.</h2>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2} className="space-y-8 text-lg md:text-xl text-zinc-400 leading-relaxed font-light text-left">
                        <p>
                            The story of nlogn starts from my placement season in BTech 4th year. After solving hundreds of DSA questions, I still wasn’t confident because I had never experienced a real interview before. I knew the concepts. I had practiced on platforms. But when it came to sitting in front of someone and solving a problem under pressure I realized that was a completely different game.
                        </p>
                        <p>
                            And that’s when it hit me. We focus so much on preparation but very little on simulation. We solve questions alone. But interviews are not just about solving, they’re about thinking out loud, handling pressure, structuring your approach, and communicating clearly. That gap between preparation and real performance is where most students lose confidence.
                        </p>
                        <p>
                            And that gap is exactly why nlogn was created. nlogn is not just about coding. It’s about experience. It’s about building real confidence before you sit in the actual interview. It’s about facing pressure in a safe environment, learning from it, and improving every single time.
                        </p>
                        <p>
                            I don’t want you to repeat the same mistake I did, being technically prepared but mentally untested. Here, you’ll get the opportunity to simulate real interview environments, push your limits, and most importantly grow together.
                        </p>

                        <div className="pt-8">
                            <p className="font-display font-bold text-white text-2xl">— The Founder</p>
                        </div>
                    </FadeIn>
                </Container>
            </Section>

            {/* Final CTA */}
            <Section className="py-32 border-t border-zinc-900">
                <Container className="text-center">
                    <FadeIn>
                        <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8">
                            Preparation meets<br />confidence.
                        </h2>
                        <Button size="lg" className="h-16 px-10 text-xl bg-white text-black hover:bg-zinc-200" onClick={() => navigate('/register')}>
                            Book Your Slot
                        </Button>
                    </FadeIn>
                </Container>
            </Section>

            {/* Footer */}
            <footer className="py-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
                <Container>
                    <p>&copy; {new Date().getFullYear()} nlogn. All rights reserved.</p>
                </Container>
            </footer>
        </div>
    );
}
