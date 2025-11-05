-- Medical Management System Database Migration
-- Version: 003
-- Description: Update all tables to match current model schemas

-- =============================================
-- DROP EXISTING TABLES (IN CORRECT ORDER)
-- =============================================
PRINT '🗑️  Dropping existing tables...';
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
    DROP TABLE notifications;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='prescriptions' AND xtype='U')
    DROP TABLE prescriptions;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='medicalrecords' AND xtype='U')
    DROP TABLE medicalrecords;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='appointments' AND xtype='U')
    DROP TABLE appointments;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='patientdetails' AND xtype='U')
    DROP TABLE patientdetails;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='doctordetails' AND xtype='U')
    DROP TABLE doctordetails;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    DROP TABLE users;
GO

PRINT '✅ Existing tables dropped';
GO

-- =============================================
-- 1. USERS TABLE (Unified with Patient fields)
-- =============================================
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'receptionist')),
    contact_number VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    
    -- Optional Patient Fields
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100),
    medical_history TEXT
);
PRINT '✅ Table "users" created';
GO

-- =============================================
-- 2. PATIENT DETAILS TABLE (Simplified)
-- =============================================
CREATE TABLE patientdetails (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50),
    problem TEXT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION
);
PRINT '✅ Table "patientdetails" created';
GO

-- =============================================
-- 3. DOCTOR DETAILS TABLE (Enhanced)
-- =============================================
CREATE TABLE doctordetails (
    doctor_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL CHECK (experience_years >= 0),
    city VARCHAR(100),
    phone_number VARCHAR(20),
    is_active BIT DEFAULT 1,
    clinic_name VARCHAR(150),
    clinic_address VARCHAR(255),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE
);
PRINT '✅ Table "doctordetails" created';
GO

-- =============================================
-- 4. APPOINTMENTS TABLE
-- =============================================
CREATE TABLE appointments (
    appointment_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    remarks VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION
);
PRINT '✅ Table "appointments" created';
GO

-- =============================================
-- 5. PRESCRIPTIONS TABLE (Enhanced)
-- =============================================
CREATE TABLE prescriptions (
    prescription_id VARCHAR(50) PRIMARY KEY,
    appointment_id INT NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    problem VARCHAR(255) NOT NULL,
    doctor_notes TEXT NOT NULL,
    medicines TEXT NOT NULL,
    pdf_link VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION
);
PRINT '✅ Table "prescriptions" created';
GO

-- =============================================
-- 6. MEDICAL RECORDS TABLE (Updated)
-- =============================================
CREATE TABLE medicalrecords (
    record_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50),
    problem VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Ongoing', 'Resolved', 'Cancelled')),
    description VARCHAR(500),
    upload_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION
);
PRINT '✅ Table "medicalrecords" created';
GO

-- =============================================
-- 7. NOTIFICATIONS TABLE (Updated)
-- =============================================
CREATE TABLE notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    appointment_id INT,
    patient_id VARCHAR(50) NOT NULL,
    receptionist_id VARCHAR(50),
    message VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('appointment_confirmation', 'appointment_reminder', 'appointment_cancellation', 'prescription_ready', 'general')),
    created_at DATETIME DEFAULT GETDATE(),
    seen TINYINT DEFAULT 0,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (receptionist_id) REFERENCES users(user_id) ON DELETE NO ACTION
);
PRINT '✅ Table "notifications" created';
GO

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
PRINT '📊 Creating indexes...';
GO

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
PRINT '✅ Users indexes created';
GO

-- PatientDetails indexes
CREATE INDEX idx_patientdetails_user_id ON patientdetails(user_id);
CREATE INDEX idx_patientdetails_doctor_id ON patientdetails(doctor_id);
PRINT '✅ PatientDetails indexes created';
GO

-- DoctorDetails indexes
CREATE INDEX idx_doctordetails_specialization ON doctordetails(specialization);
CREATE INDEX idx_doctordetails_is_active ON doctordetails(is_active);
PRINT '✅ DoctorDetails indexes created';
GO

-- Appointments indexes
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
PRINT '✅ Appointments indexes created';
GO

-- Prescriptions indexes
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
PRINT '✅ Prescriptions indexes created';
GO

-- MedicalRecords indexes
CREATE INDEX idx_medicalrecords_patient ON medicalrecords(patient_id);
CREATE INDEX idx_medicalrecords_doctor ON medicalrecords(doctor_id);
CREATE INDEX idx_medicalrecords_status ON medicalrecords(status);
PRINT '✅ MedicalRecords indexes created';
GO

-- Notifications indexes
CREATE INDEX idx_notifications_patient ON notifications(patient_id);
CREATE INDEX idx_notifications_seen ON notifications(seen);
CREATE INDEX idx_notifications_receptionist ON notifications(receptionist_id);
PRINT '✅ Notifications indexes created';
GO

PRINT '';
PRINT '🎉 ====================================';
PRINT '🎉 ALL TABLES MIGRATION COMPLETED!';
PRINT '🎉 ====================================';
PRINT '';

