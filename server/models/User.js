const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('users', {
    user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    business_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    connected_sources: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    vocabulary_level: {
        type: DataTypes.ENUM('plain', 'transitional', 'technical'),
        defaultValue: 'plain'
    },
    session_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    api_keys: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                user.password_hash = await bcrypt.hash(user.password_hash, 12);
            }
        }
    }
});

User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

User.prototype.toSafeJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    delete values.api_keys;
    return values;
};

module.exports = User;
