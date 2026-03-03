import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message = 'Working on it...' }) {
    return (
        <div className="fixed inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-8 text-center animate-fade-in max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center animate-pulse-glow">
                    <Loader2 className="w-8 h-8 text-[var(--color-brand-primary)] animate-spin" />
                </div>
                <p className="text-lg font-semibold mb-1">{message}</p>
                <p className="text-sm text-[var(--color-text-muted)]">This usually takes 10-30 seconds</p>
                <div className="mt-4 flex gap-1 justify-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
