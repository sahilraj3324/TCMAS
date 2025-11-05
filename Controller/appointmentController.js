const Appointment = require('../Model/Appointment');

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time, status, remarks } = req.body;

    // Validation
    if (!patient_id || !doctor_id || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, Doctor ID, date, and time are required'
      });
    }

    const appointmentData = {
      patient_id,
      doctor_id,
      date,
      time,
      status: status || 'pending',
      remarks
    };

    const appointment = await Appointment.create(appointmentData);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment with full details
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.getAppointmentDetails(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointments by patient ID
const getAppointmentsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.findByPatientId(patientId);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointments by doctor ID
const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.findByDoctorId(doctorId);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointments by status
const getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const appointments = await Appointment.findByStatus(status);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointments by date
const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.findByDate(date);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get upcoming appointments
const getUpcomingAppointments = async (req, res) => {
  try {
    const { limit } = req.query;
    const appointments = await Appointment.getUpcoming(limit ? parseInt(limit) : 10);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, status, remarks } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointmentData = {
      date,
      time,
      status,
      remarks
    };

    const updatedAppointment = await Appointment.update(id, appointmentData);

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const updatedAppointment = await Appointment.updateStatus(id, status, remarks);

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await Appointment.delete(id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment count by status
const getAppointmentCountByStatus = async (req, res) => {
  try {
    const counts = await Appointment.countByStatus();

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};

