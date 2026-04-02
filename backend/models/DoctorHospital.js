const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorHospital = sequelize.define('DoctorHospital', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  doctor_id: { type: DataTypes.UUID, allowNull: false },
  hospital_id: { type: DataTypes.UUID, allowNull: false },
  visiting_days: { type: DataTypes.JSON, defaultValue: [] },
  timing: { type: DataTypes.STRING },
}, {
  tableName: 'doctor_hospitals',
  timestamps: false,
});

module.exports = DoctorHospital;
