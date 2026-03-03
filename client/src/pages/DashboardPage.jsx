import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store';
import ScoreRing from '../components/common/ScoreRing';
import { Plus, FolderOpen, ArrowRight, Trash2, Clock, Sparkles } from 'lucide-react';

export default function DashboardPage() {
    const { projects, fetchProjects, createProject, deleteProject, loading } = useProjectStore();
    const navigate = useNavigate();
    const [showNewProject, setShowNewProject] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const data = await createProject({ title: newTitle, description: newDescription });
            const specId = data.specification?.spec_id;
            navigate(`/project/${data.project.project_id}/spec/${specId}`);
        } catch { }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this project? This cannot be undone.')) {
            await deleteProject(id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-[var(--color-accent-green)]';
            case 'archived': return 'text-[var(--color-text-muted)]';
            default: return 'text-[var(--color-accent-yellow)]';
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-[var(--font-display)]">My Projects</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">
                        Create AI-ready specifications from your ideas
                    </p>
                </div>
                <button
                    id="new-project-btn"
                    onClick={() => setShowNewProject(!showNewProject)}
                    className="btn-primary"
                >
                    <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Spec
                    </span>
                </button>
            </div>

            {/* New Project Form */}
            {showNewProject && (
                <div className="glass-card p-6 mb-8 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--color-brand-primary)]" />
                        What do you want to build?
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="input-label">Give your project a name</label>
                            <input
                                id="new-project-title"
                                type="text"
                                className="input-field"
                                placeholder="e.g., Client onboarding automation"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Describe it briefly (optional)</label>
                            <textarea
                                id="new-project-description"
                                className="input-field textarea"
                                placeholder="What's the goal? What problem does it solve?"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button id="create-project-submit" type="submit" className="btn-primary" disabled={loading}>
                                <span>Create & Start Building</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewProject(false)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects Grid */}
            {loading && projects.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card p-6">
                            <div className="shimmer h-5 w-3/4 mb-3" />
                            <div className="shimmer h-3 w-full mb-2" />
                            <div className="shimmer h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center">
                        <FolderOpen className="w-10 h-10 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-sm mx-auto">
                        Create your first project to start building AI-ready specifications from your ideas.
                    </p>
                    <button
                        onClick={() => setShowNewProject(true)}
                        className="btn-primary"
                    >
                        <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create Your First Spec
                        </span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => {
                        const latestSpec = project.specifications?.[0];
                        const score = latestSpec?.completeness_score || 0;

                        return (
                            <div
                                key={project.project_id}
                                onClick={() => {
                                    if (latestSpec) {
                                        navigate(`/project/${project.project_id}/spec/${latestSpec.spec_id}`);
                                    }
                                }}
                                className="glass-card p-6 cursor-pointer group animate-fade-in"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm group-hover:text-[var(--color-brand-primary)] transition-colors truncate">
                                            {project.title}
                                        </h3>
                                        <p className={`text-xs mt-0.5 capitalize ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </p>
                                    </div>
                                    <ScoreRing score={score} size={48} strokeWidth={4} />
                                </div>

                                {project.description && (
                                    <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            Stage {latestSpec?.current_stage || 1} of 4
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleDelete(e, project.project_id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
