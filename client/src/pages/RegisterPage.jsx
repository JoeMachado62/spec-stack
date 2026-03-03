import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Layers, ArrowRight, Eye, EyeOff } from 'lucide-react';

const BUSINESS_TYPES = [
    'Freelance Designer', 'Solo SaaS Founder', 'Real Estate Agent', 'Business Coach',
    'E-commerce Store', 'Content Agency', 'Bookkeeper', 'Photographer',
    'Consultant', 'Marketing Freelancer', 'Virtual Assistant', 'Dog Groomer',
    'Online Course Creator', 'Social Media Manager', 'Copywriter',
    'Web Developer', 'Personal Trainer', 'Event Planner', 'Recruiter', 'Accountant',
    'Other'
];

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password, name, businessType);
            navigate('/dashboard');
        } catch { }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="ambient-bg" />

            <div className="w-full max-w-[420px] animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-float">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-[var(--font-display)] gradient-text mb-2">Spec Stack</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Get your AI working 10x harder for you</p>
                </div>

                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold mb-6">Create your account</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/20 text-[var(--color-accent-red)] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">Your name</label>
                            <input
                                id="register-name"
                                type="text"
                                className="input-field"
                                placeholder="Jane Smith"
                                value={name}
                                onChange={(e) => { setName(e.target.value); clearError(); }}
                                required
                            />
                        </div>

                        <div>
                            <label className="input-label">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                                required
                            />
                        </div>

                        <div>
                            <label className="input-label">Password</label>
                            <div className="relative">
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">What kind of business do you run?</label>
                            <select
                                id="register-business-type"
                                className="input-field"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                            >
                                <option value="">Select your business type</option>
                                {BUSINESS_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            <span className="flex items-center gap-2">
                                {loading ? 'Creating account...' : 'Get Started'}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </span>
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[var(--color-brand-primary)] hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
