const { sql } = require('../config/database');

// Simplified PatientDetails Schema
const PatientDetailsSchema = {
  tableName: 'patientdetails',
  columns: {
    // Unique ID for this record (string UUID or custom ID)
    id: { type: sql.VarChar(50), primaryKey: true, unique: true },

    // Link to patient (user)
    user_id: { 
      type: sql.VarChar(50), 
      required: true, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Link to doctor handling the patient
    doctor_id: { 
      type: sql.VarChar(50), 
      required: false, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Patient's problem or chief complaint
    problem: { type: sql.Text, required: true },

    // Record creation timestamp
    created_at: { type: sql.DateTime, default: 'GETDATE()' }
  },
  relationships: {
    user: { type: 'belongsTo', model: 'User', foreignKey: 'user_id' },
    doctor: { type: 'belongsTo', model: 'User', foreignKey: 'doctor_id' }
  }
};

module.exports = PatientDetailsSchema;
