const express = require('express');
const router = express.Router();
const {
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
} = require('../Controller/notificationController');

// Create a new notification
router.post('/', createNotification);

// Get all notifications
router.get('/', getAllNotifications);

// Get recent notifications
router.get('/recent', getRecentNotifications);

// Delete old notifications
router.delete('/old', deleteOldNotifications);

// Get notifications by patient ID
router.get('/patient/:patientId', getNotificationsByPatientId);

// Get unread notifications by patient ID
router.get('/patient/:patientId/unread', getUnreadNotificationsByPatientId);

// Count unread notifications by patient ID
router.get('/patient/:patientId/unread/count', countUnreadNotifications);

// Mark all patient notifications as seen
router.patch('/patient/:patientId/mark-all-seen', markAllNotificationsAsSeen);

// Get notifications by receptionist ID
router.get('/receptionist/:receptionistId', getNotificationsByReceptionistId);

// Get notifications by type
router.get('/type/:type', getNotificationsByType);

// Get notification details by ID
router.get('/:id/details', getNotificationDetails);

// Get notification by ID
router.get('/:id', getNotificationById);

// Mark notification as seen
router.patch('/:id/seen', markNotificationAsSeen);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;

