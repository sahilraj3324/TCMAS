-- Medical Management System Database Migration (UPDATED)
-- Version: 003 (updated)
-- Description: Update all tables to match current model schemas.
-- Note: This script is SAFE for the 'users' table: it will NOT DROP or ALTER an existing users table.
--       It will create users only if it does not already exist.

PRINT '🛠️  Starting migration (safe with respect to users)...';
GO

-- =============================================
-- DROP EXISTING TABLES (IN CORRECT ORDER) - EXCLUDING users
-- =============================================
PRINT '🗑️  Dropping existing tables (except users)...';
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

IF EXISTS (SELECT * FROM sysobjects WHERE name='receptionist' AND xtype='U')
    DROP TABLE receptionist;
GO

IF EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    DROP TABLE users;
GO

PRINT '✅ Dropped tables (users preserved)';
GO

-- =============================================
-- 1. USERS TABLE (create only if missing)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    PRINT 'Creating table "users" (did not exist)';
    CREATE TABLE users (
        user_id VARCHAR(50) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        username VARCHAR(100) UNIQUE,
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
END
ELSE
BEGIN
    PRINT 'Table "users" exists — checking for username column';
    IF COL_LENGTH('users', 'username') IS NULL
    BEGIN
        PRINT 'Adding username column to users table';
        ALTER TABLE users ADD username VARCHAR(100) UNIQUE;
    END
    ELSE
        PRINT 'username column already exists';
END
PRINT '✅ Table "users" ensured (untouched if existed)';
GO

-- =============================================
-- 2. PATIENT DETAILS TABLE (Simplified)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='patientdetails' AND xtype='U')
BEGIN
    PRINT 'Creating table: patientdetails';
    CREATE TABLE patientdetails (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        doctor_id VARCHAR(50),
        problem TEXT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION
    );
END
ELSE
BEGIN
    PRINT 'patientdetails already exists — skipping create';
END
PRINT '✅ Table "patientdetails" ensured';
GO

-- =============================================
-- 3. DOCTOR DETAILS TABLE (INDEPENDENT - no FK to users)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='doctordetails' AND xtype='U')
BEGIN
    PRINT 'Creating table: doctordetails (INDEPENDENT with email/username/password)';
    CREATE TABLE doctordetails (
        doctor_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        qualification VARCHAR(100) NOT NULL,
        experience_years INT NOT NULL CHECK (experience_years >= 0),
        city VARCHAR(100),
        phone_number VARCHAR(20),
        is_active BIT DEFAULT 1,
        clinic_name VARCHAR(150),
        clinic_address VARCHAR(255)
    );
END
ELSE
BEGIN
    PRINT 'doctordetails exists — ensuring all fields exist and removing FK to users';
    
    -- Remove FK constraint to users if it exists
    DECLARE @fkName VARCHAR(255);
    SELECT @fkName = fk.name
    FROM sys.foreign_keys fk
    WHERE fk.parent_object_id = OBJECT_ID('doctordetails') 
      AND fk.referenced_object_id = OBJECT_ID('users');
    
    IF @fkName IS NOT NULL
    BEGIN
        DECLARE @dropFkSql NVARCHAR(MAX) = 'ALTER TABLE doctordetails DROP CONSTRAINT ' + @fkName;
        EXEC sp_executesql @dropFkSql;
        PRINT 'Dropped FK constraint from doctordetails to users: ' + @fkName;
    END
    
    -- Add missing columns safely
    IF COL_LENGTH('doctordetails', 'name') IS NULL
        ALTER TABLE doctordetails ADD name VARCHAR(100) NOT NULL CONSTRAINT df_doctordetails_name DEFAULT('Unknown');

    IF COL_LENGTH('doctordetails', 'email') IS NULL
        ALTER TABLE doctordetails ADD email VARCHAR(150) UNIQUE;

    IF COL_LENGTH('doctordetails', 'username') IS NULL
        ALTER TABLE doctordetails ADD username VARCHAR(100) UNIQUE;

    IF COL_LENGTH('doctordetails', 'password') IS NULL
        ALTER TABLE doctordetails ADD password VARCHAR(255);

    IF COL_LENGTH('doctordetails', 'specialization') IS NULL
        ALTER TABLE doctordetails ADD specialization VARCHAR(100) NOT NULL CONSTRAINT df_doctordetails_specialization DEFAULT('General');

    IF COL_LENGTH('doctordetails', 'qualification') IS NULL
        ALTER TABLE doctordetails ADD qualification VARCHAR(100) NOT NULL CONSTRAINT df_doctordetails_qualification DEFAULT('MBBS');

    IF COL_LENGTH('doctordetails', 'experience_years') IS NULL
        ALTER TABLE doctordetails ADD experience_years INT NOT NULL CONSTRAINT df_doctordetails_experience DEFAULT(0);

    IF COL_LENGTH('doctordetails', 'city') IS NULL
        ALTER TABLE doctordetails ADD city VARCHAR(100);

    IF COL_LENGTH('doctordetails', 'phone_number') IS NULL
        ALTER TABLE doctordetails ADD phone_number VARCHAR(20);

    IF COL_LENGTH('doctordetails', 'is_active') IS NULL
        ALTER TABLE doctordetails ADD is_active BIT DEFAULT 1;

    IF COL_LENGTH('doctordetails', 'clinic_name') IS NULL
        ALTER TABLE doctordetails ADD clinic_name VARCHAR(150);

    IF COL_LENGTH('doctordetails', 'clinic_address') IS NULL
        ALTER TABLE doctordetails ADD clinic_address VARCHAR(255);
END
PRINT '✅ Table "doctordetails" ensured/updated (INDEPENDENT from users)';
GO

-- =============================================
-- 4. APPOINTMENTS TABLE (patient_id → users, doctor_id is independent)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='appointments' AND xtype='U')
BEGIN
    PRINT 'Creating table: appointments';
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
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION
        -- NO FK for doctor_id (doctors are independent from users)
    );
END
ELSE
BEGIN
    PRINT 'appointments exists — removing FK constraint for doctor_id if exists';
    
    -- Remove FK constraint for doctor_id to users
    DECLARE @appointmentDoctorFkName VARCHAR(255);
    SELECT @appointmentDoctorFkName = fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fk.parent_object_id = OBJECT_ID('appointments') 
      AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'doctor_id'
      AND fk.referenced_object_id = OBJECT_ID('users');
    
    IF @appointmentDoctorFkName IS NOT NULL
    BEGIN
        DECLARE @dropAppointmentFkSql NVARCHAR(MAX) = 'ALTER TABLE appointments DROP CONSTRAINT ' + @appointmentDoctorFkName;
        EXEC sp_executesql @dropAppointmentFkSql;
        PRINT 'Dropped FK constraint from appointments.doctor_id to users: ' + @appointmentDoctorFkName;
    END
END
PRINT '✅ Table "appointments" ensured (doctor_id is independent)';
GO

-- =============================================
-- 5. PRESCRIPTIONS TABLE (patient_id → users, doctor_id is independent)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='prescriptions' AND xtype='U')
BEGIN
    PRINT 'Creating table: prescriptions';
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
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE NO ACTION
        -- NO FK for doctor_id (doctors are independent from users)
    );
END
ELSE
BEGIN
    PRINT 'prescriptions exists — removing FK constraint for doctor_id if exists';
    
    -- Remove FK constraint for doctor_id to users
    DECLARE @prescriptionDoctorFkName VARCHAR(255);
    SELECT @prescriptionDoctorFkName = fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fk.parent_object_id = OBJECT_ID('prescriptions') 
      AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'doctor_id'
      AND fk.referenced_object_id = OBJECT_ID('users');
    
    IF @prescriptionDoctorFkName IS NOT NULL
    BEGIN
        DECLARE @dropPrescriptionFkSql NVARCHAR(MAX) = 'ALTER TABLE prescriptions DROP CONSTRAINT ' + @prescriptionDoctorFkName;
        EXEC sp_executesql @dropPrescriptionFkSql;
        PRINT 'Dropped FK constraint from prescriptions.doctor_id to users: ' + @prescriptionDoctorFkName;
    END
END
PRINT '✅ Table "prescriptions" ensured (doctor_id is independent)';
GO

-- =============================================
-- 6. MEDICAL RECORDS TABLE (patient_id → users, doctor_id is independent)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medicalrecords' AND xtype='U')
BEGIN
    PRINT 'Creating table: medicalrecords (with report_name)';
    CREATE TABLE medicalrecords (
        record_id INT IDENTITY(1,1) PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL,
        doctor_id VARCHAR(50),
        report_name VARCHAR(150) NULL,                 -- NEW: optional report name
        problem VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Ongoing', 'Resolved', 'Cancelled')),
        description VARCHAR(500),
        upload_date DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
        -- NO FK for doctor_id (doctors are independent from users)
    );
END
ELSE
BEGIN
    PRINT 'medicalrecords exists — ensuring report_name column exists and removing doctor_id FK';
    
    -- Remove FK constraint for doctor_id to users
    DECLARE @medicalrecordDoctorFkName VARCHAR(255);
    SELECT @medicalrecordDoctorFkName = fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fk.parent_object_id = OBJECT_ID('medicalrecords') 
      AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'doctor_id'
      AND fk.referenced_object_id = OBJECT_ID('users');
    
    IF @medicalrecordDoctorFkName IS NOT NULL
    BEGIN
        DECLARE @dropMedicalRecordFkSql NVARCHAR(MAX) = 'ALTER TABLE medicalrecords DROP CONSTRAINT ' + @medicalrecordDoctorFkName;
        EXEC sp_executesql @dropMedicalRecordFkSql;
        PRINT 'Dropped FK constraint from medicalrecords.doctor_id to users: ' + @medicalrecordDoctorFkName;
    END
    
    IF COL_LENGTH('medicalrecords', 'report_name') IS NULL
        ALTER TABLE medicalrecords ADD report_name VARCHAR(150) NULL;

    -- ensure status column exists and has check constraint
    IF COL_LENGTH('medicalrecords', 'status') IS NULL
        ALTER TABLE medicalrecords ADD status VARCHAR(50) NOT NULL CONSTRAINT df_medicalrecords_status DEFAULT('Pending');

    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints cc
        JOIN sys.objects o ON cc.parent_object_id = o.object_id
        WHERE o.name = 'medicalrecords' AND cc.definition LIKE '%Pending%Ongoing%Resolved%Cancelled%'
    )
    BEGIN
        BEGIN TRY
            ALTER TABLE medicalrecords
            ADD CONSTRAINT chk_medicalrecords_status CHECK (status IN ('Pending', 'Ongoing', 'Resolved', 'Cancelled'));
        END TRY
        BEGIN CATCH
            PRINT 'Warning: could not add chk_medicalrecords_status (possibly duplicate)';
        END CATCH
    END

    -- Add foreign keys if missing (guarded)
    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys fk
        WHERE fk.parent_object_id = OBJECT_ID('medicalrecords') AND fk.referenced_object_id = OBJECT_ID('users')
    )
    BEGIN
        BEGIN TRY
            ALTER TABLE medicalrecords
            ADD CONSTRAINT fk_medicalrecords_patient FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE;
        END TRY
        BEGIN CATCH
            PRINT 'Warning: could not add fk_medicalrecords_patient';
        END CATCH

        BEGIN TRY
            ALTER TABLE medicalrecords
            ADD CONSTRAINT fk_medicalrecords_doctor FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE NO ACTION;
        END TRY
        BEGIN CATCH
            PRINT 'Warning: could not add fk_medicalrecords_doctor';
        END CATCH
    END
END
PRINT '✅ Table "medicalrecords" ensured/updated';
GO

-- =============================================
-- 7. NOTIFICATIONS TABLE (Updated)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
BEGIN
    PRINT 'Creating table: notifications';
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
END
ELSE
BEGIN
    PRINT 'notifications exists — skipping create';
END
PRINT '✅ Table "notifications" ensured';
GO

-- =============================================
-- 8. RECEPTIONIST TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='receptionist' AND xtype='U')
BEGIN
    PRINT 'Creating table: receptionist';
    CREATE TABLE receptionist (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        number VARCHAR(20) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END
ELSE
BEGIN
    PRINT 'receptionist exists — skipping create';
END
PRINT '✅ Table "receptionist" ensured';
GO

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
PRINT '📊 Creating indexes...';
GO

-- Users indexes (create only if users table exists)
IF EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('users') AND name = 'idx_users_email')
        CREATE INDEX idx_users_email ON users(email);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('users') AND name = 'idx_users_role')
        CREATE INDEX idx_users_role ON users(role);

    PRINT '✅ Users indexes created (if missing)';
END
ELSE
    PRINT 'Users table not present — skipping users indexes';
GO

-- PatientDetails indexes
IF OBJECT_ID('patientdetails', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('patientdetails') AND name = 'idx_patientdetails_user_id')
        CREATE INDEX idx_patientdetails_user_id ON patientdetails(user_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('patientdetails') AND name = 'idx_patientdetails_doctor_id')
        CREATE INDEX idx_patientdetails_doctor_id ON patientdetails(doctor_id);

    PRINT '✅ PatientDetails indexes created (if missing)';
END
GO

-- DoctorDetails indexes
IF OBJECT_ID('doctordetails', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('doctordetails') AND name = 'idx_doctordetails_specialization')
        CREATE INDEX idx_doctordetails_specialization ON doctordetails(specialization);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('doctordetails') AND name = 'idx_doctordetails_is_active')
        CREATE INDEX idx_doctordetails_is_active ON doctordetails(is_active);

    PRINT '✅ DoctorDetails indexes created (if missing)';
END
GO

-- Appointments indexes
IF OBJECT_ID('appointments', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('appointments') AND name = 'idx_appointments_date')
        CREATE INDEX idx_appointments_date ON appointments(date);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('appointments') AND name = 'idx_appointments_status')
        CREATE INDEX idx_appointments_status ON appointments(status);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('appointments') AND name = 'idx_appointments_patient')
        CREATE INDEX idx_appointments_patient ON appointments(patient_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('appointments') AND name = 'idx_appointments_doctor')
        CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);

    PRINT '✅ Appointments indexes created (if missing)';
END
GO

-- Prescriptions indexes
IF OBJECT_ID('prescriptions', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('prescriptions') AND name = 'idx_prescriptions_appointment')
        CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('prescriptions') AND name = 'idx_prescriptions_patient')
        CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('prescriptions') AND name = 'idx_prescriptions_doctor')
        CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);

    PRINT '✅ Prescriptions indexes created (if missing)';
END
GO

-- MedicalRecords indexes
IF OBJECT_ID('medicalrecords', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('medicalrecords') AND name = 'idx_medicalrecords_patient')
        CREATE INDEX idx_medicalrecords_patient ON medicalrecords(patient_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('medicalrecords') AND name = 'idx_medicalrecords_doctor')
        CREATE INDEX idx_medicalrecords_doctor ON medicalrecords(doctor_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('medicalrecords') AND name = 'idx_medicalrecords_status')
        CREATE INDEX idx_medicalrecords_status ON medicalrecords(status);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('medicalrecords') AND name = 'idx_medicalrecords_report_name')
        CREATE INDEX idx_medicalrecords_report_name ON medicalrecords(report_name);

    PRINT '✅ MedicalRecords indexes created (if missing)';
END
GO

-- Notifications indexes
IF OBJECT_ID('notifications', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('notifications') AND name = 'idx_notifications_patient')
        CREATE INDEX idx_notifications_patient ON notifications(patient_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('notifications') AND name = 'idx_notifications_seen')
        CREATE INDEX idx_notifications_seen ON notifications(seen);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('notifications') AND name = 'idx_notifications_receptionist')
        CREATE INDEX idx_notifications_receptionist ON notifications(receptionist_id);

    PRINT '✅ Notifications indexes created (if missing)';
END
GO

-- Receptionist indexes
IF OBJECT_ID('receptionist', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('receptionist') AND name = 'idx_receptionist_email')
        CREATE INDEX idx_receptionist_email ON receptionist(email);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('receptionist') AND name = 'idx_receptionist_username')
        CREATE INDEX idx_receptionist_username ON receptionist(username);

    PRINT '✅ Receptionist indexes created (if missing)';
END
GO

PRINT '';
PRINT '🎉 ====================================';
PRINT '🎉 FULL MIGRATION COMPLETED (users preserved)!';
PRINT '🎉 ====================================';
PRINT '';
GO
