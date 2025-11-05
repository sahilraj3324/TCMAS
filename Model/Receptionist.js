const { sql } = require('../config/database');

// Receptionist Schema Definition
const ReceptionistSchema = {
  tableName: 'receptionist',
  columns: {
    id: { 
      type: sql.VarChar(50), 
      primaryKey: true 
    },
    name: { 
      type: sql.VarChar(100), 
      required: true 
    },
    number: { 
      type: sql.VarChar(20), 
      required: true 
    },
    username: { 
      type: sql.VarChar(100), 
      required: true, 
      unique: true 
    },
    email: { 
      type: sql.VarChar(100), 
      required: true, 
      unique: true 
    },
    password: { 
      type: sql.VarChar(255), 
      required: true 
    },
    created_at: { 
      type: sql.DateTime, 
      default: 'GETDATE()' 
    },
    updated_at: { 
      type: sql.DateTime, 
      default: 'GETDATE()' 
    }
  },
  relationships: {
    notifications: { 
      type: 'hasMany', 
      model: 'Notification', 
      foreignKey: 'receptionist_id' 
    }
  }
};

module.exports = ReceptionistSchema;

