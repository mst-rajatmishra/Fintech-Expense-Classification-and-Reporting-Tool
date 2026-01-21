const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Upload = sequelize.define('Upload', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
  },
  transactionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'processing',
    validate: {
      isIn: [['success', 'failed', 'processing']],
    },
  },
  errorMessage: {
    type: DataTypes.TEXT,
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'uploads',
  timestamps: true,
  underscored: true,
});

Upload.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Upload, { foreignKey: 'userId' });

module.exports = Upload;
