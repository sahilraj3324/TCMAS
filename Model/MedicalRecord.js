const { sql } = require('../config/database');

// MedicalRecord Schema Definition (final updated)
const MedicalRecordSchema = {
  tableName: 'medicalrecords',
  columns: {
    // Unique record identifier
    record_id: { type: sql.Int, primaryKey: true, autoIncrement: true },

    // Linked patient (user)
    patient_id: { 
      type: sql.VarChar(50), 
      required: true, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Linked doctor (user)
    doctor_id: { 
      type: sql.VarChar(50), 
      required: false, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Report name or title (e.g., "Blood Test Report", "MRI Scan")
    report_name: { type: sql.VarChar(150), required: true },

    // Medical issue being treated or observed
    problem: { type: sql.VarChar(255), required: true },

    // Record status (e.g., Pending, In Progress, Resolved)
    status: { 
      type: sql.VarChar(50), 
      required: true, 
      enum: ['Pending', 'Ongoing', 'Resolved', 'Cancelled'], 
      default: 'Pending' 
    },

    // Optional description or doctor's notes
    description: { type: sql.VarChar(500), required: false },

    // Upload or record creation time
    upload_date: { type: sql.DateTime, default: 'GETDATE()' }
  },
  relationships: {
    patient: { type: 'belongsTo', model: 'User', foreignKey: 'patient_id' },
    doctor: { type: 'belongsTo', model: 'User', foreignKey: 'doctor_id' }
  }
};

module.exports = MedicalRecordSchema;
