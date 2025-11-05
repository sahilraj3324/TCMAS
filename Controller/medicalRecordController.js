const MedicalRecord = require('../Model/MedicalRecord');

// Allowed status values (keep in sync with schema)
const ALLOWED_STATUSES = ['Pending', 'Ongoing', 'Resolved', 'Cancelled'];

// Create a new medical record
const createMedicalRecord = async (req, res) => {
  try {
    const { patient_id, doctor_id, problem, status, description } = req.body;

    // Validation
    if (!patient_id || !problem) {
      return res.status(400).json({
        success: false,
        message: 'patient_id and problem are required'
      });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const recordData = {
      patient_id,
      ...(doctor_id !== undefined && { doctor_id }),
      problem,
      status: status || 'Pending',
      ...(description !== undefined && { description }),
      upload_date: new Date()
    };

    const record = await MedicalRecord.create(recordData);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical record by ID
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical record with details
const getMedicalRecordDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.getRecordDetails(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical records by patient ID
const getMedicalRecordsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.findByPatientId(patientId);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.findAll();

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update medical record (partial update)
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, problem, status, description } = req.body;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const recordData = {};
    if (doctor_id !== undefined) recordData.doctor_id = doctor_id;
    if (problem !== undefined) recordData.problem = problem;
    if (status !== undefined) recordData.status = status;
    if (description !== undefined) recordData.description = description;

    if (Object.keys(recordData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    const updatedRecord = await MedicalRecord.update(id, recordData);

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update description only
const updateDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    await MedicalRecord.updateDescription(id, description);

    res.status(200).json({
      success: true,
      message: 'Description updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    await MedicalRecord.delete(id);

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Count medical records by patient
const countMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await MedicalRecord.countByPatientId(patientId);

    res.status(200).json({
      success: true,
      data: { total: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search medical records (searches problem, patient_id, doctor_id, status)
const searchMedicalRecords = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Let model handle searching across relevant columns (problem, patient_id, doctor_id, status)
    const records = await MedicalRecord.search(query);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent medical records
const getRecentMedicalRecords = async (req, res) => {
  try {
    const { limit } = req.query;
    const records = await MedicalRecord.getRecent(limit ? parseInt(limit) : 10);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};
