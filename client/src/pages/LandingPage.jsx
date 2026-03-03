import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Layers, ArrowRight, Sparkles, Target, Rocket, BookOpen, Zap, Shield, ChevronDown } from 'lucide-react';

export default function LandingPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleCTA = () => {
        navigate(isAuthenticated ? '/dashboard' : '/register');
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            <div className="ambient-bg" />

            {/* ═══════════════════════════════
                Navigation
               ═══════════════════════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-[var(--font-display)] font-bold text-xl gradient-text-brand">PRD Wizard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <button onClick={() => navigate('/dashboard')} className="btn-primary">
                                <span>Dashboard</span>
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="btn-ghost hidden sm:inline-flex">Sign In</button>
                                <button onClick={() => navigate('/register')} className="btn-primary">
                                    <span>Get Started Free</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════
                Hero Section — spacious
               ═══════════════════════════════ */}
            <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] text-sm font-medium animate-fade-in">
                        <Zap className="w-3.5 h-3.5" /> Built for the AI-first era
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-display)] leading-[1.1] mb-8 animate-fade-in">
                        Turn your ideas into
                        <br />
                        <span className="gradient-text">AI-ready specs</span>
                    </h1>

                    {/* Subhead */}
                    <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in">
                        Stop babysitting your AI. PRD Wizard transforms plain-language business ideas
                        into structured specifications that autonomous agents can execute —
                        <strong className="text-[var(--color-text-primary)]"> without you watching over their shoulder.</strong>
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
                        <button onClick={handleCTA} className="btn-primary text-base px-10 py-4 animate-pulse-glow">
                            <span className="flex items-center gap-2">
                                Start Building <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>
                        <a href="#how-it-works" className="btn-secondary text-base px-10 py-4">
                            See How It Works
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 animate-float">
                    <ChevronDown className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>
            </section>

            {/* ═══════════════════════════════
                How It Works — 4 Stages
               ═══════════════════════════════ */}
            <section id="how-it-works" className="py-32 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mb-6">
                            Four steps. Zero jargon. Full autonomy.
                        </h2>
                        <p className="text-lg text-[var(--color-text-muted)] max-w-lg mx-auto">
                            We guide you through each step in plain language — you provide the judgment, we handle the structure.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <Sparkles className="w-7 h-7" />, title: 'Describe Your Idea', sub: 'Tell us what you want in your own words. No jargon, no forms, just your idea.', color: 'from-purple-500/20 to-violet-500/20', textColor: 'text-purple-400' },
                            { icon: <BookOpen className="w-7 h-7" />, title: 'Add Context', sub: 'We figure out what your AI needs to know about your business and this task.', color: 'from-blue-500/20 to-indigo-500/20', textColor: 'text-blue-400' },
                            { icon: <Target className="w-7 h-7" />, title: 'Set Priorities', sub: 'Choose what matters most through simple trade-offs. No spreadsheets needed.', color: 'from-amber-500/20 to-orange-500/20', textColor: 'text-amber-400' },
                            { icon: <Rocket className="w-7 h-7" />, title: 'Get Your Spec', sub: 'A complete plan your AI can execute autonomously — one click to launch.', color: 'from-emerald-500/20 to-cyan-500/20', textColor: 'text-emerald-400' },
                        ].map((step, i) => (
                            <div key={i} className="glass-card p-8 text-center group hover:scale-[1.02] transition-transform">
                                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center ${step.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                <div className="text-[0.625rem] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-3">Step {i + 1}</div>
                                <h3 className="text-lg font-semibold mb-3 font-[var(--font-display)]">{step.title}</h3>
                                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{step.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                Features — 3 Pillars
               ═══════════════════════════════ */}
            <section className="py-32 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mb-6">
                            Why solopreneurs love it
                        </h2>
                        <p className="text-lg text-[var(--color-text-muted)] max-w-lg mx-auto">
                            Built for vibe coders, founders, and creatives — not engineers.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-10 hover:scale-[1.02] transition-transform">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-green)]/10 flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-[var(--color-accent-green)]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 font-[var(--font-display)]">No jargon. Ever.</h3>
                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                We translate engineering concepts into plain language. You'll never be asked about "constraint architectures" or "decomposition patterns."
                            </p>
                        </div>
                        <div className="glass-card p-10 hover:scale-[1.02] transition-transform">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-yellow)]/10 flex items-center justify-center mb-6">
                                <Zap className="w-7 h-7 text-[var(--color-accent-yellow)]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 font-[var(--font-display)]">Show, don't ask.</h3>
                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                We show you completed examples from businesses like yours — you edit them instead of building from scratch.
                            </p>
                        </div>
                        <div className="glass-card p-10 hover:scale-[1.02] transition-transform">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-cyan)]/10 flex items-center justify-center mb-6">
                                <Rocket className="w-7 h-7 text-[var(--color-accent-cyan)]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 font-[var(--font-display)]">One-click launch.</h3>
                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                Export your spec as Markdown, claude.md, or JSON — or launch it directly to Gemini, Claude, or ChatGPT with one click.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                CTA Section
               ═══════════════════════════════ */}
            <section className="py-32 px-6 lg:px-8">
                <div className="max-w-3xl mx-auto glass-card p-16 text-center relative overflow-hidden">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mb-6 gradient-text">
                            Stop prompting. Start specifying.
                        </h2>
                        <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-md mx-auto">
                            Join solopreneurs who are getting 10x more from their AI — without learning engineering.
                        </p>
                        <button onClick={handleCTA} className="btn-primary text-lg px-12 py-4 animate-pulse-glow">
                            <span className="flex items-center gap-3">
                                Build Your First Spec <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                Footer
               ═══════════════════════════════ */}
            <footer className="py-10 px-6 lg:px-8 border-t border-[var(--color-border-subtle)]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <Layers className="w-4 h-4" />
                        <span>PRD Wizard © 2026</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Built for the AI-first solopreneur
                    </p>
                </div>
            </footer>
        </div>
    );
}
