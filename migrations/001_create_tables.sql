-- Medical Management System Database Migration
-- Version: 001
-- Description: Create all required tables

-- =============================================
-- 1. USERS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'receptionist')),
        contact_number VARCHAR(20),
        created_at DATETIME DEFAULT GETDATE()
    );
    PRINT '✅ Table "users" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "users" already exists';
END
GO

-- =============================================
-- 2. PATIENT DETAILS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='patientdetails' AND xtype='U')
BEGIN
    CREATE TABLE patientdetails (
        patient_id INT PRIMARY KEY,
        gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
        date_of_birth DATE NOT NULL,
        blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        country VARCHAR(100) NOT NULL,
        medical_history TEXT,
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    PRINT '✅ Table "patientdetails" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "patientdetails" already exists';
END
GO

-- =============================================
-- 3. DOCTOR DETAILS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='doctordetails' AND xtype='U')
BEGIN
    CREATE TABLE doctordetails (
        doctor_id INT PRIMARY KEY,
        specialization VARCHAR(100) NOT NULL,
        qualification VARCHAR(100) NOT NULL,
        experience_years INT NOT NULL CHECK (experience_years >= 0),
        FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    PRINT '✅ Table "doctordetails" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "doctordetails" already exists';
END
GO

-- =============================================
-- 4. APPOINTMENTS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='appointments' AND xtype='U')
BEGIN
    CREATE TABLE appointments (
        appointment_id INT IDENTITY(1,1) PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
        remarks VARCHAR(255),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION,
        FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION
    );
    PRINT '✅ Table "appointments" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "appointments" already exists';
END
GO

-- =============================================
-- 5. PRESCRIPTIONS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='prescriptions' AND xtype='U')
BEGIN
    CREATE TABLE prescriptions (
        prescription_id INT IDENTITY(1,1) PRIMARY KEY,
        appointment_id INT NOT NULL,
        doctor_notes TEXT NOT NULL,
        medicines TEXT NOT NULL,
        pdf_link VARCHAR(255),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
    );
    PRINT '✅ Table "prescriptions" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "prescriptions" already exists';
END
GO

-- =============================================
-- 6. MEDICAL RECORDS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medicalrecords' AND xtype='U')
BEGIN
    CREATE TABLE medicalrecords (
        record_id INT IDENTITY(1,1) PRIMARY KEY,
        patient_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        upload_date DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    PRINT '✅ Table "medicalrecords" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "medicalrecords" already exists';
END
GO

-- =============================================
-- 7. NOTIFICATIONS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
BEGIN
    CREATE TABLE notifications (
        notification_id INT IDENTITY(1,1) PRIMARY KEY,
        appointment_id INT,
        patient_id INT NOT NULL,
        receptionist_id INT,
        message VARCHAR(255) NOT NULL,
        notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('appointment_confirmation', 'appointment_reminder', 'appointment_cancellation', 'prescription_ready', 'general')),
        created_at DATETIME DEFAULT GETDATE(),
        seen TINYINT DEFAULT 0,
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION,
        FOREIGN KEY (receptionist_id) REFERENCES users(user_id) ON DELETE NO ACTION
    );
    PRINT '✅ Table "notifications" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "notifications" already exists';
END
GO

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email')
BEGIN
    CREATE INDEX idx_users_email ON users(email);
    PRINT '✅ Index "idx_users_email" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_role')
BEGIN
    CREATE INDEX idx_users_role ON users(role);
    PRINT '✅ Index "idx_users_role" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_date')
BEGIN
    CREATE INDEX idx_appointments_date ON appointments(date);
    PRINT '✅ Index "idx_appointments_date" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_status')
BEGIN
    CREATE INDEX idx_appointments_status ON appointments(status);
    PRINT '✅ Index "idx_appointments_status" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_patient')
BEGIN
    CREATE INDEX idx_appointments_patient ON appointments(patient_id);
    PRINT '✅ Index "idx_appointments_patient" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_appointments_doctor')
BEGIN
    CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
    PRINT '✅ Index "idx_appointments_doctor" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notifications_patient')
BEGIN
    CREATE INDEX idx_notifications_patient ON notifications(patient_id);
    PRINT '✅ Index "idx_notifications_patient" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notifications_seen')
BEGIN
    CREATE INDEX idx_notifications_seen ON notifications(seen);
    PRINT '✅ Index "idx_notifications_seen" created';
END
GO

PRINT '';
PRINT '🎉 ====================================';
PRINT '🎉 DATABASE MIGRATION COMPLETED!';
PRINT '🎉 ====================================';
PRINT '';

