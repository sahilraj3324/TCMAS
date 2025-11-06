const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Create doctor details (INDEPENDENT - does NOT create user record)
const createDoctorDetails = async (req, res) => {
  try {
    const {
      doctor_id,
      name,
      email,
      username,
      password,
      specialization,
      qualification,
      experience_years,
      city,
      phone_number,
      is_active,
      clinic_name,
      clinic_address
    } = req.body;

    // Validation: required fields
    if (!name || !specialization || !qualification || experience_years === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const generatedDoctorId = doctor_id || crypto.randomUUID();
    const generatedEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@hospital.com`;
    const rawPassword = password || 'doctor123';
    let providedUsername = username;

    const pool = await getConnection();

    // Ensure username exists (generate from name if not)
    if (!providedUsername) {
      // base username from name
      const base = name.toLowerCase().trim().split(/\s+/).join('.');
      providedUsername = base;
    }

    // Ensure username is unique in doctordetails table
    let usernameCandidate = providedUsername;
    let suffixAttempts = 0;
    while (true) {
      const usernameCheck = await pool.request()
        .input('username', sql.VarChar(100), usernameCandidate)
        .query('SELECT 1 FROM doctordetails WHERE username = @username');

      if (usernameCheck.recordset.length === 0) break;

      // if exists, append small random suffix (avoid infinite loop)
      suffixAttempts += 1;
      usernameCandidate = `${providedUsername}.${Math.floor(Math.random() * 9000 + 1000)}`;
      if (suffixAttempts >= 5) {
        usernameCandidate = `${providedUsername}.${crypto.randomBytes(3).toString('hex')}`;
        break;
      }
    }
    providedUsername = usernameCandidate;

    // Check email uniqueness in doctordetails table
    const emailCheck = await pool.request()
      .input('email', sql.VarChar(150), generatedEmail)
      .query('SELECT 1 FROM doctordetails WHERE email = @email');

    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use by another doctor'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    // Coerce is_active if provided (accept 'true'/'false' or 1/0)
    const activeFlag = is_active === undefined
      ? 1 // Default to active
      : (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1' ? 1 : 0);

    // Create doctor record (INDEPENDENT - no user table involved)
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), generatedDoctorId)
      .input('name', sql.VarChar(100), name)
      .input('email', sql.VarChar(150), generatedEmail)
      .input('specialization', sql.VarChar(100), specialization)
      .input('qualification', sql.VarChar(100), qualification)
      .input('experience_years', sql.Int, experience_years)
      .input('city', sql.VarChar(100), city || null)
      .input('phone_number', sql.VarChar(20), phone_number || null)
      .input('is_active', sql.Bit, activeFlag)
      .input('clinic_name', sql.VarChar(150), clinic_name || null)
      .input('clinic_address', sql.VarChar(255), clinic_address || null)
      .input('username', sql.VarChar(100), providedUsername)
      .input('password', sql.VarChar(255), hashedPassword)
      .query(`
        INSERT INTO doctordetails (
          doctor_id, name, email, specialization, qualification, experience_years,
          city, phone_number, is_active, clinic_name, clinic_address,
          username, password
        )
        OUTPUT INSERTED.*
        VALUES (
          @doctor_id, @name, @email, @specialization, @qualification, @experience_years,
          @city, @phone_number, @is_active, @clinic_name, @clinic_address,
          @username, @password
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        doctor: result.recordset[0],
        credentials: {
          doctor_id: generatedDoctorId,
          username: providedUsername,
          email: generatedEmail
        }
      }
    });
  } catch (error) {
    console.error('createDoctorDetails error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login (username or email + password) -> returns JWT
// INDEPENDENT - checks doctordetails table only
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (username or email) and password are required'
      });
    }

    const pool = await getConnection();
    const doctorResult = await pool.request()
      .input('identifier', sql.VarChar(150), identifier)
      .query(`
        SELECT doctor_id, name, username, email, password, specialization, 
               qualification, experience_years, city, phone_number, is_active,
               clinic_name, clinic_address
        FROM doctordetails
        WHERE username = @identifier OR email = @identifier
      `);

    if (doctorResult.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const doctor = doctorResult.recordset[0];

    const passwordMatches = await bcrypt.compare(password, doctor.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const tokenPayload = {
      doctor_id: doctor.doctor_id,
      role: 'doctor',
      name: doctor.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return doctor info without password
    const { password: _, ...doctorSafe } = doctor;

    res.status(200).json({
      success: true,
      token,
      doctor: doctorSafe
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor details by doctor ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), id)
      .query('SELECT * FROM doctordetails WHERE doctor_id = @doctor_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('getDoctorById error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor with user info
const getDoctorWithUserInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('doctor_id', sql.VarChar(50), id)
      .query(`
        SELECT 
          d.*,
          u.first_name, u.last_name, u.email, u.contact_number, u.username
        FROM doctordetails d
        LEFT JOIN users u ON d.doctor_id = u.user_id
        WHERE d.doctor_id = @doctor_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('getDoctorWithUserInfo error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM doctordetails ORDER BY name');

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('getAllDoctors error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('specialization', sql.VarChar(100), specialization)
      .query('SELECT * FROM doctordetails WHERE specialization = @specialization ORDER BY name');

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('getDoctorsBySpecialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all specializations
const getAllSpecializations = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT DISTINCT specialization FROM doctordetails ORDER BY specialization');

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset.map(row => row.specialization)
    });
  } catch (error) {
    console.error('getAllSpecializations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update doctor details (also updates linked users row if needed)
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      specialization,
      qualification,
      experience_years,
      city,
      phone_number,
      is_active,
      clinic_name,
      clinic_address,
      // Optional user fields
      email,
      username,
      password
    } = req.body;

    const pool = await getConnection();

    // Check if doctor exists
    const checkResult = await pool.request()
      .input('doctor_id', sql.VarChar(50), id)
      .query('SELECT * FROM doctordetails WHERE doctor_id = @doctor_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor details not found'
      });
    }

    // Build dynamic update query for doctordetails
    const updates = [];
    const request = pool.request();
    request.input('doctor_id', sql.VarChar(50), id);

    if (name !== undefined) {
      updates.push('name = @name');
      request.input('name', sql.VarChar(100), name);
    }
    if (specialization !== undefined) {
      updates.push('specialization = @specialization');
      request.input('specialization', sql.VarChar(100), specialization);
    }
    if (qualification !== undefined) {
      updates.push('qualification = @qualification');
      request.input('qualification', sql.VarChar(100), qualification);
    }
    if (experience_years !== undefined) {
      updates.push('experience_years = @experience_years');
      request.input('experience_years', sql.Int, experience_years);
    }
    if (city !== undefined) {
      updates.push('city = @city');
      request.input('city', sql.VarChar(100), city);
    }
    if (phone_number !== undefined) {
      updates.push('phone_number = @phone_number');
      request.input('phone_number', sql.VarChar(20), phone_number);
    }
    if (is_active !== undefined) {
      updates.push('is_active = @is_active');
      const activeFlag = (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1') ? 1 : 0;
      request.input('is_active', sql.Bit, activeFlag);
    }
    if (clinic_name !== undefined) {
      updates.push('clinic_name = @clinic_name');
      request.input('clinic_name', sql.VarChar(150), clinic_name);
    }
    if (clinic_address !== undefined) {
      updates.push('clinic_address = @clinic_address');
      request.input('clinic_address', sql.VarChar(255), clinic_address);
    }
    if (username !== undefined) {
      updates.push('username = @username_doctor');
      request.input('username_doctor', sql.VarChar(100), username);
    }
    if (password !== undefined) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push('password = @password_doctor');
      request.input('password_doctor', sql.VarChar(255), hashed);
    }

    let doctorUpdateResult = null;
    if (updates.length > 0) {
      const query = `
        UPDATE doctordetails
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE doctor_id = @doctor_id
      `;
      doctorUpdateResult = await request.query(query);
    }

    // Also update users table if any user fields provided
    const userUpdates = [];
    const userRequest = pool.request();
    userRequest.input('user_id', sql.VarChar(50), id);

    if (name !== undefined) {
      // Split name into first/last
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      userUpdates.push('first_name = @first_name');
      userUpdates.push('last_name = @last_name');
      userRequest.input('first_name', sql.VarChar(100), firstName);
      userRequest.input('last_name', sql.VarChar(100), lastName);
    }

    if (email !== undefined) {
      // Check if email already in use by other user
      const emailCheck = await pool.request()
        .input('email', sql.VarChar(150), email)
        .input('user_id', sql.VarChar(50), id)
        .query('SELECT 1 FROM users WHERE email = @email AND user_id <> @user_id');

      if (emailCheck.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }

      userUpdates.push('email = @email');
      userRequest.input('email', sql.VarChar(150), email);
    }

    if (username !== undefined) {
      // Check if username in use
      const usernameCheck = await pool.request()
        .input('username', sql.VarChar(100), username)
        .input('user_id', sql.VarChar(50), id)
        .query('SELECT 1 FROM users WHERE username = @username AND user_id <> @user_id');

      if (usernameCheck.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username already in use'
        });
      }

      userUpdates.push('username = @username');
      userRequest.input('username', sql.VarChar(100), username);
    }

    if (phone_number !== undefined) {
      userUpdates.push('contact_number = @contact_number');
      userRequest.input('contact_number', sql.VarChar(20), phone_number);
    }

    if (password !== undefined) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      userUpdates.push('password = @password');
      userRequest.input('password', sql.VarChar(255), hashed);
    }

    let userUpdateResult = null;
    if (userUpdates.length > 0) {
      const userQuery = `
        UPDATE users
        SET ${userUpdates.join(', ')}
        OUTPUT INSERTED.user_id, INSERTED.first_name, INSERTED.last_name, INSERTED.email, INSERTED.username, INSERTED.contact_number
        WHERE user_id = @user_id
      `;
      userUpdateResult = await userRequest.query(userQuery);
    }

    res.status(200).json({
      success: true,
      message: 'Doctor details updated successfully',
      doctor: doctorUpdateResult ? doctorUpdateResult.recordset[0] : null,
      user: userUpdateResult ? userUpdateResult.recordset[0] : null
    });
  } catch (error) {
    console.error('updateDoctor error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete doctor details
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    // Check if doctor exists
    const checkResult = await pool.request()
      .input('doctor_id', sql.VarChar(50), id)
      .query('SELECT * FROM doctordetails WHERE doctor_id = @doctor_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor details not found'
      });
    }

    await pool.request()
      .input('doctor_id', sql.VarChar(50), id)
      .query('DELETE FROM doctordetails WHERE doctor_id = @doctor_id');

    // Optionally delete or deactivate user - here we leave user intact; if you want to delete uncomment below:
    // await pool.request().input('user_id', sql.VarChar(50), id).query('DELETE FROM users WHERE user_id = @user_id');

    res.status(200).json({
      success: true,
      message: 'Doctor details deleted successfully'
    });
  } catch (error) {
    console.error('deleteDoctor error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search doctors
const searchDoctors = async (req, res) => {
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
        SELECT * FROM doctordetails
        WHERE 
          name LIKE @query OR
          specialization LIKE @query OR
          city LIKE @query OR
          clinic_name LIKE @query
        ORDER BY name
      `);

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('searchDoctors error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createDoctorDetails,
  login,
  getDoctorById,
  getDoctorWithUserInfo,
  getAllDoctors,
  getDoctorsBySpecialization,
  getAllSpecializations,
  updateDoctor,
  deleteDoctor,
  searchDoctors
};
