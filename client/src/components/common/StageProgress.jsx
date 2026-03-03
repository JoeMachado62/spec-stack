export default function StageProgress({ currentStage = 1, completenessScore = 0 }) {
    const stages = [
        { num: 1, label: 'Clear Instructions', icon: '✏️' },
        { num: 2, label: 'What the AI Needs to Know', icon: '📋' },
        { num: 3, label: 'What the AI Should Care About', icon: '🎯' },
        { num: 4, label: 'The Master Plan', icon: '🚀' },
    ];

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Your Progress</h3>
                <div className="stage-indicator">
                    {stages.map((s) => (
                        <div
                            key={s.num}
                            className={`stage-dot ${s.num < currentStage ? 'completed' : s.num === currentStage ? 'active' : ''
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {stages.map((s) => (
                    <div
                        key={s.num}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${s.num === currentStage
                                ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                                : s.num < currentStage
                                    ? 'text-[var(--color-accent-green)]'
                                    : 'text-[var(--color-text-muted)]'
                            }`}
                    >
                        <span className="text-base">{s.icon}</span>
                        <span className={`flex-1 ${s.num === currentStage ? 'font-medium' : ''}`}>
                            {s.label}
                        </span>
                        {s.num < currentStage && (
                            <span className="text-xs font-medium text-[var(--color-accent-green)]">✓ Done</span>
                        )}
                        {s.num === currentStage && (
                            <span className="text-xs font-medium text-[var(--color-brand-primary)] animate-pulse">Active</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
