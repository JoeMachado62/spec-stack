const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('documents', {
    doc_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' }
    },
    source: {
        type: DataTypes.ENUM('notion', 'gdrive', 'upload', 'paste'),
        defaultValue: 'upload'
    },
    source_ref: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    readability_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 }
    },
    content_hash: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    last_indexed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
});

module.exports = Document;
