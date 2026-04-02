// Comprehensive symptom → specialization mapping
const symptomMap = {
  // Cardiology
  'chest pain': 'Cardiologist',
  'chest tightness': 'Cardiologist',
  'heart palpitations': 'Cardiologist',
  'shortness of breath': 'Cardiologist',
  'high blood pressure': 'Cardiologist',
  'irregular heartbeat': 'Cardiologist',
  'heart attack': 'Cardiologist',
  'hypertension': 'Cardiologist',

  // Neurology
  'headache': 'Neurologist',
  'migraine': 'Neurologist',
  'dizziness': 'Neurologist',
  'seizure': 'Neurologist',
  'numbness': 'Neurologist',
  'memory loss': 'Neurologist',
  'tremor': 'Neurologist',
  'stroke': 'Neurologist',
  'fainting': 'Neurologist',

  // Gastroenterology
  'stomach pain': 'Gastroenterologist',
  'abdominal pain': 'Gastroenterologist',
  'nausea': 'Gastroenterologist',
  'vomiting': 'Gastroenterologist',
  'diarrhea': 'Gastroenterologist',
  'constipation': 'Gastroenterologist',
  'bloating': 'Gastroenterologist',
  'acid reflux': 'Gastroenterologist',
  'heartburn': 'Gastroenterologist',
  'indigestion': 'Gastroenterologist',

  // Orthopedics
  'back pain': 'Orthopedist',
  'joint pain': 'Orthopedist',
  'knee pain': 'Orthopedist',
  'fracture': 'Orthopedist',
  'bone pain': 'Orthopedist',
  'shoulder pain': 'Orthopedist',
  'hip pain': 'Orthopedist',
  'spine pain': 'Orthopedist',
  'muscle pain': 'Orthopedist',

  // Dermatology
  'rash': 'Dermatologist',
  'acne': 'Dermatologist',
  'itching': 'Dermatologist',
  'skin redness': 'Dermatologist',
  'eczema': 'Dermatologist',
  'psoriasis': 'Dermatologist',
  'hair loss': 'Dermatologist',
  'hives': 'Dermatologist',
  'skin infection': 'Dermatologist',

  // Pulmonology
  'cough': 'Pulmonologist',
  'asthma': 'Pulmonologist',
  'wheezing': 'Pulmonologist',
  'breathlessness': 'Pulmonologist',
  'chest congestion': 'Pulmonologist',
  'bronchitis': 'Pulmonologist',
  'pneumonia': 'Pulmonologist',

  // Ophthalmology
  'eye pain': 'Ophthalmologist',
  'blurred vision': 'Ophthalmologist',
  'eye redness': 'Ophthalmologist',
  'vision loss': 'Ophthalmologist',
  'watery eyes': 'Ophthalmologist',
  'eye infection': 'Ophthalmologist',

  // ENT
  'ear pain': 'ENT Specialist',
  'sore throat': 'ENT Specialist',
  'nasal congestion': 'ENT Specialist',
  'runny nose': 'ENT Specialist',
  'tonsil pain': 'ENT Specialist',
  'hearing loss': 'ENT Specialist',
  'sneezing': 'ENT Specialist',
  'sinusitis': 'ENT Specialist',

  // Endocrinology
  'diabetes': 'Endocrinologist',
  'thyroid': 'Endocrinologist',
  'weight gain': 'Endocrinologist',
  'weight loss': 'Endocrinologist',
  'fatigue': 'General Physician',
  'excessive thirst': 'Endocrinologist',
  'frequent urination': 'Endocrinologist',

  // Urology
  'urinary pain': 'Urologist',
  'kidney stone': 'Urologist',
  'blood in urine': 'Urologist',
  'prostate': 'Urologist',
  'uti': 'Urologist',

  // Psychiatry
  'anxiety': 'Psychiatrist',
  'depression': 'Psychiatrist',
  'insomnia': 'Psychiatrist',
  'stress': 'Psychiatrist',
  'panic attack': 'Psychiatrist',
  'mood swings': 'Psychiatrist',

  // General
  'fever': 'General Physician',
  'cold': 'General Physician',
  'flu': 'General Physician',
  'weakness': 'General Physician',
  'body ache': 'General Physician',
  'loss of appetite': 'General Physician',
};

const getSpecializationFromSymptoms = (symptomsInput) => {
  if (!symptomsInput) return 'General Physician';

  const input = symptomsInput.toLowerCase().trim();
  const specializations = new Set();

  // Check each symptom keyword
  for (const [symptom, specialization] of Object.entries(symptomMap)) {
    if (input.includes(symptom)) {
      specializations.add(specialization);
    }
  }

  if (specializations.size === 0) return 'General Physician';
  if (specializations.size === 1) return [...specializations][0];

  // Return array for multiple matches
  return [...specializations];
};

module.exports = { getSpecializationFromSymptoms, symptomMap };
