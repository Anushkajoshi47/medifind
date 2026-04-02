const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  emergency: { type: DataTypes.BOOLEAN, defaultValue: false },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  phone: { type: DataTypes.STRING },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  beds: { type: DataTypes.INTEGER, defaultValue: 0 },
  image_url: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING, defaultValue: 'General' },
  facilities: { type: DataTypes.JSON, defaultValue: [] },
}, {
  tableName: 'hospitals',
  timestamps: true,
});

module.exports = Hospital;
