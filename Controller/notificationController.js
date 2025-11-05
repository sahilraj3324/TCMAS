const Notification = require('../Model/Notification');

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

    const notificationData = {
      appointment_id,
      patient_id,
      receptionist_id,
      message,
      notification_type
    };

    const notification = await Notification.create(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
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
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
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
    const notification = await Notification.getNotificationDetails(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notifications by patient ID
const getNotificationsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const notifications = await Notification.findByPatientId(patientId);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notifications by receptionist ID
const getNotificationsByReceptionistId = async (req, res) => {
  try {
    const { receptionistId } = req.params;
    const notifications = await Notification.findByReceptionistId(receptionistId);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unread notifications by patient ID
const getUnreadNotificationsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const notifications = await Notification.findUnreadByPatientId(patientId);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
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
    const notifications = await Notification.findByType(type);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
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
    const notifications = await Notification.findAll();

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
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

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.markAsSeen(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as seen'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark all patient notifications as seen
const markAllNotificationsAsSeen = async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await Notification.markAllAsSeenByPatientId(patientId);

    res.status(200).json({
      success: true,
      message: `${count} notification(s) marked as seen`
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

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.delete(id);

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

// Count unread notifications
const countUnreadNotifications = async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await Notification.countUnreadByPatientId(patientId);

    res.status(200).json({
      success: true,
      data: { unread: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete old seen notifications
const deleteOldNotifications = async (req, res) => {
  try {
    const { days } = req.query;
    const daysOld = days ? parseInt(days) : 30;
    const count = await Notification.deleteOldSeen(daysOld);

    res.status(200).json({
      success: true,
      message: `${count} old notification(s) deleted`
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
    const { limit } = req.query;
    const notifications = await Notification.getRecent(limit ? parseInt(limit) : 10);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
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
  getNotificationsByPatientId,
  getNotificationsByReceptionistId,
  getUnreadNotificationsByPatientId,
  getNotificationsByType,
  getAllNotifications,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  deleteNotification,
  countUnreadNotifications,
  deleteOldNotifications,
  getRecentNotifications
};

