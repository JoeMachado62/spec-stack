const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Example = sequelize.define('examples', {
    example_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    business_type: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    task_pattern: {
        type: DataTypes.ENUM(
            'triage', 'creation', 'transformation', 'routing',
            'scheduling', 'reporting', 'onboarding', 'follow_up'
        ),
        allowNull: false
    },
    complexity_tier: {
        type: DataTypes.ENUM('simple', 'standard', 'complex'),
        defaultValue: 'standard'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    source: {
        type: DataTypes.ENUM('seed', 'community'),
        defaultValue: 'seed'
    },
    eval_success_rate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    domain_keywords: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: []
    },
    // Complete 4-stage spec for this example
    full_spec: {
        type: DataTypes.JSONB,
        defaultValue: {
            stage_1: {},
            stage_2: {},
            stage_3: {},
            stage_4: {},
            visual_flowchart: { nodes: [], edges: [] },
            eval_test_cases: []
        }
    }
});

module.exports = Example;
