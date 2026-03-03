import { useState } from 'react';
import { useSpecStore } from '../../store';
import { BookOpen, Send, Upload } from 'lucide-react';
import SignalMeter from '../common/SignalMeter';

export default function Stage2ContextEng({ specId }) {
    const { specification, processStage2, stageLoading } = useSpecStore();
    const [additionalContext, setAdditionalContext] = useState('');
    const stage1 = specification?.stage_1_prompt;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await processStage2(specId, additionalContext, {});
    };

    return (
        <div className="space-y-6">
            {/* Stage 1 summary */}
            {stage1?.instruction_block && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-[var(--color-accent-green)]">✓ Stage 1 Complete</span>
                    </div>
                    <h3 className="text-sm font-semibold mb-2">Your structured instructions</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {stage1.instruction_block}
                    </p>
                    {stage1.guard_rails?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {stage1.guard_rails.map((gr, i) => (
                                <span key={i} className="badge badge-must-not text-[0.625rem]">🛡️ {gr}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Context Engineering */}
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[var(--color-accent-blue)]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold font-[var(--font-display)]">What does the AI need to know?</h2>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Give the AI the background info it needs to do great work
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Context categories */}
                    <div className="space-y-4">
                        <div className="bg-[var(--color-bg-glass)] rounded-lg p-4 border border-[var(--color-border-subtle)]">
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                                Think about these categories:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="text-xs text-[var(--color-text-muted)]">
                                    <span className="font-medium text-[var(--color-text-secondary)]">About your business:</span>
                                    <br />Conventions, brand voice, standards
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)]">
                                    <span className="font-medium text-[var(--color-text-secondary)]">About this project:</span>
                                    <br />Relevant files, prior work, examples
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)]">
                                    <span className="font-medium text-[var(--color-text-secondary)]">Tools involved:</span>
                                    <br />Apps, platforms, systems the AI should use
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)]">
                                    <span className="font-medium text-[var(--color-text-secondary)]">Off limits:</span>
                                    <br />What the AI should NOT access or change
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">
                                Tell the AI what it needs to know about your business and this project
                            </label>
                            <textarea
                                id="stage2-context"
                                className="input-field textarea"
                                placeholder="Describe anything the AI should know to do this task well...

For example:
• Your brand voice or communication style
• Tools or platforms you use (Shopify, Notion, etc.)
• Special rules or conventions in your business
• What the AI should definitely NOT touch"
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                rows={8}
                            />
                        </div>

                        {/* Document upload placeholder */}
                        <div className="border-2 border-dashed border-[var(--color-border-subtle)] rounded-lg p-6 text-center hover:border-[var(--color-brand-primary)]/30 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Upload documents</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                Drag files here or click to browse (PDF, DOCX, TXT, MD)
                            </p>
                            <p className="text-xs text-[var(--color-brand-primary)] mt-2">Coming soon — Notion & Google Drive integration</p>
                        </div>

                        {/* Signal-to-Noise Meter — PRD Section 6.2 */}
                        <SignalMeter
                            level={additionalContext.length > 5000 ? 'red' : additionalContext.length > 2000 ? 'yellow' : 'green'}
                            currentItems={Math.min(Math.ceil(additionalContext.length / 500), 10)}
                            maxItems={10}
                        />
                    </div>

                    <button
                        id="stage2-submit"
                        type="submit"
                        disabled={stageLoading}
                        className="btn-primary w-full"
                    >
                        <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Build the AI's Knowledge Base
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
