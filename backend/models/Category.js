const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Category = sequelize.define('Category', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3498db',
  },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
});

Category.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Category, { foreignKey: 'userId' });

module.exports = Category;
