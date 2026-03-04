import { useState, useRef } from 'react';
import { useSpecStore } from '../../store';
import { BookOpen, Send, Upload, FileText, X, Check, Pencil, Globe, Link, Loader2 } from 'lucide-react';
import SignalMeter from '../common/SignalMeter';

export default function Stage2ContextEng({ specId }) {
    const { specification, processStage2, updateStageData, uploadDocuments, scrapeUrl, stageLoading } = useSpecStore();
    const [additionalContext, setAdditionalContext] = useState('');
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [scraping, setScraping] = useState(false);
    const [scrapeError, setScrapeError] = useState('');
    const fileInputRef = useRef(null);
    const stage1 = specification?.stage_1_prompt;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await processStage2(specId, additionalContext, {});
    };

    // --- Editable Stage 1 results ---
    const startEdit = (field, value) => {
        setEditingField(field);
        setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || ''));
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = async (field) => {
        try {
            let parsedValue = editValue;
            // Try parsing as JSON for arrays/objects (like guard_rails)
            if (editValue.trim().startsWith('[') || editValue.trim().startsWith('{')) {
                try { parsedValue = JSON.parse(editValue); } catch { /* keep as string */ }
            }
            await updateStageData(specId, 1, { [field]: parsedValue });
            setEditingField(null);
            setEditValue('');
        } catch {
            // error is handled by store
        }
    };

    // --- Document upload ---
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const result = await uploadDocuments(specId, files);
            setUploadedDocs(prev => [...prev, ...result.documents]);
        } catch {
            // error handled by store
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeDoc = (docId) => {
        setUploadedDocs(prev => prev.filter(d => d.document_id !== docId));
    };

    // --- URL scraping ---
    const handleScrapeUrl = async () => {
        const url = urlInput.trim();
        if (!url) return;
        setScraping(true);
        setScrapeError('');
        try {
            const result = await scrapeUrl(specId, url);
            setUploadedDocs(prev => [...prev, {
                document_id: result.document.document_id,
                filename: result.document.filename,
                size: result.document.chars,
                content_preview: result.document.content_preview,
                source_url: result.document.source_url,
                is_url: true,
            }]);
            setUrlInput('');
        } catch (err) {
            setScrapeError(err.response?.data?.error || 'Failed to fetch URL');
        }
        setScraping(false);
    };

    const handleUrlKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleScrapeUrl();
        }
    };

    // Editable field renderer
    const EditableField = ({ label, field, value, multiline = false }) => {
        const isEditing = editingField === field;
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value || '—');

        return (
            <div className="group relative">
                <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</span>
                    {!isEditing && (
                        <button
                            onClick={() => startEdit(field, value)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                            title="Edit this field"
                        >
                            <Pencil className="w-3 h-3 text-[var(--color-text-muted)]" />
                        </button>
                    )}
                </div>
                {isEditing ? (
                    <div className="mt-1 space-y-2">
                        {multiline ? (
                            <textarea
                                className="input-field textarea text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={4}
                                autoFocus
                            />
                        ) : (
                            <input
                                className="input-field text-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                            />
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => saveEdit(field)}
                                disabled={stageLoading}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)] text-xs font-medium hover:bg-[var(--color-accent-green)]/30 transition-colors"
                            >
                                <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 text-[var(--color-text-muted)] text-xs hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-1 cursor-pointer hover:text-[var(--color-text-primary)] transition-colors"
                        onClick={() => startEdit(field, value)}
                    >
                        {displayValue}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Stage 1 summary — EDITABLE */}
            {stage1 && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[var(--color-accent-green)]">✓ Stage 1 Complete</span>
                        </div>
                        <span className="text-[0.625rem] text-[var(--color-text-muted)] bg-white/5 px-2 py-0.5 rounded-full">
                            Click any field to edit
                        </span>
                    </div>

                    <div className="space-y-4">
                        {stage1.instruction_block && (
                            <EditableField
                                label="Structured Instructions"
                                field="instruction_block"
                                value={stage1.instruction_block}
                                multiline
                            />
                        )}

                        {stage1.task_type && (
                            <EditableField label="Task Type" field="task_type" value={stage1.task_type} />
                        )}

                        {stage1.complexity && (
                            <EditableField label="Complexity" field="complexity" value={stage1.complexity} />
                        )}

                        {stage1.guard_rails?.length > 0 && (
                            <div className="group relative">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Guard Rails</span>
                                    <button
                                        onClick={() => startEdit('guard_rails', stage1.guard_rails)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                                        title="Edit guard rails"
                                    >
                                        <Pencil className="w-3 h-3 text-[var(--color-text-muted)]" />
                                    </button>
                                </div>
                                {editingField === 'guard_rails' ? (
                                    <div className="mt-1 space-y-2">
                                        <textarea
                                            className="input-field textarea text-sm"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            rows={4}
                                            autoFocus
                                            placeholder='["rule 1", "rule 2"]'
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => saveEdit('guard_rails')} disabled={stageLoading}
                                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)] text-xs font-medium hover:bg-[var(--color-accent-green)]/30">
                                                <Check className="w-3 h-3" /> Save
                                            </button>
                                            <button onClick={cancelEdit}
                                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 text-[var(--color-text-muted)] text-xs hover:bg-white/10">
                                                <X className="w-3 h-3" /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {stage1.guard_rails.map((gr, i) => (
                                            <span key={i} className="badge badge-must-not text-[0.625rem]">🛡️ {gr}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                                placeholder={`Describe anything the AI should know to do this task well...\n\nFor example:\n• Your brand voice or communication style\n• Tools or platforms you use (Shopify, Notion, etc.)\n• Special rules or conventions in your business\n• What the AI should definitely NOT touch`}
                                value={additionalContext}
                                onChange={(e) => setAdditionalContext(e.target.value)}
                                rows={8}
                            />
                        </div>

                        {/* URL scraping */}
                        <div>
                            <label className="input-label flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5" />
                                Add from URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="stage2-url-input"
                                    type="url"
                                    className="input-field flex-1"
                                    placeholder="Paste a web page or Google Docs link..."
                                    value={urlInput}
                                    onChange={(e) => { setUrlInput(e.target.value); setScrapeError(''); }}
                                    onKeyDown={handleUrlKeyDown}
                                    disabled={scraping}
                                />
                                <button
                                    type="button"
                                    onClick={handleScrapeUrl}
                                    disabled={scraping || !urlInput.trim()}
                                    className="btn-primary px-4 py-2 shrink-0 flex items-center gap-1.5"
                                >
                                    {scraping ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
                                    ) : (
                                        <><Link className="w-4 h-4" /> Fetch</>
                                    )}
                                </button>
                            </div>
                            {scrapeError && (
                                <p className="text-xs text-red-400 mt-1.5">{scrapeError}</p>
                            )}
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                Works with any public page, Google Docs, and Google Sheets shared links
                            </p>
                        </div>

                        {/* Document upload — WORKING */}
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.docx,.doc,.txt,.md,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="doc-upload-input"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-[var(--color-border-subtle)] rounded-lg p-6 text-center hover:border-[var(--color-brand-primary)]/50 transition-all cursor-pointer hover:bg-white/[0.02]"
                            >
                                <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'animate-bounce text-[var(--color-brand-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                                <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                                    {uploading ? 'Uploading...' : 'Upload documents'}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                    Click to browse — PDF, DOCX, TXT, MD, CSV (max 10MB each)
                                </p>
                            </div>

                            {/* Uploaded files & scraped URLs list */}
                            {uploadedDocs.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-[var(--color-text-muted)]">
                                        {uploadedDocs.length} source{uploadedDocs.length > 1 ? 's' : ''} added to knowledge base
                                    </p>
                                    {uploadedDocs.map(doc => (
                                        <div key={doc.document_id} className="flex items-center justify-between bg-[var(--color-bg-glass)] rounded-lg px-4 py-2.5 border border-[var(--color-border-subtle)]">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {doc.is_url ? (
                                                    <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-[var(--color-accent-blue)] shrink-0" />
                                                )}
                                                <span className="text-sm text-[var(--color-text-secondary)] truncate">{doc.filename}</span>
                                                <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                                                    {doc.is_url ? `${(doc.size / 1000).toFixed(1)}k chars` : `${(doc.size / 1024).toFixed(1)}KB`}
                                                </span>
                                            </div>
                                            <button onClick={() => removeDoc(doc.document_id)} className="p-1 hover:bg-white/10 rounded shrink-0 ml-2">
                                                <X className="w-3 h-3 text-[var(--color-text-muted)]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
