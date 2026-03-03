import { useState, useEffect, useRef } from 'react';
import { executionAPI } from '../../services/api';
import { X, Rocket, Sparkles, CheckCircle, AlertTriangle, Loader2, Cpu, Zap, Shield } from 'lucide-react';

/**
 * RunSpecModal — One-Click "Run This Spec" (PRD Section 14.3)
 * 
 * User clicks → selects AI → spec is injected → agent response appears.
 * The user never sees a terminal, CLI, or raw API payload.
 */
export default function RunSpecModal({ specId, isOpen, onClose }) {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('auto');
    const [phase, setPhase] = useState('select'); // select | running | complete | error
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const resultRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            loadModels();
            setPhase('select');
            setResult(null);
            setError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (resultRef.current) {
            resultRef.current.scrollTop = resultRef.current.scrollHeight;
        }
    }, [result]);

    const loadModels = async () => {
        try {
            const { data } = await executionAPI.listModels();
            setModels(data.models);
            setSelectedModel(data.default_model || 'auto');
        } catch {
            setModels([]);
        }
    };

    const handleRun = async () => {
        setPhase('running');
        setError(null);
        try {
            const { data } = await executionAPI.runSpec(specId, { platform: selectedModel });
            setResult(data);
            setPhase('complete');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
            setPhase('error');
        }
    };

    if (!isOpen) return null;

    const modelIcons = {
        gemini: <Sparkles className="w-5 h-5" />,
        openai: <Zap className="w-5 h-5" />,
        anthropic: <Shield className="w-5 h-5" />,
    };

    const modelColors = {
        gemini: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
        openai: 'from-green-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30',
        anthropic: 'from-orange-500/20 to-amber-500/20 text-amber-400 border-amber-500/30',
    };

    return (
        <div className="fixed inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-[var(--color-accent-green)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold font-[var(--font-display)]">Run This Spec</h2>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {phase === 'select' ? 'Choose which AI should execute your specification' :
                                    phase === 'running' ? 'Your AI is working...' :
                                        phase === 'complete' ? 'Execution complete' : 'Something went wrong'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-ghost">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Model Selection — Phase: select */}
                    {phase === 'select' && (
                        <div className="space-y-4">
                            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                Which AI should run this? Your specification will be injected directly — no copy-paste, no terminal.
                            </p>

                            <div className="space-y-3">
                                {models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedModel === model.id
                                                ? `bg-gradient-to-r ${modelColors[model.id] || ''} border-opacity-50`
                                                : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${modelColors[model.id]?.split(' ').slice(0, 2).join(' ') || 'from-purple-500/20 to-pink-500/20'} flex items-center justify-center`}>
                                            {modelIcons[model.id] || <Cpu className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{model.name}</span>
                                                {model.isDefault && (
                                                    <span className="text-[0.625rem] px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)] font-medium">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{model.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedModel === model.id
                                                ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]'
                                                : 'border-[var(--color-text-muted)]'
                                            }`}>
                                            {selectedModel === model.id && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </button>
                                ))}

                                {models.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-[var(--color-text-muted)]">No AI models configured. Check your API keys.</p>
                                    </div>
                                )}
                            </div>

                            {/* Auto mode explanation */}
                            <div className="bg-[var(--color-bg-glass)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    💡 <strong>Smart fallback:</strong> If the selected model is unavailable, we automatically try the next one.
                                    Priority: Gemini → ChatGPT → Claude.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Running — Phase: running */}
                    {phase === 'running' && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center animate-pulse-glow">
                                <Loader2 className="w-10 h-10 text-[var(--color-brand-primary)] animate-spin" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Your AI is reading the spec...</h3>
                            <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto">
                                We're injecting your full specification — context, priorities, constraints, and all — directly into the AI. It will confirm it understood everything and start working.
                            </p>
                            <div className="mt-6 flex gap-1 justify-center">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}

                    {/* Complete — Phase: complete */}
                    {phase === 'complete' && result && (
                        <div className="space-y-4">
                            {/* Success header */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-accent-green)]/10 border border-[var(--color-accent-green)]/20">
                                <CheckCircle className="w-5 h-5 text-[var(--color-accent-green)] shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-accent-green)]">
                                        {result.spec_confirmed ? 'Spec confirmed and execution started' : 'Execution complete'}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                        {result.model_used} • {(result.execution_time_ms / 1000).toFixed(1)}s
                                    </p>
                                </div>
                            </div>

                            {/* Agent response */}
                            <div className="glass-card p-5 max-h-[400px] overflow-auto" ref={resultRef}>
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                                    Agent Response
                                </h4>
                                <div className="prose prose-sm prose-invert max-w-none text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                                    {result.response}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error — Phase: error */}
                    {phase === 'error' && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-accent-red)]/10 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-[var(--color-accent-red)]" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Couldn't run the spec</h3>
                            <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto mb-4">
                                {error}
                            </p>
                            <button onClick={() => setPhase('select')} className="btn-secondary">
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--color-border-subtle)]">
                    {phase === 'select' && (
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={onClose} className="btn-ghost">Cancel</button>
                            <button
                                id="run-spec-execute"
                                onClick={handleRun}
                                disabled={models.length === 0}
                                className="btn-primary"
                            >
                                <span className="flex items-center gap-2">
                                    <Rocket className="w-4 h-4" />
                                    Run with {models.find(m => m.id === selectedModel)?.name || 'AI'}
                                </span>
                            </button>
                        </div>
                    )}

                    {phase === 'complete' && (
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-[var(--color-text-muted)]">
                                You can copy the response or run the spec again.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(result?.response || '');
                                    }}
                                    className="btn-secondary text-xs"
                                >
                                    Copy Response
                                </button>
                                <button onClick={() => setPhase('select')} className="btn-primary text-xs">
                                    <span>Run Again</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
