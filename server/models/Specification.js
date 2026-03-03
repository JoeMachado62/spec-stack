const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Specification = sequelize.define('specifications', {
    spec_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'projects', key: 'project_id' }
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    // Stage 1: Prompt Craft
    stage_1_prompt: {
        type: DataTypes.JSONB,
        defaultValue: {
            raw_input: '',
            instruction_block: '',
            examples: [],
            counter_examples: [],
            output_format: '',
            ambiguity_rules: [],
            guard_rails: []
        }
    },
    // Stage 2: Context Engineering
    stage_2_context: {
        type: DataTypes.JSONB,
        defaultValue: {
            system_prompt_components: [],
            tool_definitions: [],
            document_references: [],
            memory_config: {},
            exclusion_list: [],
            token_budget: {
                target: 0,
                current: 0,
                signal_level: 'green'
            }
        }
    },
    // Stage 3: Intent Engineering
    stage_3_intent: {
        type: DataTypes.JSONB,
        defaultValue: {
            ranked_goals: [],
            tradeoff_rules: [],
            decision_boundaries: [],
            success_metrics: [],
            failure_modes: [],
            escalation_triggers: []
        }
    },
    // Stage 4: Specification Engineering (Five Primitives)
    stage_4_spec: {
        type: DataTypes.JSONB,
        defaultValue: {
            problem_statement: '',
            acceptance_criteria: [],
            constraint_architecture: {
                musts: [],
                must_nots: [],
                preferences: [],
                escalation_triggers: []
            },
            break_patterns: [],
            evaluation_design: []
        }
    },
    // Visual Flowchart (React Flow compatible)
    visual_flowchart: {
        type: DataTypes.JSONB,
        defaultValue: {
            nodes: [],
            edges: []
        }
    },
    completeness_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 }
    },
    current_stage: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: { min: 1, max: 4 }
    },
    // Export formats generated
    exports: {
        type: DataTypes.JSONB,
        defaultValue: {
            markdown: null,
            claude_md: null,
            json: null
        }
    }
});

module.exports = Specification;
