import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSpecStore } from '../../store';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Rocket, CheckCircle, XCircle, AlertTriangle, FileText, Eye, Layers, Plus, Trash2, Save } from 'lucide-react';
import { specsAPI } from '../../services/api';

export default function Stage4SpecEng({ specId, onRunSpec }) {
    const { specification, processStage4, stageLoading, completenessScore } = useSpecStore();
    const [viewMode, setViewMode] = useState('visual'); // visual | spec | export
    const [generated, setGenerated] = useState(false);
    const [newNodeLabel, setNewNodeLabel] = useState('');
    const [showAddNode, setShowAddNode] = useState(false);
    const [flowchartDirty, setFlowchartDirty] = useState(false);

    const stage4 = specification?.stage_4_spec;
    const flowchart = specification?.visual_flowchart;

    // Generate spec if not yet done
    const handleGenerate = async () => {
        await processStage4(specId);
        setGenerated(true);
    };

    // React Flow setup
    const initialNodes = useMemo(() => {
        if (!flowchart?.nodes) return [];
        return flowchart.nodes.map((node, i) => ({
            id: node.id || `node-${i}`,
            position: { x: (i % 4) * 280 + 50, y: Math.floor(i / 4) * 150 + 50 },
            data: {
                label: (
                    <div className="text-center">
                        <div className="text-xs font-medium">{node.label}</div>
                        {node.constraint_type && (
                            <span className={`badge mt-1 ${node.constraint_type === 'must' ? 'badge-must' :
                                node.constraint_type === 'must_not' ? 'badge-must-not' :
                                    node.constraint_type === 'escalation' ? 'badge-escalation' : 'badge-preference'
                                }`}>
                                {node.constraint_type === 'must' ? '🟢 Required' :
                                    node.constraint_type === 'must_not' ? '🔴 Blocked' :
                                        node.constraint_type === 'escalation' ? '🟡 Asks You' : '🔵 Preferred'}
                            </span>
                        )}
                    </div>
                ),
                raw_label: node.label,
                constraint_type: node.constraint_type,
            },
            type: 'default',
            style: {
                background: node.type === 'decision'
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))'
                    : node.type === 'escalation'
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))'
                        : undefined,
                borderColor: node.type === 'decision' ? '#8b5cf6' : node.type === 'escalation' ? '#f59e0b' : undefined,
            }
        }));
    }, [flowchart]);

    const initialEdges = useMemo(() => {
        if (!flowchart?.edges) return [];
        return flowchart.edges.map((edge, i) => ({
            id: edge.id || `edge-${i}`,
            source: edge.source,
            target: edge.target,
            label: edge.label || '',
            animated: true,
            style: { stroke: '#5a6070' },
            labelStyle: { fontSize: 10, fill: '#9ba1b0' }
        }));
    }, [flowchart]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        if (initialNodes.length > 0) setNodes(initialNodes);
        if (initialEdges.length > 0) setEdges(initialEdges);
    }, [initialNodes, initialEdges]);

    // === Bidirectional Flowchart Editing (PRD Section 8.4-8.5) ===

    // Add a new node from plain language (PRD: "User types a plain-language action")
    const handleAddNode = () => {
        if (!newNodeLabel.trim()) return;
        const newId = `node-${Date.now()}`;
        const newNode = {
            id: newId,
            position: { x: 50 + nodes.length * 60, y: 50 + nodes.length * 80 },
            data: {
                label: (
                    <div className="text-center">
                        <div className="text-xs font-medium">{newNodeLabel}</div>
                        <span className="badge badge-must mt-1">🟢 Required</span>
                    </div>
                ),
                raw_label: newNodeLabel,
                constraint_type: 'must',
            },
            type: 'default',
        };
        setNodes((nds) => [...nds, newNode]);
        setNewNodeLabel('');
        setShowAddNode(false);
        setFlowchartDirty(true);
    };

    // Delete selected nodes
    const handleDeleteSelected = () => {
        const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
        if (selectedNodeIds.length === 0) return;
        setNodes((nds) => nds.filter(n => !selectedNodeIds.includes(n.id)));
        setEdges((eds) => eds.filter(e => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)));
        setFlowchartDirty(true);
    };

    // Connect two nodes by dragging an edge
    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#5a6070' } }, eds));
        setFlowchartDirty(true);
    }, []);

    // Save flowchart changes back to the spec (bidirectional sync)
    const handleSaveFlowchart = async () => {
        try {
            const updatedFlowchart = {
                nodes: nodes.map(n => ({
                    id: n.id,
                    label: n.data.raw_label || 'Step',
                    type: 'action',
                    constraint_type: n.data.constraint_type || 'must',
                })),
                edges: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label || '',
                })),
            };
            await specsAPI.updateFlowchart(specId, updatedFlowchart);
            setFlowchartDirty(false);
        } catch (err) {
            console.error('Failed to save flowchart:', err);
        }
    };

    // Not yet generated
    if (!stage4 || (!stage4.problem_statement && !generated)) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-[var(--color-accent-green)]" />
                </div>
                <h2 className="text-xl font-semibold font-[var(--font-display)] mb-2">Ready to build your specification</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                    I'll take everything we've built across the previous stages and assemble it into a complete,
                    AI-ready specification with a visual flowchart.
                </p>
                <button
                    id="stage4-generate"
                    onClick={handleGenerate}
                    disabled={stageLoading}
                    className="btn-primary"
                >
                    <span className="flex items-center gap-2">
                        <Rocket className="w-4 h-4" />
                        Generate My Specification
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* View mode tabs */}
            <div className="flex items-center gap-1 bg-[var(--color-bg-glass)] p-1 rounded-lg w-fit">
                <button
                    onClick={() => setViewMode('visual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${viewMode === 'visual' ? 'bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                        }`}
                >
                    <Layers className="w-3.5 h-3.5" /> Visual Flow
                </button>
                <button
                    onClick={() => setViewMode('spec')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${viewMode === 'spec' ? 'bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                        }`}
                >
                    <FileText className="w-3.5 h-3.5" /> Specification
                </button>
                <button
                    onClick={() => setViewMode('export')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${viewMode === 'export' ? 'bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                        }`}
                >
                    <Eye className="w-3.5 h-3.5" /> Summary
                </button>
            </div>

            {/* Visual Flowchart — with editing controls (PRD Section 8.4) */}
            {viewMode === 'visual' && (
                <div className="space-y-3">
                    {/* Editing toolbar */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddNode(!showAddNode)}
                            className="btn-secondary text-xs"
                        >
                            <span className="flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5" /> Add Step
                            </span>
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            className="btn-ghost text-xs text-[var(--color-accent-red)]"
                        >
                            <span className="flex items-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5" /> Remove Selected
                            </span>
                        </button>
                        {flowchartDirty && (
                            <button
                                onClick={handleSaveFlowchart}
                                className="btn-primary text-xs animate-pulse-glow"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Save className="w-3.5 h-3.5" /> Save Changes
                                </span>
                            </button>
                        )}
                        <p className="text-[0.625rem] text-[var(--color-text-muted)] ml-auto">
                            Drag between nodes to connect • Click to select • Drag to reorder
                        </p>
                    </div>

                    {/* Add node input */}
                    {showAddNode && (
                        <div className="glass-card p-4 flex items-center gap-3 animate-fade-in">
                            <input
                                type="text"
                                className="input-field flex-1"
                                placeholder="Describe the step in plain language (e.g., 'Check if the client is new')"
                                value={newNodeLabel}
                                onChange={(e) => setNewNodeLabel(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
                                autoFocus
                            />
                            <button onClick={handleAddNode} className="btn-primary text-xs" disabled={!newNodeLabel.trim()}>
                                <span>Add</span>
                            </button>
                        </div>
                    )}

                    {/* React Flow canvas */}
                    <div className="glass-card overflow-hidden" style={{ height: '500px' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={(changes) => { onNodesChange(changes); if (changes.some(c => c.type === 'position' && c.dragging === false)) setFlowchartDirty(true); }}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            fitView
                            attributionPosition="bottom-left"
                        >
                            <Controls />
                            <Background color="#2a2b3d" gap={20} />
                            <MiniMap
                                nodeColor="#8b5cf6"
                                maskColor="rgba(10, 11, 15, 0.8)"
                                style={{ background: '#12131a' }}
                            />
                        </ReactFlow>
                    </div>
                </div>
            )}

            {/* Specification View */}
            {viewMode === 'spec' && (
                <div className="space-y-4">
                    {/* Problem Statement */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-[var(--color-accent-cyan)] mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> The Task (Could someone with no background understand this?)
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {stage4.problem_statement || 'Not yet generated.'}
                        </p>
                    </div>

                    {/* Acceptance Criteria */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-[var(--color-accent-green)] mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> How to check if the work is done right
                        </h3>
                        <div className="space-y-2">
                            {(stage4.acceptance_criteria || []).map((ac, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-glass)] p-3 rounded-lg">
                                    <span className="text-[var(--color-accent-green)] font-bold text-xs mt-0.5">#{i + 1}</span>
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">{ac.criterion || ac}</p>
                                        {ac.verification_method && (
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Check: {ac.verification_method}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Constraint Architecture */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold mb-3">Rules for how the AI should work</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs font-medium text-[var(--color-accent-green)] mb-2 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Must Do
                                </p>
                                {(stage4.constraint_architecture?.musts || []).map((m, i) => (
                                    <p key={i} className="text-xs text-[var(--color-text-muted)] mb-1.5 pl-3 border-l-2 border-[var(--color-accent-green)]/30">{m}</p>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--color-accent-red)] mb-2 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Must NOT Do
                                </p>
                                {(stage4.constraint_architecture?.must_nots || []).map((m, i) => (
                                    <p key={i} className="text-xs text-[var(--color-text-muted)] mb-1.5 pl-3 border-l-2 border-[var(--color-accent-red)]/30">{m}</p>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--color-accent-yellow)] mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Stop and Ask
                                </p>
                                {(stage4.constraint_architecture?.escalation_triggers || []).map((m, i) => (
                                    <p key={i} className="text-xs text-[var(--color-text-muted)] mb-1.5 pl-3 border-l-2 border-[var(--color-accent-yellow)]/30">{m}</p>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--color-accent-blue)] mb-2 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Nice to Have
                                </p>
                                {(stage4.constraint_architecture?.preferences || []).map((m, i) => (
                                    <p key={i} className="text-xs text-[var(--color-text-muted)] mb-1.5 pl-3 border-l-2 border-[var(--color-accent-blue)]/30">{m}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Break Patterns */}
                    {stage4.break_patterns?.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold mb-3">How big tasks get divided into smaller ones</h3>
                            <div className="space-y-2">
                                {stage4.break_patterns.map((bp, i) => (
                                    <div key={i} className="bg-[var(--color-bg-glass)] p-3 rounded-lg">
                                        <p className="text-sm text-[var(--color-text-primary)]">{bp.rule || bp}</p>
                                        {bp.example && (
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">Example: {bp.example}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evaluation Design */}
                    {stage4.evaluation_design?.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold mb-3">How we test if the AI did a good job</h3>
                            <div className="space-y-3">
                                {stage4.evaluation_design.map((test, i) => (
                                    <div key={i} className="bg-[var(--color-bg-glass)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
                                        <p className="text-xs font-medium text-[var(--color-brand-primary)] mb-1">Test #{i + 1}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                            <strong>Scenario:</strong> {test.input_scenario || test.scenario}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            <strong>Expected:</strong> {test.expected_output || test.expected}
                                        </p>
                                        <p className="text-xs text-[var(--color-accent-green)] mt-1">
                                            <strong>Pass if:</strong> {test.pass_condition || test.condition}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Summary/Export View — with Run This Spec (PRD Section 14.3) */}
            {viewMode === 'export' && (
                <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-[var(--color-accent-green)]" />
                    </div>
                    <h3 className="text-xl font-semibold font-[var(--font-display)] mb-2">
                        Your specification is {completenessScore >= 75 ? 'ready!' : 'almost ready'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                        {completenessScore >= 75
                            ? 'Your spec is complete enough for an AI agent to start working autonomously.'
                            : 'Fill in the remaining gaps to make your spec production-ready.'}
                    </p>

                    <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold font-[var(--font-display)] gradient-text">{completenessScore}%</div>
                            <p className="text-xs text-[var(--color-text-muted)]">Complete</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold font-[var(--font-display)] text-[var(--color-accent-green)]">
                                {stage4.acceptance_criteria?.length || 0}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)]">Quality Checks</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold font-[var(--font-display)] text-[var(--color-accent-yellow)]">
                                {stage4.evaluation_design?.length || 0}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)]">Test Cases</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={onRunSpec}
                            className="btn-primary animate-pulse-glow"
                        >
                            <span className="flex items-center gap-2">
                                <Rocket className="w-4 h-4" />
                                Run This Spec
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
