require('dotenv').config({ path: '../.env' });
const { sequelize, Doctor, Hospital, DoctorHospital } = require('../models');

const hospitals = [
  { id: 'h01', name: 'Apollo Hospitals', address: '21 Greams Lane, Chennai', emergency: true, latitude: 13.060, longitude: 80.237, phone: '+91-44-2829-0200', rating: 4.7, beds: 500, type: 'Multi-Specialty', facilities: ['ICU', 'NICU', 'Dialysis', 'MRI', 'CT Scan', 'Pharmacy', 'Blood Bank'] },
  { id: 'h02', name: 'Fortis Healthcare', address: 'Sector 62, Noida', emergency: true, latitude: 28.627, longitude: 77.371, phone: '+91-120-496-1000', rating: 4.5, beds: 300, type: 'Multi-Specialty', facilities: ['ICU', 'OT', 'Blood Bank', 'Radiology', 'Physiotherapy'] },
  { id: 'h03', name: 'Max Super Speciality', address: 'Press Enclave Road, Saket, Delhi', emergency: true, latitude: 28.529, longitude: 77.221, phone: '+91-11-2651-5050', rating: 4.6, beds: 400, type: 'Super Speciality', facilities: ['Cardiology', 'Neurology', 'Oncology', 'Transplant', 'Robotics'] },
  { id: 'h04', name: 'Kokilaben Hospital', address: 'Rao Saheb Achutrao Patwardhan Marg, Mumbai', emergency: true, latitude: 19.130, longitude: 72.823, phone: '+91-22-4269-6969', rating: 4.8, beds: 750, type: 'Multi-Specialty', facilities: ['Robotic Surgery', 'NICU', 'Proton Therapy', 'MRI', 'PET Scan', 'Cath Lab'] },
  { id: 'h05', name: 'Lilavati Hospital', address: 'A-791, Bandra Reclamation, Mumbai', emergency: false, latitude: 19.050, longitude: 72.832, phone: '+91-22-2675-1000', rating: 4.4, beds: 350, type: 'General', facilities: ['OPD', 'Emergency', 'Radiology', 'Pharmacy', 'Pathology'] },
  { id: 'h06', name: 'Hinduja Hospital', address: 'Veer Savarkar Marg, Mahim, Mumbai', emergency: true, latitude: 19.032, longitude: 72.838, phone: '+91-22-2445-1515', rating: 4.9, beds: 400, type: 'Multi-Specialty', facilities: ['ICU', 'Cath Lab', 'Blood Bank', 'Pharmacy', 'Dialysis'] },
  { id: 'h07', name: 'Tata Memorial Centre', address: 'Dr. E Borges Road, Parel, Mumbai', emergency: true, latitude: 19.006, longitude: 72.840, phone: '+91-22-2417-7000', rating: 4.9, beds: 600, type: 'Oncology Specialty', facilities: ['Radiation Oncology', 'Surgery', 'PET Scan', 'Chemotherapy', 'Immunotherapy'] },
  { id: 'h08', name: 'Nanavati Super Speciality', address: 'SV Road, Vile Parle, Mumbai', emergency: true, latitude: 19.098, longitude: 72.842, phone: '+91-22-2626-7500', rating: 4.6, beds: 350, type: 'Multi-Specialty', facilities: ['Neurosciences', 'Orthopedics', 'MRI', 'Dialysis', 'NICU'] },
  { id: 'h09', name: 'AIIMS New Delhi', address: 'Sri Aurobindo Marg, Ansari Nagar, Delhi', emergency: true, latitude: 28.568, longitude: 77.210, phone: '+91-11-2658-8500', rating: 5.0, beds: 2500, type: 'Government Teaching', facilities: ['All Specialities', 'Research', 'Emergency', 'Trauma Centre', 'Blood Bank'] },
  { id: 'h10', name: 'Manipal Hospital', address: '#98, HAL Airport Road, Bangalore', emergency: true, latitude: 12.959, longitude: 77.649, phone: '+91-80-2502-4444', rating: 4.7, beds: 650, type: 'Multi-Specialty', facilities: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Transplant', 'ICU'] },
  { id: 'h11', name: 'Christian Medical College', address: 'Ida Scudder Road, Vellore, Tamil Nadu', emergency: true, latitude: 12.932, longitude: 79.133, phone: '+91-416-228-4272', rating: 4.8, beds: 900, type: 'Teaching Hospital', facilities: ['All Specialities', 'Research Labs', 'Emergency', 'Dermatology', 'ENT'] },
  { id: 'h12', name: 'Medanta — The Medicity', address: 'Sector 38, Gurugram, Haryana', emergency: true, latitude: 28.440, longitude: 77.026, phone: '+91-124-414-1414', rating: 4.8, beds: 1250, type: 'Centre of Excellence', facilities: ['Heart Institute', 'Neuro Centre', 'Oncology', 'Orthopedics', 'NICU', 'Robotics'] },
];

const doctors = [
  { id: 'd01', name: 'Dr. Arjun Mehta', specialization: 'Cardiologist', experience: 18, education: 'MBBS, MD (Cardiology) — AIIMS Delhi', rating: 4.9, reviews_count: 512, latitude: 28.568, longitude: 77.210, phone: '+91-98765-43210', consultation_fee: 1200, bio: 'Pioneer in minimally invasive cardiac surgery with 18 years at AIIMS. Specialist in angioplasty, bypass surgery, and complex heart failure cases.', languages: ['English', 'Hindi'] },
  { id: 'd02', name: 'Dr. Priya Sharma', specialization: 'Neurologist', experience: 14, education: 'MBBS, DM (Neurology) — PGI Chandigarh', rating: 4.8, reviews_count: 345, latitude: 28.627, longitude: 77.371, phone: '+91-98765-43211', consultation_fee: 1000, bio: 'Expert in migraine management, Parkinson\'s, epilepsy, and stroke care. Known for patient-centric approach.', languages: ['English', 'Hindi', 'Punjabi'] },
  { id: 'd03', name: 'Dr. Rohan Kapoor', specialization: 'Orthopedist', experience: 20, education: 'MBBS, MS (Ortho) — KEM Mumbai', rating: 4.7, reviews_count: 298, latitude: 19.130, longitude: 72.823, phone: '+91-98765-43212', consultation_fee: 900, bio: 'Joint replacement specialist. Performed 3000+ knee and hip replacements. Expertise in sports injuries and arthroscopy.', languages: ['English', 'Hindi', 'Marathi'] },
  { id: 'd04', name: 'Dr. Sunita Rao', specialization: 'Dermatologist', experience: 12, education: 'MBBS, MD (Dermatology) — Manipal University', rating: 4.6, reviews_count: 267, latitude: 12.959, longitude: 77.649, phone: '+91-98765-43213', consultation_fee: 700, bio: 'Specializes in cosmetic dermatology, laser treatments, psoriasis, and autoimmune skin conditions.', languages: ['English', 'Kannada', 'Telugu'] },
  { id: 'd05', name: 'Dr. Vijay Nair', specialization: 'Gastroenterologist', experience: 16, education: 'MBBS, DM (Gastro) — JIPMER Puducherry', rating: 4.8, reviews_count: 320, latitude: 19.050, longitude: 72.832, phone: '+91-98765-43214', consultation_fee: 1100, bio: 'Advanced endoscopy specialist. Expert in liver diseases, IBD, and pancreatic disorders. Performed 5000+ endoscopies.', languages: ['English', 'Malayalam', 'Tamil'] },
  { id: 'd06', name: 'Dr. Kavya Iyer', specialization: 'Pediatrician', experience: 11, education: 'MBBS, MD (Pediatrics) — Kasturba Medical College', rating: 4.9, reviews_count: 630, latitude: 12.932, longitude: 79.133, phone: '+91-98765-43215', consultation_fee: 600, bio: 'Dedicated to child health from newborns to adolescents. Specialist in neonatal care, childhood infections, and developmental issues.', languages: ['English', 'Tamil', 'Malayalam'] },
  { id: 'd07', name: 'Dr. Amit Joshi', specialization: 'Pulmonologist', experience: 13, education: 'MBBS, MD (Pulmonology) — AIIMS Jodhpur', rating: 4.5, reviews_count: 234, latitude: 28.440, longitude: 77.026, phone: '+91-98765-43216', consultation_fee: 850, bio: 'Specialist in asthma, COPD, sleep apnea, and interstitial lung diseases. Expert in bronchoscopy procedures.', languages: ['English', 'Hindi', 'Gujarati'] },
  { id: 'd08', name: 'Dr. Meera Pillai', specialization: 'Gynecologist', experience: 22, education: 'MBBS, MS (OBG) — Grant Medical College Mumbai', rating: 4.9, reviews_count: 720, latitude: 19.032, longitude: 72.838, phone: '+91-98765-43217', consultation_fee: 900, bio: 'High-risk pregnancy and laparoscopic surgery expert. 22 years of experience in maternal-fetal medicine.', languages: ['English', 'Hindi', 'Malayalam', 'Marathi'] },
  { id: 'd09', name: 'Dr. Rajan Gupta', specialization: 'Psychiatrist', experience: 15, education: 'MBBS, MD (Psychiatry) — NIMHANS Bangalore', rating: 4.6, reviews_count: 289, latitude: 28.529, longitude: 77.221, phone: '+91-98765-43218', consultation_fee: 800, bio: 'Specializes in depression, anxiety disorders, OCD, addiction psychiatry, and geriatric mental health.', languages: ['English', 'Hindi', 'Kannada'] },
  { id: 'd10', name: 'Dr. Nisha Verma', specialization: 'Ophthalmologist', experience: 10, education: 'MBBS, MS (Ophthalmology) — LV Prasad Eye Institute', rating: 4.7, reviews_count: 311, latitude: 13.060, longitude: 80.237, phone: '+91-98765-43219', consultation_fee: 700, bio: 'LASIK specialist with expertise in cataract surgery, retinal diseases, and glaucoma management.', languages: ['English', 'Hindi', 'Telugu'] },
  { id: 'd11', name: 'Dr. Suresh Bhat', specialization: 'ENT Specialist', experience: 17, education: 'MBBS, MS (ENT) — Bombay Hospital Institute', rating: 4.5, reviews_count: 256, latitude: 19.006, longitude: 72.840, phone: '+91-98765-43220', consultation_fee: 700, bio: 'Head & neck oncology surgeon. Expert in cochlear implants, sinus surgeries, and voice disorders.', languages: ['English', 'Marathi', 'Konkani'] },
  { id: 'd12', name: 'Dr. Ananya Das', specialization: 'Endocrinologist', experience: 13, education: 'MBBS, DM (Endocrinology) — SGPGI Lucknow', rating: 4.8, reviews_count: 278, latitude: 28.568, longitude: 77.210, phone: '+91-98765-43221', consultation_fee: 900, bio: 'Type 1 & 2 diabetes specialist. Expert in thyroid disorders, PCOS, obesity, and hormonal imbalances.', languages: ['English', 'Hindi', 'Bengali'] },
  { id: 'd13', name: 'Dr. Harish Kulkarni', specialization: 'General Physician', experience: 24, education: 'MBBS, MD (Internal Medicine) — BJ Medical College Pune', rating: 4.7, reviews_count: 830, latitude: 19.130, longitude: 72.823, phone: '+91-98765-43222', consultation_fee: 400, bio: 'Trusted family physician with 24 years. Specializes in preventive care, chronic disease management, and infectious diseases.', languages: ['English', 'Hindi', 'Marathi', 'Kannada'] },
  { id: 'd14', name: 'Dr. Pooja Saxena', specialization: 'Dentist', experience: 9, education: 'BDS, MDS (Orthodontics) — Maulana Azad Dental College', rating: 4.6, reviews_count: 394, latitude: 28.627, longitude: 77.371, phone: '+91-98765-43223', consultation_fee: 500, bio: 'Cosmetic and restorative dentist. Specialist in Invisalign, dental implants, veneers, and smile design.', languages: ['English', 'Hindi'] },
  { id: 'd15', name: 'Dr. Ramesh Choudhary', specialization: 'Oncologist', experience: 26, education: 'MBBS, DM (Medical Oncology) — Tata Memorial', rating: 4.9, reviews_count: 1090, latitude: 19.006, longitude: 72.840, phone: '+91-98765-43224', consultation_fee: 2000, bio: 'World-renowned medical oncologist specializing in breast, GI, and lung cancers. Pioneer in targeted therapy protocols.', languages: ['English', 'Hindi', 'Gujarati'] },
  { id: 'd16', name: 'Dr. Sneha Patil', specialization: 'Cardiologist', experience: 16, education: 'MBBS, DNB (Cardiology) — KEM Hospital', rating: 4.7, reviews_count: 245, latitude: 19.032, longitude: 72.838, phone: '+91-98765-43225', consultation_fee: 1100, bio: 'Non-invasive cardiologist specializing in echocardiography, stress testing, and heart failure management.', languages: ['English', 'Marathi', 'Hindi'] },
  { id: 'd17', name: 'Dr. Vikas Singh', specialization: 'Orthopedist', experience: 21, education: 'MBBS, MS (Ortho) — GSMC Mumbai', rating: 4.8, reviews_count: 420, latitude: 19.098, longitude: 72.842, phone: '+91-98765-43226', consultation_fee: 1000, bio: 'Spine surgery expert. Pioneer in minimally invasive spinal procedures. Treated elite athletes and Olympians.', languages: ['English', 'Hindi', 'Gujarati'] },
  { id: 'd18', name: 'Dr. Leena Shah', specialization: 'Dermatologist', experience: 14, education: 'MBBS, DDV — GMC Mumbai', rating: 4.5, reviews_count: 310, latitude: 12.959, longitude: 77.649, phone: '+91-98765-43227', consultation_fee: 800, bio: 'Laser dermatology and aesthetic medicine specialist. Expert in hair transplant, scar revision, and anti-aging.', languages: ['English', 'Gujarati', 'Marathi'] },
  { id: 'd19', name: 'Dr. Pankaj Agarwal', specialization: 'Urologist', experience: 19, education: 'MBBS, MCh (Urology) — SGPGI Lucknow', rating: 4.8, reviews_count: 356, latitude: 28.440, longitude: 77.026, phone: '+91-98765-43228', consultation_fee: 1200, bio: 'Robotic surgeon for prostate, kidney, and bladder conditions. Expert in laparoscopic nephrectomy and stone disease.', languages: ['English', 'Hindi'] },
  { id: 'd20', name: 'Dr. Rekha Menon', specialization: 'Gynecologist', experience: 18, education: 'MBBS, DGO, DNB — Christian Medical College', rating: 4.9, reviews_count: 560, latitude: 12.932, longitude: 79.133, phone: '+91-98765-43229', consultation_fee: 800, bio: 'Specialist in fertility treatment, IVF, endometriosis, and minimal access surgery.', languages: ['English', 'Tamil', 'Malayalam'] },
  { id: 'd21', name: 'Dr. Gaurav Mehrotra', specialization: 'Neurologist', experience: 17, education: 'MBBS, DM (Neurology) — AIIMS Delhi', rating: 4.7, reviews_count: 298, latitude: 28.568, longitude: 77.210, phone: '+91-98765-43230', consultation_fee: 1100, bio: 'Neurointerventionist specializing in stroke thrombolysis, brain hemorrhage, and movement disorders.', languages: ['English', 'Hindi'] },
  { id: 'd22', name: 'Dr. Fatima Khan', specialization: 'Pediatrician', experience: 13, education: 'MBBS, DCH, DNB — Hinduja Hospital', rating: 4.8, reviews_count: 445, latitude: 19.032, longitude: 72.838, phone: '+91-98765-43231', consultation_fee: 650, bio: 'Pediatric pulmonologist with expertise in childhood asthma, allergies, and respiratory infections.', languages: ['English', 'Hindi', 'Urdu'] },
  { id: 'd23', name: 'Dr. Santosh Nair', specialization: 'General Physician', experience: 16, education: 'MBBS, MD (Internal Medicine) — KEM Hospital', rating: 4.6, reviews_count: 510, latitude: 19.050, longitude: 72.832, phone: '+91-98765-43232', consultation_fee: 500, bio: 'General medicine expert with special interest in infectious diseases, hypertension, and diabetes care.', languages: ['English', 'Malayalam', 'Marathi'] },
  { id: 'd24', name: 'Dr. Deepak Sharma', specialization: 'Pulmonologist', experience: 15, education: 'MBBS, MD — PGIMER Chandigarh', rating: 4.5, reviews_count: 234, latitude: 28.627, longitude: 77.371, phone: '+91-98765-43233', consultation_fee: 750, bio: 'Expert in sleep disorders, COPD, asthma management, and interventional pulmonology.', languages: ['English', 'Hindi', 'Punjabi'] },
  { id: 'd25', name: 'Dr. Anita Reddy', specialization: 'Ophthalmologist', experience: 12, education: 'MBBS, DO, DNB — LV Prasad Eye Institute', rating: 4.7, reviews_count: 289, latitude: 12.959, longitude: 77.649, phone: '+91-98765-43234', consultation_fee: 750, bio: 'Paediatric ophthalmologist and cornea specialist. Expert in squint correction and low vision rehabilitation.', languages: ['English', 'Telugu', 'Kannada'] },
  { id: 'd26', name: 'Dr. Mohan Rajan', specialization: 'ENT Specialist', experience: 20, education: 'MBBS, MS (ENT) — CMC Vellore', rating: 4.8, reviews_count: 334, latitude: 12.932, longitude: 79.133, phone: '+91-98765-43235', consultation_fee: 800, bio: 'Head and neck cancer surgeon with subspecialty in skull base surgery and cochlear implantation.', languages: ['English', 'Tamil'] },
  { id: 'd27', name: 'Dr. Prashant Borkar', specialization: 'Psychiatrist', experience: 12, education: 'MBBS, MD (Psychiatry) — Seth GS Medical College', rating: 4.5, reviews_count: 198, latitude: 19.098, longitude: 72.842, phone: '+91-98765-43236', consultation_fee: 700, bio: 'Specializes in adolescent psychiatry, trauma therapy, bipolar disorders, and de-addiction programs.', languages: ['English', 'Marathi', 'Hindi'] },
  { id: 'd28', name: 'Dr. Neha Agarwal', specialization: 'Endocrinologist', experience: 10, education: 'MBBS, MD, DM — Manipal Hospital', rating: 4.7, reviews_count: 212, latitude: 12.959, longitude: 77.649, phone: '+91-98765-43237', consultation_fee: 850, bio: 'Diabetologist and thyroid specialist. Uses cutting-edge CGM technology for diabetes management.', languages: ['English', 'Hindi', 'Kannada'] },
  { id: 'd29', name: 'Dr. Ravi Shankar', specialization: 'Urologist', experience: 14, education: 'MBBS, MS, MCh — AIIMS Bhopal', rating: 4.6, reviews_count: 278, latitude: 28.529, longitude: 77.221, phone: '+91-98765-43238', consultation_fee: 1000, bio: 'Uro-oncologist specializing in laparoscopic and robotic procedures for kidney and prostate cancer.', languages: ['English', 'Hindi'] },
  { id: 'd30', name: 'Dr. Smita Kulkarni', specialization: 'Oncologist', experience: 18, education: 'MBBS, MD (Radiation Oncology) — Tata Memorial', rating: 4.8, reviews_count: 456, latitude: 19.006, longitude: 72.840, phone: '+91-98765-43239', consultation_fee: 1500, bio: 'Radiation oncologist with expertise in stereotactic radiosurgery, IGRT, and palliative care protocols.', languages: ['English', 'Marathi', 'Hindi'] },
];

const mappings = [
  // Dr. Arjun Mehta (Cardiologist)
  { doctor_id: 'd01', hospital_id: 'h09', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '09:00 AM - 01:00 PM' },
  { doctor_id: 'd01', hospital_id: 'h12', visiting_days: ['Tue', 'Thu'], timing: '03:00 PM - 07:00 PM' },
  // Dr. Priya Sharma (Neurologist)
  { doctor_id: 'd02', hospital_id: 'h02', visiting_days: ['Mon', 'Tue', 'Wed'], timing: '10:00 AM - 02:00 PM' },
  { doctor_id: 'd02', hospital_id: 'h03', visiting_days: ['Thu', 'Sat'], timing: '04:00 PM - 08:00 PM' },
  // Dr. Rohan Kapoor (Orthopedist)
  { doctor_id: 'd03', hospital_id: 'h04', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '09:00 AM - 12:00 PM' },
  { doctor_id: 'd03', hospital_id: 'h08', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '02:00 PM - 06:00 PM' },
  // Dr. Sunita Rao (Dermatologist)
  { doctor_id: 'd04', hospital_id: 'h10', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '11:00 AM - 03:00 PM' },
  { doctor_id: 'd04', hospital_id: 'h11', visiting_days: ['Tue', 'Thu'], timing: '09:00 AM - 12:00 PM' },
  // Dr. Vijay Nair (Gastroenterologist)
  { doctor_id: 'd05', hospital_id: 'h05', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '10:00 AM - 01:00 PM' },
  { doctor_id: 'd05', hospital_id: 'h06', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '03:00 PM - 07:00 PM' },
  // Dr. Kavya Iyer (Pediatrician)
  { doctor_id: 'd06', hospital_id: 'h11', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timing: '08:00 AM - 12:00 PM' },
  { doctor_id: 'd06', hospital_id: 'h10', visiting_days: ['Sat'], timing: '10:00 AM - 01:00 PM' },
  // Dr. Amit Joshi (Pulmonologist)
  { doctor_id: 'd07', hospital_id: 'h12', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '02:00 PM - 06:00 PM' },
  { doctor_id: 'd07', hospital_id: 'h02', visiting_days: ['Tue', 'Thu'], timing: '10:00 AM - 02:00 PM' },
  // Dr. Meera Pillai (Gynecologist)
  { doctor_id: 'd08', hospital_id: 'h06', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu'], timing: '09:00 AM - 01:00 PM' },
  { doctor_id: 'd08', hospital_id: 'h04', visiting_days: ['Fri', 'Sat'], timing: '02:00 PM - 06:00 PM' },
  // Dr. Rajan Gupta (Psychiatrist)
  { doctor_id: 'd09', hospital_id: 'h03', visiting_days: ['Wed', 'Thu', 'Fri', 'Sat'], timing: '05:00 PM - 08:00 PM' },
  { doctor_id: 'd09', hospital_id: 'h12', visiting_days: ['Mon', 'Tue'], timing: '11:00 AM - 02:00 PM' },
  // Dr. Nisha Verma (Ophthalmologist)
  { doctor_id: 'd10', hospital_id: 'h01', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '09:00 AM - 12:00 PM' },
  { doctor_id: 'd10', hospital_id: 'h11', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '02:00 PM - 05:00 PM' },
  // Dr. Suresh Bhat (ENT)
  { doctor_id: 'd11', hospital_id: 'h07', visiting_days: ['Mon', 'Tue', 'Wed'], timing: '10:00 AM - 01:00 PM' },
  { doctor_id: 'd11', hospital_id: 'h04', visiting_days: ['Thu', 'Fri', 'Sat'], timing: '03:00 PM - 07:00 PM' },
  // Dr. Ananya Das (Endocrinologist)
  { doctor_id: 'd12', hospital_id: 'h09', visiting_days: ['Tue', 'Thu'], timing: '11:00 AM - 03:00 PM' },
  { doctor_id: 'd12', hospital_id: 'h03', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '09:00 AM - 12:00 PM' },
  // Dr. Harish Kulkarni (General Physician)
  { doctor_id: 'd13', hospital_id: 'h04', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], timing: '08:00 AM - 11:00 AM' },
  { doctor_id: 'd13', hospital_id: 'h05', visiting_days: ['Sun'], timing: '10:00 AM - 01:00 PM' },
  // Dr. Pooja Saxena (Dentist)
  { doctor_id: 'd14', hospital_id: 'h02', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '02:00 PM - 06:00 PM' },
  // Dr. Ramesh Choudhary (Oncologist)
  { doctor_id: 'd15', hospital_id: 'h07', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timing: '09:00 AM - 05:00 PM' },
  { doctor_id: 'd15', hospital_id: 'h12', visiting_days: ['Sat'], timing: '10:00 AM - 01:00 PM' },
  // Dr. Sneha Patil (Cardiologist)
  { doctor_id: 'd16', hospital_id: 'h06', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '10:00 AM - 02:00 PM' },
  { doctor_id: 'd16', hospital_id: 'h04', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '04:00 PM - 08:00 PM' },
  // Dr. Vikas Singh (Orthopedist)
  { doctor_id: 'd17', hospital_id: 'h08', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu'], timing: '09:00 AM - 01:00 PM' },
  { doctor_id: 'd17', hospital_id: 'h12', visiting_days: ['Fri', 'Sat'], timing: '02:00 PM - 06:00 PM' },
  // Dr. Leena Shah (Dermatologist)
  { doctor_id: 'd18', hospital_id: 'h10', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '01:00 PM - 05:00 PM' },
  // Dr. Pankaj Agarwal (Urologist)
  { doctor_id: 'd19', hospital_id: 'h12', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '09:00 AM - 01:00 PM' },
  { doctor_id: 'd19', hospital_id: 'h09', visiting_days: ['Tue', 'Thu'], timing: '03:00 PM - 07:00 PM' },
  // Dr. Rekha Menon (Gynecologist)
  { doctor_id: 'd20', hospital_id: 'h11', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '09:00 AM - 12:00 PM' },
  { doctor_id: 'd20', hospital_id: 'h06', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '02:00 PM - 05:00 PM' },
  // Dr. Gaurav Mehrotra (Neurologist)
  { doctor_id: 'd21', hospital_id: 'h09', visiting_days: ['Wed', 'Thu', 'Fri'], timing: '02:00 PM - 06:00 PM' },
  { doctor_id: 'd21', hospital_id: 'h12', visiting_days: ['Mon', 'Tue'], timing: '09:00 AM - 01:00 PM' },
  // Dr. Fatima Khan (Pediatrician)
  { doctor_id: 'd22', hospital_id: 'h06', visiting_days: ['Mon', 'Wed', 'Fri', 'Sat'], timing: '10:00 AM - 02:00 PM' },
  { doctor_id: 'd22', hospital_id: 'h08', visiting_days: ['Tue', 'Thu'], timing: '03:00 PM - 07:00 PM' },
  // Dr. Santosh Nair (General Physician)
  { doctor_id: 'd23', hospital_id: 'h05', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timing: '08:30 AM - 12:30 PM' },
  // Dr. Deepak Sharma (Pulmonologist)
  { doctor_id: 'd24', hospital_id: 'h02', visiting_days: ['Mon', 'Thu', 'Sat'], timing: '11:00 AM - 03:00 PM' },
  { doctor_id: 'd24', hospital_id: 'h03', visiting_days: ['Tue', 'Wed'], timing: '04:00 PM - 07:00 PM' },
  // Dr. Anita Reddy (Ophthalmologist)
  { doctor_id: 'd25', hospital_id: 'h10', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '09:00 AM - 12:00 PM' },
  { doctor_id: 'd25', hospital_id: 'h11', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '02:00 PM - 05:00 PM' },
  // Dr. Mohan Rajan (ENT)
  { doctor_id: 'd26', hospital_id: 'h11', visiting_days: ['Mon', 'Tue', 'Wed', 'Thu'], timing: '09:00 AM - 12:00 PM' },
  // Dr. Prashant Borkar (Psychiatrist)
  { doctor_id: 'd27', hospital_id: 'h08', visiting_days: ['Wed', 'Thu', 'Fri', 'Sat'], timing: '04:00 PM - 08:00 PM' },
  // Dr. Neha Agarwal (Endocrinologist)
  { doctor_id: 'd28', hospital_id: 'h10', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '10:00 AM - 01:00 PM' },
  // Dr. Ravi Shankar (Urologist)
  { doctor_id: 'd29', hospital_id: 'h03', visiting_days: ['Tue', 'Thu', 'Sat'], timing: '10:00 AM - 02:00 PM' },
  { doctor_id: 'd29', hospital_id: 'h09', visiting_days: ['Mon', 'Wed'], timing: '01:00 PM - 05:00 PM' },
  // Dr. Smita Kulkarni (Oncologist)
  { doctor_id: 'd30', hospital_id: 'h07', visiting_days: ['Mon', 'Wed', 'Fri'], timing: '10:00 AM - 04:00 PM' },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Database synced');
    await Hospital.bulkCreate(hospitals);
    console.log(`Inserted ${hospitals.length} hospitals`);
    await Doctor.bulkCreate(doctors);
    console.log(`Inserted ${doctors.length} doctors`);
    await DoctorHospital.bulkCreate(mappings);
    console.log(`Inserted ${mappings.length} mappings`);
    console.log('Seeding complete!');
    // Only exit if running standalone (not when require()'d by server)
    if (require.main === module) process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    if (require.main === module) process.exit(1);
    else throw err;
  }
};

module.exports = seed;

// Run directly: node seed.js
if (require.main === module) seed();
