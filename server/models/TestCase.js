const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestCase = sequelize.define('test_cases', {
    test_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    spec_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'specifications', key: 'spec_id' }
    },
    input_scenario: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    expected_output: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    pass_condition: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    last_run_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_result: {
        type: DataTypes.ENUM('pass', 'fail', 'error', 'pending'),
        defaultValue: 'pending'
    },
    result_details: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
});

module.exports = TestCase;
