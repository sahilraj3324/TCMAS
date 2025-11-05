const { sql } = require('../config/database');

// Notification Schema Definition
const NotificationSchema = {
  tableName: 'notifications',
  columns: {
    notification_id: { type: sql.Int, primaryKey: true, autoIncrement: true },
    appointment_id: { type: sql.Int, required: false, foreignKey: { table: 'appointments', column: 'appointment_id' } },
    patient_id: { type: sql.Int, required: true, foreignKey: { table: 'users', column: 'user_id' } },
    receptionist_id: { type: sql.Int, required: false, foreignKey: { table: 'users', column: 'user_id' } },
    message: { type: sql.VarChar(255), required: true },
    notification_type: { 
      type: sql.VarChar(50), 
      required: true, 
      enum: ['appointment_confirmation', 'appointment_reminder', 'appointment_cancellation', 'prescription_ready', 'general'] 
    },
    created_at: { type: sql.DateTime, default: 'GETDATE()' },
    seen: { type: sql.TinyInt, default: 0 }
  },
  relationships: {
    patient: { type: 'belongsTo', model: 'User', foreignKey: 'patient_id' },
    receptionist: { type: 'belongsTo', model: 'User', foreignKey: 'receptionist_id' },
    appointment: { type: 'belongsTo', model: 'Appointment', foreignKey: 'appointment_id' }
  }
};

module.exports = NotificationSchema;
