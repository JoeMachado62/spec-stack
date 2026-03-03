import { useState } from 'react';
import { useSpecStore } from '../../store';
import { Target, Send, AlertTriangle } from 'lucide-react';

export default function Stage3IntentEng({ specId }) {
    const { specification, processStage3, stageLoading } = useSpecStore();
    const [tradeoffs, setTradeoffs] = useState({});
    const [worstCase, setWorstCase] = useState('');

    // Default trade-off cards
    const tradeoffCards = [
        {
            id: 'speed_vs_quality',
            question: "When the AI is working on this, what matters more?",
            optionA: "Get it done fast, even if it's not perfect",
            optionB: "Take extra time to get it right"
        },
        {
            id: 'autonomy_vs_safety',
            question: "If the AI isn't sure about something, should it...",
            optionA: "Make its best guess and keep going",
            optionB: "Stop and ask you before continuing"
        },
        {
            id: 'volume_vs_personal',
            question: "For this type of work, what's more important?",
            optionA: "Handle more items, even if some are generic",
            optionB: "Give each item personal attention, even if fewer get done"
        }
    ];

    const handleTradeoff = (id, value) => {
        setTradeoffs(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await processStage3(specId, tradeoffs, worstCase);
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-[var(--color-accent-yellow)]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold font-[var(--font-display)]">What should the AI care about?</h2>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Help the AI understand your priorities and where to draw the line
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Trade-off Cards */}
                    <div>
                        <label className="input-label mb-3">Make these trade-off choices:</label>
                        <div className="space-y-4">
                            {tradeoffCards.map((card) => (
                                <div key={card.id} className="bg-[var(--color-bg-glass)] rounded-lg p-5 border border-[var(--color-border-subtle)]">
                                    <p className="text-sm font-medium mb-3">{card.question}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleTradeoff(card.id, 'A')}
                                            className={`p-3 rounded-lg text-xs text-left transition-all border ${tradeoffs[card.id] === 'A'
                                                    ? 'bg-[var(--color-brand-primary)]/10 border-[var(--color-brand-primary)]/50 text-[var(--color-brand-primary)]'
                                                    : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]'
                                                }`}
                                        >
                                            {card.optionA}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTradeoff(card.id, 'B')}
                                            className={`p-3 rounded-lg text-xs text-left transition-all border ${tradeoffs[card.id] === 'B'
                                                    ? 'bg-[var(--color-brand-primary)]/10 border-[var(--color-brand-primary)]/50 text-[var(--color-brand-primary)]'
                                                    : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]'
                                                }`}
                                        >
                                            {card.optionB}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Worst Case Prompt — The most powerful extraction question */}
                    <div className="bg-[var(--color-accent-yellow)]/5 rounded-lg p-5 border border-[var(--color-accent-yellow)]/20">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-[var(--color-accent-yellow)]" />
                            <label className="text-sm font-semibold text-[var(--color-accent-yellow)]">
                                The most important question:
                            </label>
                        </div>
                        <p className="text-sm mb-3 text-[var(--color-text-secondary)]">
                            Tell me how this could go wrong even if it technically looks finished.
                        </p>
                        <textarea
                            id="stage3-worst-case"
                            className="input-field textarea"
                            placeholder="Think about what would make you look at the finished work and say 'this isn't right' — even if all the checkboxes are ticked...

Example: 'The AI might send the right email, but with a tone that doesn't match our brand — too formal, too generic, something our clients would notice isn't really us.'"
                            value={worstCase}
                            onChange={(e) => setWorstCase(e.target.value)}
                            rows={5}
                        />
                    </div>

                    {/* Rejection criteria */}
                    <div>
                        <label className="input-label">
                            What would make you reject the final output? (select all that apply)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {[
                                'Factually incorrect information',
                                'Wrong tone or voice',
                                'Missing important steps',
                                'Too generic / not personalized',
                                'Takes too long to produce',
                                'Doesn\'t follow my format',
                                'Shares sensitive information',
                                'Makes decisions I should make'
                            ].map((item) => (
                                <label
                                    key={item}
                                    className="flex items-center gap-2 p-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass)] cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded accent-[var(--color-brand-primary)]"
                                        onChange={(e) => {
                                            handleTradeoff(`rejection_${item}`, e.target.checked ? 'reject' : null);
                                        }}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        id="stage3-submit"
                        type="submit"
                        disabled={stageLoading}
                        className="btn-primary w-full"
                    >
                        <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Lock In the AI's Priorities
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
