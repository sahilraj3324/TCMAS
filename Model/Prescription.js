const { sql } = require('../config/database');

// Prescription Schema Definition (final)
const PrescriptionSchema = {
  tableName: 'prescriptions',
  columns: {
    // Unique string ID for the prescription
    prescription_id: { type: sql.VarChar(50), primaryKey: true, unique: true },

    // Linked appointment
    appointment_id: { 
      type: sql.Int, 
      required: true, 
      foreignKey: { table: 'appointments', column: 'appointment_id' } 
    },

    // Doctor issuing the prescription
    doctor_id: { 
      type: sql.VarChar(50), 
      required: true, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Patient receiving the prescription
    patient_id: { 
      type: sql.VarChar(50), 
      required: true, 
      foreignKey: { table: 'users', column: 'user_id' } 
    },

    // Diagnosis or issue being treated
    problem: { type: sql.VarChar(255), required: true },

    // Doctor's notes and prescribed medicines
    doctor_notes: { type: sql.Text, required: true },
    medicines: { type: sql.Text, required: true },

    // Optional PDF file link
    pdf_link: { type: sql.VarChar(255), required: false },

    // Record creation time
    created_at: { type: sql.DateTime, default: 'GETDATE()' }
  },
  relationships: {
    appointment: { type: 'belongsTo', model: 'Appointment', foreignKey: 'appointment_id' },
    doctor: { type: 'belongsTo', model: 'User', foreignKey: 'doctor_id' },
    patient: { type: 'belongsTo', model: 'User', foreignKey: 'patient_id' }
  }
};

module.exports = PrescriptionSchema;
