import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Layers, ArrowRight, Sparkles, Target, Rocket, BookOpen, Zap, Shield, ChevronDown } from 'lucide-react';

export default function LandingPage() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleCTA = () => {
        navigate(isAuthenticated ? '/dashboard' : '/register');
    };

    const steps = [
        { num: '01', icon: <Sparkles className="w-6 h-6" />, title: 'Describe Your Idea', sub: 'Tell us what you want in your own words — like explaining it to a smart colleague.', accent: 'purple' },
        { num: '02', icon: <BookOpen className="w-6 h-6" />, title: 'Add Context', sub: 'We figure out what your AI needs to know about your business and this task.', accent: 'blue' },
        { num: '03', icon: <Target className="w-6 h-6" />, title: 'Set Priorities', sub: 'Choose what matters most through simple trade-offs. When goals conflict, we help you decide.', accent: 'amber' },
        { num: '04', icon: <Rocket className="w-6 h-6" />, title: 'Get Your Spec', sub: 'A complete plan your AI can execute autonomously — one click to launch.', accent: 'emerald' },
    ];

    const accentStyles = {
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            <div className="ambient-bg" />

            {/* ── Nav ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-[var(--font-display)] font-bold text-xl gradient-text-brand">PRD Wizard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <button onClick={() => navigate('/dashboard')} className="btn-primary"><span>Dashboard</span></button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="btn-ghost hidden sm:inline-flex">Sign In</button>
                                <button onClick={() => navigate('/register')} className="btn-primary"><span>Get Started Free</span></button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ══════════════════════════════════
                HERO — full viewport, centered
               ══════════════════════════════════ */}
            <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center relative">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] text-sm font-medium">
                        <Zap className="w-3.5 h-3.5" /> Built for the AI-first era
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-display)] leading-[1.1] mb-8">
                        Turn your ideas into<br />
                        <span className="gradient-text">AI-ready specs</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-12 leading-relaxed">
                        Stop babysitting your AI. PRD Wizard transforms plain-language business ideas
                        into structured specifications that autonomous agents can execute —{' '}
                        <strong className="text-[var(--color-text-primary)]">without you watching over their shoulder.</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={handleCTA} className="btn-primary text-base px-10 py-4 w-full sm:w-auto animate-pulse-glow">
                            <span className="flex items-center justify-center gap-2">Start Building <ArrowRight className="w-5 h-5" /></span>
                        </button>
                        <a href="#how-it-works" className="btn-secondary text-base px-10 py-4 w-full sm:w-auto text-center">
                            See How It Works
                        </a>
                    </div>
                </div>
                <a href="#how-it-works" className="absolute bottom-8 animate-float">
                    <ChevronDown className="w-6 h-6 text-[var(--color-text-muted)]" />
                </a>
            </section>

            {/* ══════════════════════════════════
                HOW IT WORKS — centered 2×2 grid
               ══════════════════════════════════ */}
            <section id="how-it-works" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center" style={{ marginBottom: '5rem' }}>
                        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)]" style={{ marginBottom: '1.5rem' }}>
                            Four steps. Zero jargon.
                        </h2>
                        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
                            You provide the judgment. We handle the structure.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                        {steps.map((step, i) => {
                            const s = accentStyles[step.accent];
                            return (
                                <div key={i} className="glass-card text-center group hover:scale-[1.02] transition-transform" style={{ padding: '2.5rem 2rem' }}>
                                    <div className={`w-16 h-16 mx-auto rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center ${s.text} group-hover:scale-110 transition-transform duration-300`} style={{ marginBottom: '1.5rem' }}>
                                        {step.icon}
                                    </div>
                                    <div className={`text-[0.625rem] font-bold tracking-[0.2em] uppercase ${s.text}`} style={{ marginBottom: '0.75rem' }}>
                                        Step {step.num}
                                    </div>
                                    <h3 className="text-lg font-semibold font-[var(--font-display)]" style={{ marginBottom: '0.75rem' }}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs mx-auto">
                                        {step.sub}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                FEATURES — 3 centered pillars
               ══════════════════════════════════ */}
            <section style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center" style={{ marginBottom: '5rem' }}>
                        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)]" style={{ marginBottom: '1.5rem' }}>
                            Why solopreneurs love it
                        </h2>
                        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-md mx-auto">
                            Built for vibe coders, founders, and creatives — not engineers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: <Shield className="w-7 h-7 text-[var(--color-accent-green)]" />, bg: 'bg-[var(--color-accent-green)]/10', title: 'No jargon. Ever.', sub: 'We translate engineering concepts into plain language. You'll never be asked about "constraint architectures."' },
                            { icon: <Zap className="w-7 h-7 text-[var(--color-accent-yellow)]" />, bg: 'bg-[var(--color-accent-yellow)]/10', title: 'Show, don\'t ask.', sub: 'We show you completed examples from businesses like yours — you edit them instead of building from scratch.' },
                            { icon: <Rocket className="w-7 h-7 text-[var(--color-accent-cyan)]" />, bg: 'bg-[var(--color-accent-cyan)]/10', title: 'One-click launch.', sub: 'Export as Markdown, claude.md, or JSON — or launch directly to Gemini, Claude, or ChatGPT.' },
                        ].map((f, i) => (
                            <div key={i} className="glass-card text-center hover:scale-[1.02] transition-transform" style={{ padding: '2.5rem 2rem' }}>
                                <div className={`w-14 h-14 mx-auto rounded-2xl ${f.bg} flex items-center justify-center`} style={{ marginBottom: '1.5rem' }}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold font-[var(--font-display)]" style={{ marginBottom: '0.75rem' }}>
                                    {f.title}
                                </h3>
                                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs mx-auto">
                                    {f.sub}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                CTA
               ══════════════════════════════════ */}
            <section style={{ paddingTop: '6rem', paddingBottom: '8rem' }}>
                <div className="max-w-2xl mx-auto px-6">
                    <div className="glass-card text-center relative overflow-hidden" style={{ padding: '4rem 2rem' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] gradient-text" style={{ marginBottom: '1.5rem' }}>
                                Stop prompting. Start specifying.
                            </h2>
                            <p className="text-base text-[var(--color-text-muted)] max-w-sm mx-auto" style={{ marginBottom: '2.5rem' }}>
                                Join solopreneurs getting 10x more from their AI — without learning engineering.
                            </p>
                            <button onClick={handleCTA} className="btn-primary text-base px-10 py-4 animate-pulse-glow">
                                <span className="flex items-center gap-2">Build Your First Spec <ArrowRight className="w-5 h-5" /></span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-[var(--color-border-subtle)]" style={{ padding: '2.5rem 1.5rem' }}>
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <Layers className="w-4 h-4" />
                        <span>PRD Wizard © 2026</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">Built for the AI-first solopreneur</p>
                </div>
            </footer>
        </div>
    );
}
