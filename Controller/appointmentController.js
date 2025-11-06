const { getConnection, sql } = require('../config/database');

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

    const pool = await getConnection();

    // Check if patient exists in users table
    const patientCheck = await pool.request()
      .input('patient_id', sql.VarChar(50), patient_id)
      .query('SELECT user_id FROM users WHERE user_id = @patient_id');

    if (patientCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please ensure the patient is registered.'
      });
    }

    // Check if doctor exists in doctordetails table
    const doctorCheck = await pool.request()
      .input('doctor_id', sql.VarChar(50), doctor_id)
      .query('SELECT doctor_id FROM doctordetails WHERE doctor_id = @doctor_id');

    if (doctorCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found. Please ensure the doctor is registered.'
      });
    }

    // Format time to HH:MM:SS if needed (SQL Server expects this format)
    let formattedTime = time;
    if (time && !time.includes(':')) {
      return res.status(400).json({
        success: false,
        message: 'Time must be in HH:MM or HH:MM:SS format'
      });
    }
    // Ensure time has seconds (HH:MM:SS)
    if (time && time.split(':').length === 2) {
      formattedTime = `${time}:00`;
    }

    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patient_id)
      .input('doctor_id', sql.VarChar(50), doctor_id)
      .input('date', sql.Date, date)
      .input('time', sql.VarChar(8), formattedTime) // Use VarChar instead of Time
      .input('status', sql.VarChar(50), status || 'pending')
      .input('remarks', sql.VarChar(255), remarks || null)
      .query(`
        INSERT INTO appointments (patient_id, doctor_id, date, time, status, remarks, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@patient_id, @doctor_id, @date, @time, @status, @remarks, GETDATE(), GETDATE())
      `);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: result.recordset[0]
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
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('appointment_id', sql.Int, id)
      .query('SELECT * FROM appointments WHERE appointment_id = @appointment_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
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

// Get appointment with full details
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('appointment_id', sql.Int, id)
      .query(`
        SELECT 
          a.*,
          u1.first_name as patient_first_name,
          u1.last_name as patient_last_name,
          u1.email as patient_email,
          u1.contact_number as patient_contact,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM appointments a
        LEFT JOIN users u1 ON a.patient_id = u1.user_id
        LEFT JOIN doctordetails d ON a.doctor_id = d.doctor_id
        WHERE a.appointment_id = @appointment_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
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

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          a.*,
          u1.first_name as patient_first_name,
          u1.last_name as patient_last_name,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM appointments a
        LEFT JOIN users u1 ON a.patient_id = u1.user_id
        LEFT JOIN doctordetails d ON a.doctor_id = d.doctor_id
        ORDER BY a.date DESC, a.time DESC
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

// Get appointments by patient ID
const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params; // Fixed: was patient_id, should be patientId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patientId)
      .query(`
        SELECT 
          a.*,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM appointments a
        LEFT JOIN doctordetails d ON a.doctor_id = d.doctor_id
        WHERE a.patient_id = @patient_id
        ORDER BY a.date DESC, a.time DESC
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

// Get appointments by doctor ID
const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params; // Fixed: was doctor_id, should be doctorId
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), doctorId)
      .query(`
        SELECT 
          a.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          u.email as patient_email
        FROM appointments a
        LEFT JOIN users u ON a.patient_id = u.user_id
        WHERE a.doctor_id = @doctor_id
        ORDER BY a.date DESC, a.time DESC
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

// Get appointments by status
const getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('status', sql.VarChar(50), status)
      .query(`
        SELECT 
          a.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM appointments a
        LEFT JOIN users u ON a.patient_id = u.user_id
        LEFT JOIN doctordetails d ON a.doctor_id = d.doctor_id
        WHERE a.status = @status
        ORDER BY a.date DESC, a.time DESC
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

// Get upcoming appointments
const getUpcomingAppointments = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          a.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name,
          d.specialization as doctor_specialization
        FROM appointments a
        LEFT JOIN users u ON a.patient_id = u.user_id
        LEFT JOIN doctordetails d ON a.doctor_id = d.doctor_id
        WHERE a.date >= CAST(GETDATE() AS DATE)
        ORDER BY a.date ASC, a.time ASC
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

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, doctor_id, date, time, status, remarks } = req.body;

    const pool = await getConnection();
    
    // Check if appointment exists
    const checkResult = await pool.request()
      .input('appointment_id', sql.Int, id)
      .query('SELECT * FROM appointments WHERE appointment_id = @appointment_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const request = pool.request();
    request.input('appointment_id', sql.Int, id);

    if (patient_id !== undefined) {
      updates.push('patient_id = @patient_id');
      request.input('patient_id', sql.VarChar(50), patient_id);
    }
    if (doctor_id !== undefined) {
      updates.push('doctor_id = @doctor_id');
      request.input('doctor_id', sql.VarChar(50), doctor_id);
    }
    if (date !== undefined) {
      updates.push('date = @date');
      request.input('date', sql.Date, date);
    }
    if (time !== undefined) {
      // Format time to HH:MM:SS if needed
      let formattedTime = time;
      if (time.split(':').length === 2) {
        formattedTime = `${time}:00`;
      }
      updates.push('time = @time');
      request.input('time', sql.VarChar(8), formattedTime);
    }
    if (status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.VarChar(50), status);
    }
    if (remarks !== undefined) {
      updates.push('remarks = @remarks');
      request.input('remarks', sql.VarChar(255), remarks);
    }

    updates.push('updated_at = GETDATE()');

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const result = await request.query(`
      UPDATE appointments
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE appointment_id = @appointment_id
    `);

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: result.recordset[0]
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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const pool = await getConnection();
    
    // Check if appointment exists
    const checkResult = await pool.request()
      .input('appointment_id', sql.Int, id)
      .query('SELECT * FROM appointments WHERE appointment_id = @appointment_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const result = await pool.request()
      .input('appointment_id', sql.Int, id)
      .input('status', sql.VarChar(50), status)
      .query(`
        UPDATE appointments
        SET status = @status, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE appointment_id = @appointment_id
      `);

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: result.recordset[0]
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

    const pool = await getConnection();
    
    // Check if appointment exists
    const checkResult = await pool.request()
      .input('appointment_id', sql.Int, id)
      .query('SELECT * FROM appointments WHERE appointment_id = @appointment_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await pool.request()
      .input('appointment_id', sql.Int, id)
      .query('DELETE FROM appointments WHERE appointment_id = @appointment_id');

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

// Get appointments by date
const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('date', sql.Date, date)
      .query(`
        SELECT 
          a.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          d.name as doctor_name
        FROM appointments a
        LEFT JOIN users u ON a.patient_id = u.user_id
        LEFT JOIN doctordetails d ON a.doctor_id = d.doctor_id
        WHERE a.date = @date
        ORDER BY a.time ASC
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

// Get appointment count by status
const getAppointmentCountByStatus = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM appointments
        GROUP BY status
      `);

    res.status(200).json({
      success: true,
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
  createAppointment,
  getAppointmentById,
  getAppointmentDetails,
  getAllAppointments,
  getAppointmentsByPatient,
  getAppointmentsByPatientId: getAppointmentsByPatient, // Alias
  getAppointmentsByDoctor,
  getAppointmentsByDoctorId: getAppointmentsByDoctor, // Alias
  getAppointmentsByStatus,
  getAppointmentsByDate,
  getUpcomingAppointments,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentCountByStatus
};
