const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Specification = require('./Specification');
const Example = require('./Example');
const TestCase = require('./TestCase');
const Document = require('./Document');

// === Associations ===

// User → Projects (one-to-many)
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project → Specifications (one-to-many, versioned)
Project.hasMany(Specification, { foreignKey: 'project_id', as: 'specifications' });
Specification.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Specification → TestCases (one-to-many)
Specification.hasMany(TestCase, { foreignKey: 'spec_id', as: 'testCases' });
TestCase.belongsTo(Specification, { foreignKey: 'spec_id', as: 'specification' });

// User → Documents (one-to-many)
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    sequelize,
    User,
    Project,
    Specification,
    Example,
    TestCase,
    Document
};
