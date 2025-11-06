const crypto = require('crypto');
const { getConnection, sql } = require('../config/database');

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
    const recordId = id || crypto.randomUUID();

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.VarChar(50), recordId)
      .input('user_id', sql.VarChar(50), user_id)
      .input('doctor_id', sql.VarChar(50), doctor_id || null)
      .input('problem', sql.Text, problem)
      .query(`
        INSERT INTO patientdetails (id, user_id, doctor_id, problem, created_at)
        OUTPUT INSERTED.*
        VALUES (@id, @user_id, @doctor_id, @problem, GETDATE())
      `);

    res.status(201).json({
      success: true,
      message: 'Patient details created successfully',
      data: result.recordset[0]
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
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('SELECT * FROM patientdetails WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
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

// Get patient with user info
const getPatientWithUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query(`
        SELECT 
          p.*,
          u.first_name,
          u.last_name,
          u.email,
          u.contact_number,
          u.gender,
          u.date_of_birth,
          u.blood_group,
          u.city,
          u.medical_history,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM patientdetails p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
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

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          p.*,
          u.first_name,
          u.last_name,
          u.email,
          u.contact_number,
          d.name as doctor_name
        FROM patientdetails p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        ORDER BY p.created_at DESC
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

// Get patients by doctor
const getPatientsByDoctor = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), doctor_id)
      .query(`
        SELECT 
          p.*,
          u.first_name,
          u.last_name,
          u.email,
          u.contact_number
        FROM patientdetails p
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE p.doctor_id = @doctor_id
        ORDER BY p.created_at DESC
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

// Update patient details
const updatePatientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, doctor_id, problem } = req.body;

    const pool = await getConnection();
    
    // Check if patient exists
    const checkResult = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('SELECT * FROM patientdetails WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const request = pool.request();
    request.input('id', sql.VarChar(50), id);

    if (user_id !== undefined) {
      updates.push('user_id = @user_id');
      request.input('user_id', sql.VarChar(50), user_id);
    }
    if (doctor_id !== undefined) {
      updates.push('doctor_id = @doctor_id');
      request.input('doctor_id', sql.VarChar(50), doctor_id);
    }
    if (problem !== undefined) {
      updates.push('problem = @problem');
      request.input('problem', sql.Text, problem);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const result = await request.query(`
      UPDATE patientdetails
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.status(200).json({
      success: true,
      message: 'Patient details updated successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete patient details
const deletePatientDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Check if patient exists
    const checkResult = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('SELECT * FROM patientdetails WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('DELETE FROM patientdetails WHERE id = @id');

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

// Search patients
const searchPatients = async (req, res) => {
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
          p.*,
          u.first_name,
          u.last_name,
          u.email,
          u.contact_number,
          d.name as doctor_name
        FROM patientdetails p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        WHERE 
          u.first_name LIKE @query OR
          u.last_name LIKE @query OR
          u.email LIKE @query OR
          p.problem LIKE @query
        ORDER BY p.created_at DESC
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
  createPatientDetails,
  getPatientById,
  getPatientWithUserInfo,
  getAllPatients,
  getPatientsByDoctor,
  updatePatientDetails,
  updatePatient: updatePatientDetails, // Alias
  deletePatientDetails,
  deletePatient: deletePatientDetails, // Alias
  searchPatients
};
