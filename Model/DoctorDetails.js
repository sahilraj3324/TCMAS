const { sql } = require('../config/database');

// DoctorDetails Schema Definition (updated)
const DoctorDetailsSchema = {
  tableName: 'doctordetails',
  columns: {
    // Doctor ID must match users.user_id type
    doctor_id: { 
      type: sql.VarChar(50), 
      primaryKey: true, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Existing core fields
    specialization: { type: sql.VarChar(100), required: true },
    qualification: { type: sql.VarChar(100), required: true },
    experience_years: { type: sql.Int, required: true, min: 0 },

    // Newly added fields
    name: { type: sql.VarChar(100), required: true },
    city: { type: sql.VarChar(100), required: false },
    phone_number: { type: sql.VarChar(20), required: false },
    is_active: { type: sql.Bit, required: false, default: 1 },
    clinic_name: { type: sql.VarChar(150), required: false },
    clinic_address: { type: sql.VarChar(255), required: false },

    // 🔐 Authentication fields
    username: { type: sql.VarChar(100), required: true, unique: true },
    password: { type: sql.VarChar(255), required: true } // should store hashed passwords
  },

  relationships: {
    user: { type: 'belongsTo', model: 'User', foreignKey: 'doctor_id' },
    appointments: { type: 'hasMany', model: 'Appointment', foreignKey: 'doctor_id' },
    prescriptions: { type: 'hasMany', model: 'Prescription', through: 'Appointment' }
  }
};

module.exports = DoctorDetailsSchema;
