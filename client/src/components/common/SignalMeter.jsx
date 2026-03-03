import { Signal, SignalHigh, SignalLow, SignalZero } from 'lucide-react';

/**
 * Signal-to-Noise Meter — Token Budget Visualization (PRD Section 6.2)
 * 
 * IMPORTANT: The word "token" NEVER appears in this component.
 * Users see signal quality, not technical token counts.
 * 
 * Green  = Clean signal — AI has what it needs, nothing extra
 * Yellow = Getting noisy — Consider removing less relevant info
 * Red    = Too much noise — AI performance will degrade
 */
export default function SignalMeter({ level = 'green', currentItems = 0, maxItems = 10 }) {
    const ratio = Math.min(currentItems / maxItems, 1);

    const getLevel = () => {
        if (level === 'red' || ratio > 0.9) return 'red';
        if (level === 'yellow' || ratio > 0.7) return 'yellow';
        return 'green';
    };

    const computedLevel = getLevel();

    const config = {
        green: {
            label: 'Clean signal',
            description: 'Your AI has focused, relevant context. This is the sweet spot.',
            icon: <SignalHigh className="w-4 h-4" />,
            bg: 'bg-[var(--color-accent-green)]/10',
            border: 'border-[var(--color-accent-green)]/20',
            text: 'text-[var(--color-accent-green)]',
            barColor: 'bg-[var(--color-accent-green)]',
        },
        yellow: {
            label: 'Getting noisy',
            description: 'The AI has a lot to work with. Consider removing less relevant info.',
            icon: <SignalLow className="w-4 h-4" />,
            bg: 'bg-[var(--color-accent-yellow)]/10',
            border: 'border-[var(--color-accent-yellow)]/20',
            text: 'text-[var(--color-accent-yellow)]',
            barColor: 'bg-[var(--color-accent-yellow)]',
        },
        red: {
            label: 'Too much noise',
            description: 'The AI may struggle with this much context. Remove anything not essential.',
            icon: <SignalZero className="w-4 h-4" />,
            bg: 'bg-[var(--color-accent-red)]/10',
            border: 'border-[var(--color-accent-red)]/20',
            text: 'text-[var(--color-accent-red)]',
            barColor: 'bg-[var(--color-accent-red)]',
        },
    };

    const c = config[computedLevel];

    return (
        <div className={`rounded-lg p-4 ${c.bg} border ${c.border}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className={c.text}>{c.icon}</span>
                <span className={`text-xs font-semibold ${c.text}`}>{c.label}</span>
            </div>

            {/* Signal bar */}
            <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full mb-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${c.barColor}`}
                    style={{ width: `${ratio * 100}%` }}
                />
            </div>

            <p className="text-[0.6875rem] text-[var(--color-text-muted)]">{c.description}</p>
        </div>
    );
}
