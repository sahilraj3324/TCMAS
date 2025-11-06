const { getConnection, sql } = require('../config/database');

// Allowed status values (keep in sync with schema)
const ALLOWED_STATUSES = ['Pending', 'Ongoing', 'Resolved', 'Cancelled'];

// Create a new medical record
const createMedicalRecord = async (req, res) => {
  try {
    const { patient_id, doctor_id, report_name, problem, status, description } = req.body;

    // Validation
    if (!patient_id || !problem || !report_name) {
      return res.status(400).json({
        success: false,
        message: 'patient_id, report_name and problem are required'
      });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patient_id)
      .input('doctor_id', sql.VarChar(50), doctor_id || null)
      .input('report_name', sql.VarChar(150), report_name)
      .input('problem', sql.VarChar(255), problem)
      .input('status', sql.VarChar(50), status || 'Pending')
      .input('description', sql.VarChar(500), description || null)
      .query(`
        INSERT INTO medicalrecords (patient_id, doctor_id, report_name, problem, status, description, upload_date)
        OUTPUT INSERTED.*
        VALUES (@patient_id, @doctor_id, @report_name, @problem, @status, @description, GETDATE())
      `);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: result.recordset[0]
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
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('record_id', sql.Int, id)
      .query('SELECT * FROM medicalrecords WHERE record_id = @record_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0]
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
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('record_id', sql.Int, id)
      .query(`
        SELECT 
          m.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          u.email as patient_email,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM medicalrecords m
        LEFT JOIN users u ON m.patient_id = u.user_id
        LEFT JOIN doctordetails d ON m.doctor_id = d.doctor_id
        WHERE m.record_id = @record_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0]
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
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          m.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM medicalrecords m
        LEFT JOIN users u ON m.patient_id = u.user_id
        LEFT JOIN doctordetails d ON m.doctor_id = d.doctor_id
        ORDER BY m.upload_date DESC
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical records by patient ID
const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Fixed: was patient_id, should be patientId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patientId)
      .query(`
        SELECT 
          m.*,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM medicalrecords m
        LEFT JOIN doctordetails d ON m.doctor_id = d.doctor_id
        WHERE m.patient_id = @patient_id
        ORDER BY m.upload_date DESC
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical records by doctor ID
const getMedicalRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params; // Fixed: was doctor_id, should be doctorId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), doctorId)
      .query(`
        SELECT 
          m.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          u.email as patient_email
        FROM medicalrecords m
        LEFT JOIN users u ON m.patient_id = u.user_id
        WHERE m.doctor_id = @doctor_id
        ORDER BY m.upload_date DESC
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical records by status
const getMedicalRecordsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('status', sql.VarChar(50), status)
      .query(`
        SELECT 
          m.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM medicalrecords m
        LEFT JOIN users u ON m.patient_id = u.user_id
        LEFT JOIN doctordetails d ON m.doctor_id = d.doctor_id
        WHERE m.status = @status
        ORDER BY m.upload_date DESC
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update medical record
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, doctor_id, report_name, problem, status, description } = req.body;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const pool = await getConnection();
    
    // Check if record exists
    const checkResult = await pool.request()
      .input('record_id', sql.Int, id)
      .query('SELECT * FROM medicalrecords WHERE record_id = @record_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const request = pool.request();
    request.input('record_id', sql.Int, id);

    if (patient_id !== undefined) {
      updates.push('patient_id = @patient_id');
      request.input('patient_id', sql.VarChar(50), patient_id);
    }
    if (doctor_id !== undefined) {
      updates.push('doctor_id = @doctor_id');
      request.input('doctor_id', sql.VarChar(50), doctor_id);
    }
    if (report_name !== undefined) {
      updates.push('report_name = @report_name');
      request.input('report_name', sql.VarChar(150), report_name);
    }
    if (problem !== undefined) {
      updates.push('problem = @problem');
      request.input('problem', sql.VarChar(255), problem);
    }
    if (status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.VarChar(50), status);
    }
    if (description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.VarChar(500), description);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const result = await request.query(`
      UPDATE medicalrecords
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE record_id = @record_id
    `);

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: result.recordset[0]
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

    const pool = await getConnection();
    
    // Check if record exists
    const checkResult = await pool.request()
      .input('record_id', sql.Int, id)
      .query('SELECT * FROM medicalrecords WHERE record_id = @record_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    await pool.request()
      .input('record_id', sql.Int, id)
      .query('DELETE FROM medicalrecords WHERE record_id = @record_id');

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

// Search medical records
const searchMedicalRecords = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('query', sql.VarChar(255), `%${query}%`)
      .query(`
        SELECT 
          m.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM medicalrecords m
        LEFT JOIN users u ON m.patient_id = u.user_id
        LEFT JOIN doctordetails d ON m.doctor_id = d.doctor_id
        WHERE 
          m.problem LIKE @query OR
          m.description LIKE @query OR
          m.report_name LIKE @query
        ORDER BY m.upload_date DESC
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
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

    const pool = await getConnection();
    
    // Check if record exists
    const checkResult = await pool.request()
      .input('record_id', sql.Int, id)
      .query('SELECT * FROM medicalrecords WHERE record_id = @record_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    const result = await pool.request()
      .input('record_id', sql.Int, id)
      .input('description', sql.VarChar(500), description)
      .query(`
        UPDATE medicalrecords
        SET description = @description
        OUTPUT INSERTED.*
        WHERE record_id = @record_id
      `);

    res.status(200).json({
      success: true,
      message: 'Description updated successfully',
      data: result.recordset[0]
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
    const { patientId } = req.params; // Fixed: was patient_id, should be patientId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patientId)
      .query('SELECT COUNT(*) as count FROM medicalrecords WHERE patient_id = @patient_id');

    res.status(200).json({
      success: true,
      count: result.recordset[0].count
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
    const { limit = 10 } = req.query;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT TOP (@limit)
          m.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM medicalrecords m
        LEFT JOIN users u ON m.patient_id = u.user_id
        LEFT JOIN doctordetails d ON m.doctor_id = d.doctor_id
        ORDER BY m.upload_date DESC
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
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
  getAllMedicalRecords,
  getMedicalRecordsByPatient,
  getMedicalRecordsByPatientId: getMedicalRecordsByPatient, // Alias
  getMedicalRecordsByDoctor,
  getMedicalRecordsByStatus,
  updateMedicalRecord,
  updateDescription,
  deleteMedicalRecord,
  countMedicalRecordsByPatient,
  searchMedicalRecords,
  getRecentMedicalRecords
};
