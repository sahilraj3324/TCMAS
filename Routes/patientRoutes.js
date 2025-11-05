const express = require('express');
const router = express.Router();
const {
  createPatientDetails,
  getPatientById,
  getPatientWithUserInfo,
  getAllPatients,
  updatePatient,
  deletePatient,
  searchPatients
} = require('../Controller/patientController');

// Create patient details
router.post('/', createPatientDetails);

// Get all patients
router.get('/', getAllPatients);

// Search patients
router.get('/search', searchPatients);

// Get patient details with user info
router.get('/:id/full', getPatientWithUserInfo);

// Get patient details by ID
router.get('/:id', getPatientById);

// Update patient details
router.put('/:id', updatePatient);

// Delete patient details
router.delete('/:id', deletePatient);

module.exports = router;

