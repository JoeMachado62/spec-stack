import { useState } from 'react';
import { useSpecStore, useAuthStore } from '../../store';
import { Sparkles, Send } from 'lucide-react';

export default function Stage1PromptCraft({ specId }) {
    const { processStage1, stageLoading } = useSpecStore();
    const { user } = useAuthStore();
    const [rawInput, setRawInput] = useState('');
    const [businessType, setBusinessType] = useState(user?.business_type || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rawInput.trim()) return;
        await processStage1(specId, rawInput, businessType);
    };

    return (
        <div className="glass-card p-8">
            {/* Stage header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold font-[var(--font-display)]">Tell me your idea</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Describe what you want the AI to do — in your own words, any format
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Business type */}
                <div>
                    <label className="input-label">What kind of business do you run?</label>
                    <select
                        id="stage1-business-type"
                        className="input-field"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                    >
                        <option value="">Select your business type</option>
                        {['Freelance Designer', 'Solo SaaS Founder', 'Real Estate Agent', 'Business Coach',
                            'E-commerce Store', 'Content Agency', 'Bookkeeper', 'Photographer',
                            'Consultant', 'Marketing Freelancer', 'Virtual Assistant', 'Dog Groomer',
                            'Online Course Creator', 'Social Media Manager', 'Copywriter',
                            'Web Developer', 'Personal Trainer', 'Event Planner', 'Recruiter', 'Accountant',
                            'Other'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                    </select>
                </div>

                {/* Raw idea input */}
                <div>
                    <label className="input-label">What do you need the AI to do?</label>
                    <textarea
                        id="stage1-raw-input"
                        className="input-field textarea"
                        placeholder="Just describe it naturally — like you're explaining it to a smart colleague.

Examples:
• &quot;I need a system that handles my client booking emails automatically&quot;
• &quot;Create a weekly report that pulls my sales data and highlights trends&quot;
• &quot;Set up an onboarding flow for new coaching clients&quot;"
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                        rows={6}
                        required
                    />
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Don't worry about being perfect — we'll refine it together.
                    </p>
                </div>

                {/* Tips */}
                <div className="bg-[var(--color-bg-glass)] rounded-lg p-4 border border-[var(--color-border-subtle)]">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">💡 Tips for a great start:</p>
                    <ul className="text-xs text-[var(--color-text-muted)] space-y-1">
                        <li>• Describe the <strong>end result</strong> you want, not the technical steps</li>
                        <li>• Include who it's for (your clients, your team, yourself)</li>
                        <li>• Mention what you're using now, even if it's spreadsheets or sticky notes</li>
                    </ul>
                </div>

                {/* Submit */}
                <button
                    id="stage1-submit"
                    type="submit"
                    disabled={stageLoading || !rawInput.trim()}
                    className="btn-primary w-full"
                >
                    <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Turn This Into Clear Instructions
                    </span>
                </button>
            </form>
        </div>
    );
}
