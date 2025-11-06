const { getConnection, sql } = require('../config/database');

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { appointment_id, patient_id, receptionist_id, message, notification_type } = req.body;

    // Validation
    if (!patient_id || !message || !notification_type) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, message, and notification type are required'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('appointment_id', sql.Int, appointment_id || null)
      .input('patient_id', sql.VarChar(50), patient_id)
      .input('receptionist_id', sql.VarChar(50), receptionist_id || null)
      .input('message', sql.VarChar(255), message)
      .input('notification_type', sql.VarChar(50), notification_type)
      .query(`
        INSERT INTO notifications (
          appointment_id, patient_id, receptionist_id, message, 
          notification_type, created_at, seen
        )
        OUTPUT INSERTED.*
        VALUES (
          @appointment_id, @patient_id, @receptionist_id, @message,
          @notification_type, GETDATE(), 0
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('notification_id', sql.Int, id)
      .query('SELECT * FROM notifications WHERE notification_id = @notification_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
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

// Get notification with details
const getNotificationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('notification_id', sql.Int, id)
      .query(`
        SELECT 
          n.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          u.email as patient_email,
          r.name as receptionist_name,
          a.date as appointment_date,
          a.time as appointment_time
        FROM notifications n
        LEFT JOIN users u ON n.patient_id = u.user_id
        LEFT JOIN receptionist r ON n.receptionist_id = r.id
        LEFT JOIN appointments a ON n.appointment_id = a.appointment_id
        WHERE n.notification_id = @notification_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
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

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          n.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          r.name as receptionist_name
        FROM notifications n
        LEFT JOIN users u ON n.patient_id = u.user_id
        LEFT JOIN receptionist r ON n.receptionist_id = r.id
        ORDER BY n.created_at DESC
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

// Get notifications by patient ID
const getNotificationsByPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patient_id)
      .query(`
        SELECT 
          n.*,
          r.name as receptionist_name,
          a.date as appointment_date,
          a.time as appointment_time
        FROM notifications n
        LEFT JOIN receptionist r ON n.receptionist_id = r.id
        LEFT JOIN appointments a ON n.appointment_id = a.appointment_id
        WHERE n.patient_id = @patient_id
        ORDER BY n.created_at DESC
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

// Get notifications by receptionist ID
const getNotificationsByReceptionist = async (req, res) => {
  try {
    const { receptionist_id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('receptionist_id', sql.VarChar(50), receptionist_id)
      .query(`
        SELECT 
          n.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name,
          a.date as appointment_date
        FROM notifications n
        LEFT JOIN users u ON n.patient_id = u.user_id
        LEFT JOIN appointments a ON n.appointment_id = a.appointment_id
        WHERE n.receptionist_id = @receptionist_id
        ORDER BY n.created_at DESC
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

// Get unseen notifications
const getUnseenNotifications = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          n.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name
        FROM notifications n
        LEFT JOIN users u ON n.patient_id = u.user_id
        WHERE n.seen = 0
        ORDER BY n.created_at DESC
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

// Get unseen notifications by patient
const getUnseenNotificationsByPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patient_id)
      .query(`
        SELECT n.*
        FROM notifications n
        WHERE n.patient_id = @patient_id AND n.seen = 0
        ORDER BY n.created_at DESC
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

// Mark notification as seen
const markNotificationAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Check if notification exists
    const checkResult = await pool.request()
      .input('notification_id', sql.Int, id)
      .query('SELECT * FROM notifications WHERE notification_id = @notification_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const result = await pool.request()
      .input('notification_id', sql.Int, id)
      .query(`
        UPDATE notifications
        SET seen = 1
        OUTPUT INSERTED.*
        WHERE notification_id = @notification_id
      `);

    res.status(200).json({
      success: true,
      message: 'Notification marked as seen',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_id, patient_id, receptionist_id, message, notification_type, seen } = req.body;

    const pool = await getConnection();
    
    // Check if notification exists
    const checkResult = await pool.request()
      .input('notification_id', sql.Int, id)
      .query('SELECT * FROM notifications WHERE notification_id = @notification_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const request = pool.request();
    request.input('notification_id', sql.Int, id);

    if (appointment_id !== undefined) {
      updates.push('appointment_id = @appointment_id');
      request.input('appointment_id', sql.Int, appointment_id);
    }
    if (patient_id !== undefined) {
      updates.push('patient_id = @patient_id');
      request.input('patient_id', sql.VarChar(50), patient_id);
    }
    if (receptionist_id !== undefined) {
      updates.push('receptionist_id = @receptionist_id');
      request.input('receptionist_id', sql.VarChar(50), receptionist_id);
    }
    if (message !== undefined) {
      updates.push('message = @message');
      request.input('message', sql.VarChar(255), message);
    }
    if (notification_type !== undefined) {
      updates.push('notification_type = @notification_type');
      request.input('notification_type', sql.VarChar(50), notification_type);
    }
    if (seen !== undefined) {
      updates.push('seen = @seen');
      request.input('seen', sql.TinyInt, seen ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const result = await request.query(`
      UPDATE notifications
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE notification_id = @notification_id
    `);

    res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Check if notification exists
    const checkResult = await pool.request()
      .input('notification_id', sql.Int, id)
      .query('SELECT * FROM notifications WHERE notification_id = @notification_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await pool.request()
      .input('notification_id', sql.Int, id)
      .query('DELETE FROM notifications WHERE notification_id = @notification_id');

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notifications by type
const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('notification_type', sql.VarChar(50), type)
      .query(`
        SELECT 
          n.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name
        FROM notifications n
        LEFT JOIN users u ON n.patient_id = u.user_id
        WHERE n.notification_type = @notification_type
        ORDER BY n.created_at DESC
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

// Mark all notifications as seen (for a specific patient)
const markAllNotificationsAsSeen = async (req, res) => {
  try {
    const { patient_id } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('patient_id', sql.VarChar(50), patient_id)
      .query(`
        UPDATE notifications
        SET seen = 1
        WHERE patient_id = @patient_id AND seen = 0
      `);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as seen',
      rowsAffected: result.rowsAffected[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Count unread notifications
const countUnreadNotifications = async (req, res) => {
  try {
    const { patient_id } = req.query;
    
    const pool = await getConnection();
    let query = 'SELECT COUNT(*) as count FROM notifications WHERE seen = 0';
    const request = pool.request();

    if (patient_id) {
      query += ' AND patient_id = @patient_id';
      request.input('patient_id', sql.VarChar(50), patient_id);
    }

    const result = await request.query(query);

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

// Delete old notifications (older than specified days)
const deleteOldNotifications = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('days', sql.Int, parseInt(days))
      .query(`
        DELETE FROM notifications
        WHERE DATEDIFF(day, created_at, GETDATE()) > @days
      `);

    res.status(200).json({
      success: true,
      message: `Deleted notifications older than ${days} days`,
      rowsAffected: result.rowsAffected[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent notifications
const getRecentNotifications = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT TOP (@limit)
          n.*,
          u.first_name as patient_first_name,
          u.last_name as patient_last_name
        FROM notifications n
        LEFT JOIN users u ON n.patient_id = u.user_id
        ORDER BY n.created_at DESC
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
  createNotification,
  getNotificationById,
  getNotificationDetails,
  getAllNotifications,
  getNotificationsByPatient,
  getNotificationsByPatientId: getNotificationsByPatient, // Alias
  getNotificationsByReceptionist,
  getNotificationsByReceptionistId: getNotificationsByReceptionist, // Alias
  getUnseenNotifications,
  getUnseenNotificationsByPatient,
  getUnreadNotificationsByPatientId: getUnseenNotificationsByPatient, // Alias
  getNotificationsByType,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  updateNotification,
  deleteNotification,
  countUnreadNotifications,
  deleteOldNotifications,
  getRecentNotifications
};
