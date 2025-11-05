const express = require('express');
const router = express.Router();
const {
  createDoctorDetails,
  getDoctorById,
  getDoctorWithUserInfo,
  getAllDoctors,
  getDoctorsBySpecialization,
  getAllSpecializations,
  updateDoctor,
  deleteDoctor,
  searchDoctors
} = require('../Controller/doctorController');

// Create doctor details
router.post('/', createDoctorDetails);

// Get all doctors
router.get('/', getAllDoctors);

// Search doctors
router.get('/search', searchDoctors);

// Get all specializations
router.get('/specializations', getAllSpecializations);

// Get doctors by specialization
router.get('/specialization/:specialization', getDoctorsBySpecialization);

// Get doctor details with user info
router.get('/:id/full', getDoctorWithUserInfo);

// Get doctor details by ID
router.get('/:id', getDoctorById);

// Update doctor details
router.put('/:id', updateDoctor);

// Delete doctor details
router.delete('/:id', deleteDoctor);

module.exports = router;

