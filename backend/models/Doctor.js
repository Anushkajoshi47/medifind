const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  specialization: { type: DataTypes.STRING, allowNull: false },
  experience: { type: DataTypes.INTEGER, allowNull: false },
  education: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  reviews_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  phone: { type: DataTypes.STRING },
  image_url: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  languages: { type: DataTypes.JSON, defaultValue: [] },
  consultation_fee: { type: DataTypes.INTEGER, defaultValue: 500 },
}, {
  tableName: 'doctors',
  timestamps: true,
});

module.exports = Doctor;
