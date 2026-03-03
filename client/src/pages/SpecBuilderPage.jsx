import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpecStore, useProjectStore, useAuthStore } from '../store';
import StageProgress from '../components/common/StageProgress';
import ScoreRing from '../components/common/ScoreRing';
import LoadingOverlay from '../components/common/LoadingOverlay';
import RunSpecModal from '../components/common/RunSpecModal';
import Stage1PromptCraft from '../components/stages/Stage1PromptCraft';
import Stage2ContextEng from '../components/stages/Stage2ContextEng';
import Stage3IntentEng from '../components/stages/Stage3IntentEng';
import Stage4SpecEng from '../components/stages/Stage4SpecEng';
import { ArrowLeft, FileText, FileJson, File, Rocket } from 'lucide-react';
import { specsAPI } from '../services/api';

export default function SpecBuilderPage() {
    const { projectId, specId } = useParams();
    const navigate = useNavigate();
    const { specification, completenessScore, gaps, fetchSpecification, stageLoading, loading } = useSpecStore();
    const { currentProject, fetchProject } = useProjectStore();
    const { user } = useAuthStore();
    const [exporting, setExporting] = useState(false);
    const [showRunModal, setShowRunModal] = useState(false);

    useEffect(() => {
        if (specId) fetchSpecification(specId);
        if (projectId) fetchProject(projectId);
    }, [specId, projectId]);

    const handleExport = async (format) => {
        try {
            setExporting(true);
            const response = await specsAPI.export(specId, format);
            const blob = new Blob([response.data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = format === 'json' ? 'spec.json' : format === 'claude-md' ? 'claude.md' : 'spec.md';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    if (loading || !specification) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <div className="glass-card p-6">
                    <div className="shimmer h-6 w-1/3 mb-4" />
                    <div className="shimmer h-4 w-2/3 mb-3" />
                    <div className="shimmer h-4 w-1/2 mb-3" />
                    <div className="shimmer h-32 w-full" />
                </div>
            </div>
        );
    }

    const currentStage = specification.current_stage || 1;

    // Progressive vocabulary (PRD Section 10.2)
    const sessionCount = user?.session_count || 0;
    const showTechnicalHints = sessionCount >= 4;

    const stageMessages = {
        1: 'Turning your idea into clear instructions...',
        2: 'Building the information your AI needs...',
        3: 'Figuring out what your AI should prioritize...',
        4: 'Assembling your complete specification...'
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {stageLoading && <LoadingOverlay message={stageMessages[currentStage]} />}

            {/* Run This Spec Modal */}
            <RunSpecModal
                specId={specId}
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-ghost"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold font-[var(--font-display)]">
                            {currentProject?.title || 'Spec Builder'}
                        </h1>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            {currentProject?.description || 'Build your AI specification step by step'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ScoreRing score={completenessScore} size={56} strokeWidth={4} />

                    {/* Export buttons */}
                    {currentStage >= 4 && completenessScore > 30 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleExport('markdown')}
                                className="btn-ghost text-xs"
                                title="Export as Markdown"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleExport('claude-md')}
                                className="btn-ghost text-xs"
                                title="Export as claude.md"
                            >
                                <File className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleExport('json')}
                                className="btn-ghost text-xs"
                                title="Export as JSON"
                            >
                                <FileJson className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* 🚀 Run This Spec — PRD Section 14.3 */}
                    {currentStage >= 4 && specification.stage_4_spec && (
                        <button
                            id="run-this-spec-btn"
                            onClick={() => setShowRunModal(true)}
                            className="btn-primary animate-pulse-glow"
                        >
                            <span className="flex items-center gap-2">
                                <Rocket className="w-4 h-4" />
                                Run This Spec
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Layout: Main content + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                {/* Main stage content */}
                <div className="animate-fade-in">
                    {currentStage === 1 && <Stage1PromptCraft specId={specId} />}
                    {currentStage === 2 && <Stage2ContextEng specId={specId} />}
                    {currentStage === 3 && <Stage3IntentEng specId={specId} />}
                    {currentStage >= 4 && <Stage4SpecEng specId={specId} onRunSpec={() => setShowRunModal(true)} />}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <StageProgress
                        currentStage={currentStage}
                        completenessScore={completenessScore}
                        showTechnicalHints={showTechnicalHints}
                    />

                    {/* Gap Summary */}
                    {gaps && gaps.length > 0 && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
                                Still needed
                            </h3>
                            <div className="space-y-2">
                                {gaps.map((gap, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                                        <span className="text-[var(--color-accent-yellow)] mt-0.5">⚡</span>
                                        <span>{gap}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
