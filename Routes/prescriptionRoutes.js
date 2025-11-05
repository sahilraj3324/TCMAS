const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptionById,
  getPrescriptionByAppointmentId,
  getPrescriptionDetails,
  getPrescriptionsByPatientId,
  getPrescriptionsByDoctorId,
  getAllPrescriptions,
  updatePrescription,
  updatePdfLink,
  deletePrescription,
  getPrescriptionCount
} = require('../Controller/prescriptionController');

// Create a new prescription
router.post('/', createPrescription);

// Get all prescriptions
router.get('/', getAllPrescriptions);

// Get total prescription count
router.get('/count', getPrescriptionCount);

// Get prescriptions by patient ID
router.get('/patient/:patientId', getPrescriptionsByPatientId);

// Get prescriptions by doctor ID
router.get('/doctor/:doctorId', getPrescriptionsByDoctorId);

// Get prescription by appointment ID
router.get('/appointment/:appointmentId', getPrescriptionByAppointmentId);

// Get prescription details by ID
router.get('/:id/details', getPrescriptionDetails);

// Get prescription by ID
router.get('/:id', getPrescriptionById);

// Update prescription
router.put('/:id', updatePrescription);

// Update PDF link
router.patch('/:id/pdf', updatePdfLink);

// Delete prescription
router.delete('/:id', deletePrescription);

module.exports = router;

