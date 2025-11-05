const { sql } = require('../config/database');

// Appointment Schema Definition
const AppointmentSchema = {
  tableName: 'appointments',
  columns: {
    appointment_id: { type: sql.Int, primaryKey: true, autoIncrement: true },
    patient_id: { type: sql.Int, required: true, foreignKey: { table: 'users', column: 'user_id' } },
    doctor_id: { type: sql.Int, required: true, foreignKey: { table: 'users', column: 'user_id' } },
    date: { type: sql.Date, required: true },
    time: { type: sql.Time, required: true },
    status: { 
      type: sql.VarChar(50), 
      required: true, 
      enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    remarks: { type: sql.VarChar(255), required: false },
    created_at: { type: sql.DateTime, default: 'GETDATE()' },
    updated_at: { type: sql.DateTime, default: 'GETDATE()' }
  },
  relationships: {
    patient: { type: 'belongsTo', model: 'User', foreignKey: 'patient_id' },
    doctor: { type: 'belongsTo', model: 'User', foreignKey: 'doctor_id' },
    prescription: { type: 'hasOne', model: 'Prescription', foreignKey: 'appointment_id' },
    notifications: { type: 'hasMany', model: 'Notification', foreignKey: 'appointment_id' }
  }
};

module.exports = AppointmentSchema;
