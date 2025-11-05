const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointmentById,
  getAppointmentDetails,
  getAllAppointments,
  getAppointmentsByPatientId,
  getAppointmentsByDoctorId,
  getAppointmentsByStatus,
  getAppointmentsByDate,
  getUpcomingAppointments,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentCountByStatus
} = require('../Controller/appointmentController');

// Create a new appointment
router.post('/', createAppointment);

// Get all appointments
router.get('/', getAllAppointments);

// Get upcoming appointments
router.get('/upcoming', getUpcomingAppointments);

// Get appointment count by status
router.get('/count-by-status', getAppointmentCountByStatus);

// Get appointments by patient ID
router.get('/patient/:patientId', getAppointmentsByPatientId);

// Get appointments by doctor ID
router.get('/doctor/:doctorId', getAppointmentsByDoctorId);

// Get appointments by status
router.get('/status/:status', getAppointmentsByStatus);

// Get appointments by date
router.get('/date/:date', getAppointmentsByDate);

// Get appointment details by ID
router.get('/:id/details', getAppointmentDetails);

// Get appointment by ID
router.get('/:id', getAppointmentById);

// Update appointment
router.put('/:id', updateAppointment);

// Update appointment status
router.patch('/:id/status', updateAppointmentStatus);

// Delete appointment
router.delete('/:id', deleteAppointment);

module.exports = router;

