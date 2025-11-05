const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMedicalRecordById,
  getMedicalRecordDetails,
  getMedicalRecordsByPatientId,
  getAllMedicalRecords,
  updateMedicalRecord,
  updateDescription,
  deleteMedicalRecord,
  countMedicalRecordsByPatient,
  searchMedicalRecords,
  getRecentMedicalRecords
} = require('../Controller/medicalRecordController');

// Create a new medical record
router.post('/', createMedicalRecord);

// Get all medical records
router.get('/', getAllMedicalRecords);

// Search medical records
router.get('/search', searchMedicalRecords);

// Get recent medical records
router.get('/recent', getRecentMedicalRecords);

// Get medical records by patient ID
router.get('/patient/:patientId', getMedicalRecordsByPatientId);

// Count medical records by patient ID
router.get('/patient/:patientId/count', countMedicalRecordsByPatient);

// Get medical record details by ID
router.get('/:id/details', getMedicalRecordDetails);

// Get medical record by ID
router.get('/:id', getMedicalRecordById);

// Update medical record
router.put('/:id', updateMedicalRecord);

// Update description only
router.patch('/:id/description', updateDescription);

// Delete medical record
router.delete('/:id', deleteMedicalRecord);

module.exports = router;

