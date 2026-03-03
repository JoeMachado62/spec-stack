import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Layers, ArrowRight, Sparkles, Target, Rocket, BookOpen, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleCTA = () => {
        navigate(isAuthenticated ? '/dashboard' : '/register');
    };

    return (
        <div className="min-h-screen relative">
            <div className="ambient-bg" />

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-[var(--font-display)] font-bold text-lg gradient-text-brand">Spec Stack</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <button onClick={() => navigate('/dashboard')} className="btn-primary">
                                <span>Dashboard</span>
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="btn-ghost">Sign In</button>
                                <button onClick={() => navigate('/register')} className="btn-primary">
                                    <span>Get Started</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] text-xs font-medium">
                    <Zap className="w-3 h-3" /> Built for the AI-first era
                </div>
                <h1 className="text-5xl md:text-6xl font-bold font-[var(--font-display)] leading-tight mb-6">
                    Turn your ideas into
                    <br />
                    <span className="gradient-text">AI-ready specs</span>
                </h1>
                <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                    Stop babysitting your AI. Spec Stack transforms plain-language business ideas into structured specifications
                    that autonomous agents can execute — <strong>without you watching over their shoulder.</strong>
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button onClick={handleCTA} className="btn-primary text-base px-8 py-3">
                        <span className="flex items-center gap-2">
                            Start Building <ArrowRight className="w-5 h-5" />
                        </span>
                    </button>
                    <button className="btn-secondary text-base px-8 py-3">
                        See How It Works
                    </button>
                </div>
            </section>

            {/* How It Works — 4 Stages */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold font-[var(--font-display)] text-center mb-4">
                    Four steps. Zero jargon. Full autonomy.
                </h2>
                <p className="text-center text-[var(--color-text-muted)] mb-12 max-w-md mx-auto">
                    We guide you through each step in plain language — you provide the judgment, we handle the structure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: <Sparkles className="w-6 h-6" />, title: 'Describe Your Idea', sub: 'Tell us what you want in your own words.', color: 'from-purple-500/20 to-violet-500/20', textColor: 'text-purple-400' },
                        { icon: <BookOpen className="w-6 h-6" />, title: 'Add Context', sub: 'We figure out what your AI needs to know.', color: 'from-blue-500/20 to-indigo-500/20', textColor: 'text-blue-400' },
                        { icon: <Target className="w-6 h-6" />, title: 'Set Priorities', sub: 'Choose what matters most through simple trade-offs.', color: 'from-amber-500/20 to-orange-500/20', textColor: 'text-amber-400' },
                        { icon: <Rocket className="w-6 h-6" />, title: 'Get Your Spec', sub: 'A complete plan your AI can execute autonomously.', color: 'from-emerald-500/20 to-cyan-500/20', textColor: 'text-emerald-400' },
                    ].map((step, i) => (
                        <div key={i} className="glass-card p-6 text-center group">
                            <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center ${step.textColor} group-hover:scale-110 transition-transform`}>
                                {step.icon}
                            </div>
                            <div className="text-xs font-bold text-[var(--color-text-muted)] mb-2">STEP {i + 1}</div>
                            <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">{step.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6">
                        <Shield className="w-8 h-8 text-[var(--color-accent-green)] mb-4" />
                        <h3 className="font-semibold mb-2">No jargon. Ever.</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            We translate engineering concepts into plain language. You'll never be asked about "constraint architectures" or "decomposition patterns."
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <Zap className="w-8 h-8 text-[var(--color-accent-yellow)] mb-4" />
                        <h3 className="font-semibold mb-2">Show, don't ask.</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            We show you completed examples from businesses like yours — you edit them instead of building from scratch.
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <Rocket className="w-8 h-8 text-[var(--color-accent-cyan)] mb-4" />
                        <h3 className="font-semibold mb-2">One-click launch.</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Export your spec as Markdown, claude.md, or JSON — or launch it directly to Claude or ChatGPT with one click.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 text-center">
                <div className="max-w-2xl mx-auto glass-card p-12">
                    <h2 className="text-3xl font-bold font-[var(--font-display)] mb-4 gradient-text">
                        Stop prompting. Start specifying.
                    </h2>
                    <p className="text-[var(--color-text-muted)] mb-8">
                        Join solopreneurs who are getting 10x more from their AI — without learning engineering.
                    </p>
                    <button onClick={handleCTA} className="btn-primary text-base px-8 py-3 animate-pulse-glow">
                        <span className="flex items-center gap-2">
                            Build Your First Spec <ArrowRight className="w-5 h-5" />
                        </span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-[var(--color-border-subtle)]">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <Layers className="w-4 h-4" />
                        <span>Spec Stack © 2026</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Built for the AI-first solopreneur
                    </p>
                </div>
            </footer>
        </div>
    );
}
