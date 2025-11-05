const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medical Management System API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Medical Management System with MS SQL Database',
      contact: {
        name: 'API Support',
        email: 'support@medicalmgmt.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.medicalmgmt.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Patients',
        description: 'Patient details and management'
      },
      {
        name: 'Doctors',
        description: 'Doctor details and management'
      },
      {
        name: 'Appointments',
        description: 'Appointment booking and management'
      },
      {
        name: 'Prescriptions',
        description: 'Medical prescriptions management'
      },
      {
        name: 'Medical Records',
        description: 'Patient medical records management'
      },
      {
        name: 'Notifications',
        description: 'System notifications management'
      },
      {
        name: 'Health',
        description: 'System health and status checks'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password', 'role'],
          properties: {
            user_id: {
              type: 'integer',
              description: 'Auto-generated user ID'
            },
            first_name: {
              type: 'string',
              maxLength: 100,
              example: 'John'
            },
            last_name: {
              type: 'string',
              maxLength: 100,
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 100,
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              maxLength: 255,
              example: 'securePassword123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'doctor', 'patient', 'receptionist'],
              example: 'patient'
            },
            contact_number: {
              type: 'string',
              maxLength: 20,
              example: '+1234567890'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PatientDetails: {
          type: 'object',
          required: ['patient_id', 'gender', 'date_of_birth', 'address_line1', 'city', 'state', 'postal_code', 'country'],
          properties: {
            patient_id: {
              type: 'integer',
              description: 'Reference to user_id'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              example: 'Male'
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              example: '1990-01-15'
            },
            blood_group: {
              type: 'string',
              enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
              example: 'O+'
            },
            address_line1: {
              type: 'string',
              maxLength: 255,
              example: '123 Main Street'
            },
            address_line2: {
              type: 'string',
              maxLength: 255,
              example: 'Apt 4B'
            },
            city: {
              type: 'string',
              maxLength: 100,
              example: 'New York'
            },
            state: {
              type: 'string',
              maxLength: 100,
              example: 'NY'
            },
            postal_code: {
              type: 'string',
              maxLength: 10,
              example: '10001'
            },
            country: {
              type: 'string',
              maxLength: 100,
              example: 'USA'
            },
            medical_history: {
              type: 'string',
              example: 'No known allergies. Previous surgery in 2018.'
            }
          }
        },
        DoctorDetails: {
          type: 'object',
          required: ['doctor_id', 'specialization', 'qualification', 'experience_years'],
          properties: {
            doctor_id: {
              type: 'integer',
              description: 'Reference to user_id'
            },
            specialization: {
              type: 'string',
              maxLength: 100,
              example: 'Cardiology'
            },
            qualification: {
              type: 'string',
              maxLength: 100,
              example: 'MD, FACC'
            },
            experience_years: {
              type: 'integer',
              minimum: 0,
              example: 10
            }
          }
        },
        Appointment: {
          type: 'object',
          required: ['patient_id', 'doctor_id', 'date', 'time'],
          properties: {
            appointment_id: {
              type: 'integer',
              description: 'Auto-generated appointment ID'
            },
            patient_id: {
              type: 'integer',
              example: 1
            },
            doctor_id: {
              type: 'integer',
              example: 2
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-12-25'
            },
            time: {
              type: 'string',
              format: 'time',
              example: '14:30:00'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
              default: 'pending',
              example: 'confirmed'
            },
            remarks: {
              type: 'string',
              maxLength: 255,
              example: 'Follow-up appointment'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Prescription: {
          type: 'object',
          required: ['appointment_id', 'doctor_notes', 'medicines'],
          properties: {
            prescription_id: {
              type: 'integer',
              description: 'Auto-generated prescription ID'
            },
            appointment_id: {
              type: 'integer',
              example: 1
            },
            doctor_notes: {
              type: 'string',
              example: 'Patient showing improvement. Continue medication for 2 more weeks.'
            },
            medicines: {
              type: 'string',
              example: 'Aspirin 100mg - Take 1 tablet daily after food\nVitamin D - Take 1 capsule weekly'
            },
            pdf_link: {
              type: 'string',
              maxLength: 255,
              example: 'https://storage.example.com/prescriptions/prescription_123.pdf'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        MedicalRecord: {
          type: 'object',
          required: ['patient_id', 'file_name', 'file_path'],
          properties: {
            record_id: {
              type: 'integer',
              description: 'Auto-generated record ID'
            },
            patient_id: {
              type: 'integer',
              example: 1
            },
            file_name: {
              type: 'string',
              maxLength: 255,
              example: 'blood_test_results.pdf'
            },
            file_path: {
              type: 'string',
              maxLength: 255,
              example: '/uploads/medical-records/patient_1/blood_test_results.pdf'
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Complete blood count test results from Dec 2024'
            },
            upload_date: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          required: ['patient_id', 'message', 'notification_type'],
          properties: {
            notification_id: {
              type: 'integer',
              description: 'Auto-generated notification ID'
            },
            appointment_id: {
              type: 'integer',
              example: 1
            },
            patient_id: {
              type: 'integer',
              example: 1
            },
            receptionist_id: {
              type: 'integer',
              example: 3
            },
            message: {
              type: 'string',
              maxLength: 255,
              example: 'Your appointment is confirmed for Dec 25, 2024 at 2:30 PM'
            },
            notification_type: {
              type: 'string',
              enum: ['appointment_confirmation', 'appointment_reminder', 'appointment_cancellation', 'prescription_ready', 'general'],
              example: 'appointment_confirmation'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            seen: {
              type: 'integer',
              enum: [0, 1],
              default: 0,
              example: 0
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./Routes/*.js', './index.js', './docs/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

