-- Receptionist Table Migration
-- Version: 002
-- Description: Create receptionist table

-- =============================================
-- RECEPTIONIST TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='receptionist' AND xtype='U')
BEGIN
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
    PRINT '✅ Table "receptionist" created successfully';
END
ELSE
BEGIN
    PRINT '⚠️  Table "receptionist" already exists';
END
GO

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_receptionist_username')
BEGIN
    CREATE INDEX idx_receptionist_username ON receptionist(username);
    PRINT '✅ Index "idx_receptionist_username" created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_receptionist_email')
BEGIN
    CREATE INDEX idx_receptionist_email ON receptionist(email);
    PRINT '✅ Index "idx_receptionist_email" created';
END
GO

PRINT '';
PRINT '🎉 ====================================';
PRINT '🎉 RECEPTIONIST TABLE MIGRATION COMPLETED!';
PRINT '🎉 ====================================';
PRINT '';

