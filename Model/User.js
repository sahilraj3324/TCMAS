const { sql } = require('../config/database');

// Unified User + Patient Schema
const UserSchema = {
  tableName: 'users',
  columns: {
    // --- User Core Fields ---
    user_id: { type: sql.VarChar(50), primaryKey: true }, // string-based ID (e.g., UUID)
    first_name: { type: sql.VarChar(100), required: true },
    last_name: { type: sql.VarChar(100), required: true },
    email: { type: sql.VarChar(100), required: true, unique: true },
    password: { type: sql.VarChar(255), required: true },
    role: { 
      type: sql.VarChar(50), 
      required: true, 
      enum: ['admin', 'doctor', 'patient', 'receptionist'] 
    },
    contact_number: { type: sql.VarChar(20), required: false },
    created_at: { type: sql.DateTime, default: 'GETDATE()' },

    // --- Optional Patient Fields ---
    gender: { type: sql.VarChar(10), required: false, enum: ['Male', 'Female', 'Other'] },
    date_of_birth: { type: sql.Date, required: false },
    blood_group: { 
      type: sql.VarChar(5), 
      required: false, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    address_line1: { type: sql.VarChar(255), required: false },
    address_line2: { type: sql.VarChar(255), required: false },
    city: { type: sql.VarChar(100), required: false },
    state: { type: sql.VarChar(100), required: false },
    postal_code: { type: sql.VarChar(10), required: false },
    country: { type: sql.VarChar(100), required: false },
    medical_history: { type: sql.Text, required: false }
  },

  // --- Relationships ---
  relationships: {
    appointments: { type: 'hasMany', model: 'Appointment', foreignKey: 'patient_id' },
    doctorDetails: { type: 'hasOne', model: 'DoctorDetails', foreignKey: 'doctor_id' }
  }
};

module.exports = UserSchema;
