const jwt = require('jsonwebtoken');
const { sql, getConnection } = require('../config/database');
const crypto = require('crypto');

// Login
const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation - require either username or email
    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required'
      });
    }

    const pool = await getConnection();
    
    let query = 'SELECT * FROM receptionist WHERE ';
    let identifier = username || email;
    let identifierType = username ? 'username' : 'email';
    
    query += `${identifierType} = @identifier`;

    const result = await pool.request()
      .input('identifier', sql.VarChar(100), identifier)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const receptionist = result.recordset[0];

    // Note: In production, use bcrypt to compare hashed passwords
    // For now, doing direct comparison (NOT RECOMMENDED FOR PRODUCTION)
    if (receptionist.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: receptionist.id,
        email: receptionist.email,
        username: receptionist.username,
        name: receptionist.name,
        role: 'receptionist'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    delete receptionist.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: receptionist,
      token: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create receptionist (POST)
const createReceptionist = async (req, res) => {
  try {
    const { id, name, number, username, email, password } = req.body;

    // Validation
    if (!name || !number || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, number, username, email, password) are required'
      });
    }

    const pool = await getConnection();

    // Check if username or email already exists
    const existingCheck = await pool.request()
      .input('username', sql.VarChar(100), username)
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM receptionist WHERE username = @username OR email = @email');

    if (existingCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Generate ID if not provided
    const receptionistId = id || crypto.randomUUID();

    // Note: In production, hash the password using bcrypt
    const result = await pool.request()
      .input('id', sql.VarChar(50), receptionistId)
      .input('name', sql.VarChar(100), name)
      .input('number', sql.VarChar(20), number)
      .input('username', sql.VarChar(100), username)
      .input('email', sql.VarChar(100), email)
      .input('password', sql.VarChar(255), password)
      .query(`
        INSERT INTO receptionist (id, name, number, username, email, password, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@id, @name, @number, @username, @email, @password, GETDATE(), GETDATE())
      `);

    const createdReceptionist = result.recordset[0];
    delete createdReceptionist.password;

    res.status(201).json({
      success: true,
      message: 'Receptionist created successfully',
      data: createdReceptionist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get receptionist by ID
const getReceptionistById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('SELECT * FROM receptionist WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    const receptionist = result.recordset[0];
    delete receptionist.password;

    res.status(200).json({
      success: true,
      data: receptionist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all receptionists
const getAllReceptionists = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query('SELECT * FROM receptionist ORDER BY created_at DESC');

    // Remove passwords from all records
    const receptionists = result.recordset.map(r => {
      delete r.password;
      return r;
    });

    res.status(200).json({
      success: true,
      count: receptionists.length,
      data: receptionists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update all fields (PUT)
const updateReceptionist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number, username, email, password } = req.body;

    // Validation - require all fields for PUT
    if (!name || !number || !username || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, number, username, email) are required'
      });
    }

    const pool = await getConnection();

    // Check if receptionist exists
    const checkExists = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('SELECT * FROM receptionist WHERE id = @id');

    if (checkExists.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    // Check if username or email is taken by another receptionist
    const duplicateCheck = await pool.request()
      .input('id', sql.VarChar(50), id)
      .input('username', sql.VarChar(100), username)
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM receptionist WHERE (username = @username OR email = @email) AND id != @id');

    if (duplicateCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Build update query
    let updateQuery = `
      UPDATE receptionist 
      SET name = @name, 
          number = @number, 
          username = @username, 
          email = @email,
          updated_at = GETDATE()
    `;

    const request = pool.request()
      .input('id', sql.VarChar(50), id)
      .input('name', sql.VarChar(100), name)
      .input('number', sql.VarChar(20), number)
      .input('username', sql.VarChar(100), username)
      .input('email', sql.VarChar(100), email);

    // If password is provided, update it too
    if (password) {
      updateQuery += ', password = @password';
      request.input('password', sql.VarChar(255), password);
    }

    updateQuery += ' OUTPUT INSERTED.* WHERE id = @id';

    const result = await request.query(updateQuery);

    const updatedReceptionist = result.recordset[0];
    delete updatedReceptionist.password;

    res.status(200).json({
      success: true,
      message: 'Receptionist updated successfully',
      data: updatedReceptionist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete receptionist by ID
const deleteReceptionistById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Check if receptionist exists
    const checkExists = await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('SELECT * FROM receptionist WHERE id = @id');

    if (checkExists.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('DELETE FROM receptionist WHERE id = @id');

    res.status(200).json({
      success: true,
      message: 'Receptionist deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete all receptionists
const deleteAllReceptionists = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query('DELETE FROM receptionist');

    res.status(200).json({
      success: true,
      message: `All receptionists deleted successfully`,
      deletedCount: result.rowsAffected[0]
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
  createReceptionist,
  getReceptionistById,
  getAllReceptionists,
  updateReceptionist,
  deleteReceptionistById,
  deleteAllReceptionists
};

