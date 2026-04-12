/**
 * hospitalController.js
 *
 * OOSE Concepts:
 *   - Encapsulation : getBasicInfo() instance method bundles hospital data access.
 *   - Abstraction   : Controller calls Hospital.find() — doesn't know about the DB engine.
 */
const { Hospital, Doctor } = require('../models');

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    // Find doctors that visit this hospital
    const doctors = await Doctor.find(
      { 'hospitals.hospital': hospital._id },
      'name specialization experience rating phone consultation_fee'
    );

    res.json({ success: true, data: { ...hospital.toJSON(), doctors } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const { emergency } = req.query;
    const query = {};
    if (emergency !== undefined) query.emergency = emergency === 'true';

    const hospitals = await Hospital.find(query);

    // Attach associated doctors to each hospital
    const results = await Promise.all(
      hospitals.map(async (h) => {
        const doctors = await Doctor.find(
          { 'hospitals.hospital': h._id },
          'name specialization'
        );
        return { ...h.toJSON(), doctors };
      })
    );

    res.json({ success: true, data: results, total: results.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSymptomMap = (req, res) => {
  const symptomMap = {
    'Chest Pain':    'Cardiologist',
    'Headache':      'Neurologist',
    'Migraine':      'Neurologist',
    'Skin Rash':     'Dermatologist',
    'Stomach Pain':  'Gastroenterologist',
    'Nausea':        'Gastroenterologist',
    'Joint Pain':    'Orthopedist',
    'Back Pain':     'Orthopedist',
    'Fever':         'General Physician',
    'Cough':         'Pulmonologist',
    'Diabetes':      'Endocrinologist',
    'Anxiety':       'Psychiatrist',
    'Depression':    'Psychiatrist',
    'Eye Pain':      'Ophthalmologist',
    'Ear Pain':      'ENT Specialist',
    'Sore Throat':   'ENT Specialist',
    'Tooth Pain':    'Dentist',
    'Child Fever':   'Pediatrician',
  };
  res.json({ success: true, data: symptomMap });
};
