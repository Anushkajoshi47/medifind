const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Hospital = require('./Hospital');
const DoctorHospital = require('./DoctorHospital');

// Associations
Doctor.belongsToMany(Hospital, {
  through: DoctorHospital,
  foreignKey: 'doctor_id',
  otherKey: 'hospital_id',
  as: 'hospitals',
});

Hospital.belongsToMany(Doctor, {
  through: DoctorHospital,
  foreignKey: 'hospital_id',
  otherKey: 'doctor_id',
  as: 'doctors',
});

module.exports = { sequelize, User, Doctor, Hospital, DoctorHospital };
