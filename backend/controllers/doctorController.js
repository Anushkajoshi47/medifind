const { Doctor, Hospital, DoctorHospital } = require('../models');
const { Op } = require('sequelize');

// Haversine formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Symptom → Specialization map
const symptomMap = {
  'chest pain': 'Cardiologist',
  'heart palpitations': 'Cardiologist',
  shortness_of_breath: 'Cardiologist',
  headache: 'Neurologist',
  migraine: 'Neurologist',
  dizziness: 'Neurologist',
  'skin rash': 'Dermatologist',
  acne: 'Dermatologist',
  eczema: 'Dermatologist',
  'stomach pain': 'Gastroenterologist',
  nausea: 'Gastroenterologist',
  vomiting: 'Gastroenterologist',
  'joint pain': 'Orthopedist',
  'back pain': 'Orthopedist',
  fracture: 'Orthopedist',
  fever: 'General Physician',
  cough: 'Pulmonologist',
  cold: 'General Physician',
  diabetes: 'Endocrinologist',
  thyroid: 'Endocrinologist',
  depression: 'Psychiatrist',
  anxiety: 'Psychiatrist',
  'eye pain': 'Ophthalmologist',
  'blurred vision': 'Ophthalmologist',
  'ear pain': 'ENT Specialist',
  'sore throat': 'ENT Specialist',
  'tooth pain': 'Dentist',
  'child fever': 'Pediatrician',
  'pregnancy': 'Gynecologist',
};

exports.recommendDoctors = async (req, res) => {
  try {
    const { symptoms, latitude, longitude, radius = 50 } = req.body;

    if (!symptoms || !latitude || !longitude)
      return res.status(400).json({ success: false, message: 'symptoms, latitude, longitude required' });

    // Find specializations
    const specializations = new Set();
    const symptomsLower = symptoms.map((s) => s.toLowerCase());
    
    symptomsLower.forEach((symptom) => {
      Object.entries(symptomMap).forEach(([key, spec]) => {
        if (symptom.includes(key) || key.includes(symptom)) {
          specializations.add(spec);
        }
      });
    });

    if (specializations.size === 0) specializations.add('General Physician');

    const doctors = await Doctor.findAll({
      where: { specialization: { [Op.in]: Array.from(specializations) } },
      include: [{ model: Hospital, as: 'hospitals', through: { attributes: ['visiting_days', 'timing'] } }],
    });

    // Filter by distance and sort
    const withDistance = doctors
      .map((doc) => ({
        ...doc.toJSON(),
        distance: haversineDistance(latitude, longitude, doc.latitude, doc.longitude),
      }))
      .filter((d) => d.distance <= radius)
      .sort((a, b) => a.distance - b.distance || b.rating - a.rating);

    res.json({
      success: true,
      data: {
        specializations: Array.from(specializations),
        doctors: withDistance,
        total: withDistance.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: Hospital, as: 'hospitals', through: { attributes: ['visiting_days', 'timing'] } }],
    });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, latitude, longitude, radius = 50, sort = 'distance' } = req.query;
    const where = specialization ? { specialization } : {};

    const doctors = await Doctor.findAll({
      where,
      include: [{ model: Hospital, as: 'hospitals', through: { attributes: ['visiting_days', 'timing'] } }],
    });

    let result = doctors.map((d) => ({
      ...d.toJSON(),
      distance: latitude && longitude ? haversineDistance(+latitude, +longitude, d.latitude, d.longitude) : null,
    }));

    if (latitude && longitude) {
      result = result.filter((d) => d.distance <= +radius);
    }

    if (sort === 'distance' && latitude) result.sort((a, b) => a.distance - b.distance);
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);

    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
