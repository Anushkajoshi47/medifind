const { Hospital, Doctor, DoctorHospital } = require('../models');

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id, {
      include: [{
        model: Doctor,
        as: 'doctors',
        through: { attributes: ['visiting_days', 'timing'] },
        attributes: ['id', 'name', 'specialization', 'experience', 'rating', 'phone', 'consultation_fee'],
      }],
    });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: hospital });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const { emergency } = req.query;
    const where = {};
    if (emergency !== undefined) where.emergency = emergency === 'true';

    const hospitals = await Hospital.findAll({
      where,
      include: [{ model: Doctor, as: 'doctors', attributes: ['id', 'name', 'specialization'], through: { attributes: ['visiting_days', 'timing'] } }],
    });
    res.json({ success: true, data: hospitals, total: hospitals.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSymptomMap = (req, res) => {
  const symptomMap = {
    'Chest Pain': 'Cardiologist',
    'Headache': 'Neurologist',
    'Migraine': 'Neurologist',
    'Skin Rash': 'Dermatologist',
    'Stomach Pain': 'Gastroenterologist',
    'Nausea': 'Gastroenterologist',
    'Joint Pain': 'Orthopedist',
    'Back Pain': 'Orthopedist',
    'Fever': 'General Physician',
    'Cough': 'Pulmonologist',
    'Diabetes': 'Endocrinologist',
    'Anxiety': 'Psychiatrist',
    'Depression': 'Psychiatrist',
    'Eye Pain': 'Ophthalmologist',
    'Ear Pain': 'ENT Specialist',
    'Sore Throat': 'ENT Specialist',
    'Tooth Pain': 'Dentist',
    'Child Fever': 'Pediatrician',
  };
  res.json({ success: true, data: symptomMap });
};
