const { sql, getConnection } = require('../config/database');
const UserSchema = require('../Model/User');

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const pool = await getConnection();
    
    // Find user by email
    const result = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.recordset[0];

    // Note: In production, use bcrypt to compare hashed passwords
    // For now, doing direct comparison (NOT RECOMMENDED FOR PRODUCTION)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { user_id, first_name, last_name, email, password, role, contact_number } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if user already exists
    const pool = await getConnection();
    const existingUser = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate user_id if not provided
    const crypto = require('crypto');
    const userId = user_id || crypto.randomUUID();

    // Note: In production, hash the password using bcrypt before storing
    const result = await pool.request()
      .input('user_id', sql.VarChar(50), userId)
      .input('first_name', sql.VarChar(100), first_name)
      .input('last_name', sql.VarChar(100), last_name)
      .input('email', sql.VarChar(100), email)
      .input('password', sql.VarChar(255), password)
      .input('role', sql.VarChar(50), role)
      .input('contact_number', sql.VarChar(20), contact_number)
      .query(`
        INSERT INTO users (user_id, first_name, last_name, email, password, role, contact_number, created_at)
        OUTPUT INSERTED.*
        VALUES (@user_id, @first_name, @last_name, @email, @password, @role, @contact_number, GETDATE())
      `);

    const createdUser = result.recordset[0];
    // Remove password from response
    delete createdUser.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: createdUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .query('SELECT * FROM users WHERE user_id = @user_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

// Get user by email
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const pool = await getConnection();
    
    let query = 'SELECT * FROM users';
    
    if (role) {
      const result = await pool.request()
        .input('role', sql.VarChar(50), role)
        .query(`${query} WHERE role = @role ORDER BY created_at DESC`);
      
      return res.status(200).json({
        success: true,
        count: result.recordset.length,
        data: result.recordset
      });
    }
    
    const result = await pool.request().query(`${query} ORDER BY created_at DESC`);

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

// Update user (now includes patient fields; preserves existing values when params missing)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Accept both core user fields and patient fields
    const {
      first_name,
      last_name,
      email,
      contact_number,
      gender,
      date_of_birth,
      blood_group,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      medical_history
    } = req.body;

    const pool = await getConnection();

    const checkUser = await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .query('SELECT * FROM users WHERE user_id = @user_id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use COALESCE so that if a param is not provided, the existing column value is kept
    const result = await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .input('first_name', sql.VarChar(100), first_name ?? null)
      .input('last_name', sql.VarChar(100), last_name ?? null)
      .input('email', sql.VarChar(100), email ?? null)
      .input('contact_number', sql.VarChar(20), contact_number ?? null)
      .input('gender', sql.VarChar(10), gender ?? null)
      .input('date_of_birth', sql.Date, date_of_birth ?? null)
      .input('blood_group', sql.VarChar(5), blood_group ?? null)
      .input('address_line1', sql.VarChar(255), address_line1 ?? null)
      .input('address_line2', sql.VarChar(255), address_line2 ?? null)
      .input('city', sql.VarChar(100), city ?? null)
      .input('state', sql.VarChar(100), state ?? null)
      .input('postal_code', sql.VarChar(10), postal_code ?? null)
      .input('country', sql.VarChar(100), country ?? null)
      .input('medical_history', sql.Text, medical_history ?? null)
      .query(`
        UPDATE users 
        SET first_name = COALESCE(@first_name, first_name),
            last_name = COALESCE(@last_name, last_name),
            email = COALESCE(@email, email),
            contact_number = COALESCE(@contact_number, contact_number),
            gender = COALESCE(@gender, gender),
            date_of_birth = COALESCE(@date_of_birth, date_of_birth),
            blood_group = COALESCE(@blood_group, blood_group),
            address_line1 = COALESCE(@address_line1, address_line1),
            address_line2 = COALESCE(@address_line2, address_line2),
            city = COALESCE(@city, city),
            state = COALESCE(@state, state),
            postal_code = COALESCE(@postal_code, postal_code),
            country = COALESCE(@country, country),
            medical_history = COALESCE(@medical_history, medical_history)
        OUTPUT INSERTED.*
        WHERE user_id = @user_id
      `);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const pool = await getConnection();
    const checkUser = await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .query('SELECT * FROM users WHERE user_id = @user_id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .input('password', sql.VarChar(255), password)
      .query('UPDATE users SET password = @password WHERE user_id = @user_id');

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const checkUser = await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .query('SELECT * FROM users WHERE user_id = @user_id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await pool.request()
      .input('user_id', sql.VarChar(50), id)
      .query('DELETE FROM users WHERE user_id = @user_id');

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user count by role
const getUserCountByRole = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT role, COUNT(*) as count FROM users GROUP BY role');

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
  login,
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  getUserCountByRole
};
