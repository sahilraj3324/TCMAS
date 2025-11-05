const crypto = require('crypto');
const PatientDetails = require('../Model/PatientDetails');

// Create patient details
const createPatientDetails = async (req, res) => {
  try {
    // Accept id optionally; will generate if not provided
    const { id, user_id, doctor_id, problem } = req.body;

    // Validation
    if (!user_id || !problem) {
      return res.status(400).json({
        success: false,
        message: 'user_id and problem are required'
      });
    }

    // Generate a UUID if id not provided
    const recordId = id || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'));

    const patientData = {
      id: recordId,
      user_id,
      ...(doctor_id !== undefined && { doctor_id }),
      problem,
      // created_at should be handled by DB default, but include if model accepts it
      created_at: new Date()
    };

    const patient = await PatientDetails.create(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient details created successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient details by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await PatientDetails.findById(id); // assume model method findById

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient with user info
const getPatientWithUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await PatientDetails.getPatientWithUserInfo(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await PatientDetails.findAll();

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update patient details (partial update)
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, doctor_id, problem } = req.body;

    const patient = await PatientDetails.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    // Build update payload with only provided fields
    const updateData = {};
    if (user_id !== undefined) updateData.user_id = user_id;
    if (doctor_id !== undefined) updateData.doctor_id = doctor_id;
    if (problem !== undefined) updateData.problem = problem;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    const updatedPatient = await PatientDetails.update(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Patient details updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete patient details
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await PatientDetails.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    await PatientDetails.delete(id);

    res.status(200).json({
      success: true,
      message: 'Patient details deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search patients (searches problem, user_id, doctor_id)
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const patients = await PatientDetails.search(query); // model should handle searching across fields

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPatientDetails,
  getPatientById,
  getPatientWithUserInfo,
  getAllPatients,
  updatePatient,
  deletePatient,
  searchPatients
};
