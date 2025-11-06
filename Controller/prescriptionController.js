const crypto = require('crypto');
const { getConnection, sql } = require('../config/database');

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const {
      prescription_id,
      appointment_id,
      doctor_id,
      patient_id,
      problem,
      doctor_notes,
      medicines,
      pdf_link
    } = req.body;

    // Validation: required fields according to schema
    if (
      !appointment_id ||
      !doctor_id ||
      !patient_id ||
      !problem ||
      !doctor_notes ||
      !medicines
    ) {
      return res.status(400).json({
        success: false,
        message: 'appointment_id, doctor_id, patient_id, problem, doctor_notes and medicines are required'
      });
    }

    // Generate prescription_id if not provided
    const id = prescription_id || crypto.randomUUID();

    const pool = await getConnection();
    const result = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .input('appointment_id', sql.Int, appointment_id)
      .input('doctor_id', sql.VarChar(50), doctor_id)
      .input('patient_id', sql.VarChar(50), patient_id)
      .input('problem', sql.VarChar(255), problem)
      .input('doctor_notes', sql.Text, doctor_notes)
      .input('medicines', sql.Text, medicines)
      .input('pdf_link', sql.VarChar(255), pdf_link || null)
      .query(`
        INSERT INTO prescriptions (
          prescription_id, appointment_id, doctor_id, patient_id, 
          problem, doctor_notes, medicines, pdf_link, created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @prescription_id, @appointment_id, @doctor_id, @patient_id,
          @problem, @doctor_notes, @medicines, @pdf_link, GETDATE()
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .query('SELECT * FROM prescriptions WHERE prescription_id = @prescription_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
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

// Get prescription with details
const getPrescriptionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .query(`
        SELECT 
          p.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          u.email as patient_email,
          d.name as doctor_name,
          d.specialization as doctor_specialization,
          d.qualification as doctor_qualification
        FROM prescriptions p
        LEFT JOIN users u ON p.patient_id = u.user_id
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        WHERE p.prescription_id = @prescription_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
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

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          p.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM prescriptions p
        LEFT JOIN users u ON p.patient_id = u.user_id
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

// Get prescriptions by patient ID
const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Fixed: was patient_id, should be patientId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patientId)
      .query(`
        SELECT 
          p.*,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM prescriptions p
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        WHERE p.patient_id = @patient_id
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

// Get prescriptions by doctor ID
const getPrescriptionsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params; // Fixed: was doctor_id, should be doctorId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), doctorId)
      .query(`
        SELECT 
          p.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          u.email as patient_email
        FROM prescriptions p
        LEFT JOIN users u ON p.patient_id = u.user_id
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

// Get prescriptions by appointment ID
const getPrescriptionsByAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('appointment_id', sql.Int, appointment_id)
      .query(`
        SELECT 
          p.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM prescriptions p
        LEFT JOIN users u ON p.patient_id = u.user_id
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        WHERE p.appointment_id = @appointment_id
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

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointment_id,
      doctor_id,
      patient_id,
      problem,
      doctor_notes,
      medicines,
      pdf_link
    } = req.body;

    const pool = await getConnection();
    
    // Check if prescription exists
    const checkResult = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .query('SELECT * FROM prescriptions WHERE prescription_id = @prescription_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const request = pool.request();
    request.input('prescription_id', sql.VarChar(50), id);

    if (appointment_id !== undefined) {
      updates.push('appointment_id = @appointment_id');
      request.input('appointment_id', sql.Int, appointment_id);
    }
    if (doctor_id !== undefined) {
      updates.push('doctor_id = @doctor_id');
      request.input('doctor_id', sql.VarChar(50), doctor_id);
    }
    if (patient_id !== undefined) {
      updates.push('patient_id = @patient_id');
      request.input('patient_id', sql.VarChar(50), patient_id);
    }
    if (problem !== undefined) {
      updates.push('problem = @problem');
      request.input('problem', sql.VarChar(255), problem);
    }
    if (doctor_notes !== undefined) {
      updates.push('doctor_notes = @doctor_notes');
      request.input('doctor_notes', sql.Text, doctor_notes);
    }
    if (medicines !== undefined) {
      updates.push('medicines = @medicines');
      request.input('medicines', sql.Text, medicines);
    }
    if (pdf_link !== undefined) {
      updates.push('pdf_link = @pdf_link');
      request.input('pdf_link', sql.VarChar(255), pdf_link);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const result = await request.query(`
      UPDATE prescriptions
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE prescription_id = @prescription_id
    `);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Check if prescription exists
    const checkResult = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .query('SELECT * FROM prescriptions WHERE prescription_id = @prescription_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .query('DELETE FROM prescriptions WHERE prescription_id = @prescription_id');

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search prescriptions
const searchPrescriptions = async (req, res) => {
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
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM prescriptions p
        LEFT JOIN users u ON p.patient_id = u.user_id
        LEFT JOIN doctordetails d ON p.doctor_id = d.doctor_id
        WHERE 
          p.problem LIKE @query OR
          p.doctor_notes LIKE @query OR
          p.medicines LIKE @query
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

// Update PDF link only
const updatePdfLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdf_link } = req.body;

    if (!pdf_link) {
      return res.status(400).json({
        success: false,
        message: 'PDF link is required'
      });
    }

    const pool = await getConnection();
    
    // Check if prescription exists
    const checkResult = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .query('SELECT * FROM prescriptions WHERE prescription_id = @prescription_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const result = await pool.request()
      .input('prescription_id', sql.VarChar(50), id)
      .input('pdf_link', sql.VarChar(255), pdf_link)
      .query(`
        UPDATE prescriptions
        SET pdf_link = @pdf_link
        OUTPUT INSERTED.*
        WHERE prescription_id = @prescription_id
      `);

    res.status(200).json({
      success: true,
      message: 'PDF link updated successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription count
const getPrescriptionCount = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT COUNT(*) as count FROM prescriptions');

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

module.exports = {
  createPrescription,
  getPrescriptionById,
  getPrescriptionDetails,
  getAllPrescriptions,
  getPrescriptionsByPatient,
  getPrescriptionsByPatientId: getPrescriptionsByPatient, // Alias
  getPrescriptionsByDoctor,
  getPrescriptionsByDoctorId: getPrescriptionsByDoctor, // Alias
  getPrescriptionsByAppointment,
  getPrescriptionByAppointmentId: getPrescriptionsByAppointment, // Alias
  updatePrescription,
  updatePdfLink,
  deletePrescription,
  searchPrescriptions,
  getPrescriptionCount
};
