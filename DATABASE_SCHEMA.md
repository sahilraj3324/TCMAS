# Medical Management System - Database Schema

## Overview
This document describes the current database schema based on all model files.

---

## Tables

### 1. **users** (Unified User + Patient Table)
Primary table for all system users including patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | VARCHAR(50) | PRIMARY KEY | Unique user identifier (UUID) |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | User's email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | VARCHAR(50) | NOT NULL, CHECK | User role: admin, doctor, patient, receptionist |
| contact_number | VARCHAR(20) | NULL | Contact phone number |
| created_at | DATETIME | DEFAULT GETDATE() | Account creation timestamp |
| **Optional Patient Fields** |||
| gender | VARCHAR(10) | NULL, CHECK | Male, Female, Other |
| date_of_birth | DATE | NULL | Patient's date of birth |
| blood_group | VARCHAR(5) | NULL, CHECK | A+, A-, B+, B-, AB+, AB-, O+, O- |
| address_line1 | VARCHAR(255) | NULL | Primary address |
| address_line2 | VARCHAR(255) | NULL | Secondary address |
| city | VARCHAR(100) | NULL | City |
| state | VARCHAR(100) | NULL | State/Province |
| postal_code | VARCHAR(10) | NULL | ZIP/Postal code |
| country | VARCHAR(100) | NULL | Country |
| medical_history | TEXT | NULL | Patient medical history |

**Indexes:**
- idx_users_email (email)
- idx_users_role (role)

---

### 2. **patientdetails** (Simplified Patient Records)
Links patients to doctors and tracks their problems/complaints.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Unique record identifier |
| user_id | VARCHAR(50) | NOT NULL, FK → users | Patient user ID |
| doctor_id | VARCHAR(50) | NULL, FK → users | Assigned doctor ID |
| problem | TEXT | NOT NULL | Patient's chief complaint/problem |
| created_at | DATETIME | DEFAULT GETDATE() | Record creation time |

**Indexes:**
- idx_patientdetails_user_id (user_id)
- idx_patientdetails_doctor_id (doctor_id)

---

### 3. **doctordetails** (Enhanced Doctor Information)
Extended information for doctor users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| doctor_id | VARCHAR(50) | PRIMARY KEY, FK → users | Doctor user ID |
| name | VARCHAR(100) | NOT NULL | Doctor's full name |
| specialization | VARCHAR(100) | NOT NULL | Medical specialization |
| qualification | VARCHAR(100) | NOT NULL | Medical degrees/qualifications |
| experience_years | INT | NOT NULL, CHECK ≥ 0 | Years of experience |
| city | VARCHAR(100) | NULL | Practice city |
| phone_number | VARCHAR(20) | NULL | Contact number |
| is_active | BIT | DEFAULT 1 | Active status (1=active, 0=inactive) |
| clinic_name | VARCHAR(150) | NULL | Clinic/Hospital name |
| clinic_address | VARCHAR(255) | NULL | Clinic address |

**Indexes:**
- idx_doctordetails_specialization (specialization)
- idx_doctordetails_is_active (is_active)

---

### 4. **appointments**
Patient-Doctor appointment scheduling.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| appointment_id | INT | PRIMARY KEY, IDENTITY | Auto-increment ID |
| patient_id | VARCHAR(50) | NOT NULL, FK → users | Patient ID |
| doctor_id | VARCHAR(50) | NOT NULL, FK → users | Doctor ID |
| date | DATE | NOT NULL | Appointment date |
| time | TIME | NOT NULL | Appointment time |
| status | VARCHAR(50) | NOT NULL, CHECK, DEFAULT 'pending' | pending, confirmed, completed, cancelled |
| remarks | VARCHAR(255) | NULL | Additional notes |
| created_at | DATETIME | DEFAULT GETDATE() | Created timestamp |
| updated_at | DATETIME | DEFAULT GETDATE() | Last updated timestamp |

**Indexes:**
- idx_appointments_date (date)
- idx_appointments_status (status)
- idx_appointments_patient (patient_id)
- idx_appointments_doctor (doctor_id)

---

### 5. **prescriptions** (Enhanced with Problem Tracking)
Medical prescriptions issued by doctors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| prescription_id | VARCHAR(50) | PRIMARY KEY | Unique prescription ID (UUID) |
| appointment_id | INT | NOT NULL, FK → appointments | Related appointment |
| doctor_id | VARCHAR(50) | NOT NULL, FK → users | Prescribing doctor |
| patient_id | VARCHAR(50) | NOT NULL, FK → users | Patient receiving prescription |
| problem | VARCHAR(255) | NOT NULL | Diagnosed problem/condition |
| doctor_notes | TEXT | NOT NULL | Doctor's notes and instructions |
| medicines | TEXT | NOT NULL | Prescribed medications |
| pdf_link | VARCHAR(255) | NULL | Link to PDF prescription |
| created_at | DATETIME | DEFAULT GETDATE() | Creation timestamp |

**Indexes:**
- idx_prescriptions_appointment (appointment_id)
- idx_prescriptions_patient (patient_id)
- idx_prescriptions_doctor (doctor_id)

---

### 6. **medicalrecords** (Updated for Problem Tracking)
Patient medical records with status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| record_id | INT | PRIMARY KEY, IDENTITY | Auto-increment ID |
| patient_id | VARCHAR(50) | NOT NULL, FK → users | Patient ID |
| doctor_id | VARCHAR(50) | NULL, FK → users | Treating doctor |
| problem | VARCHAR(255) | NOT NULL | Medical issue/problem |
| status | VARCHAR(50) | NOT NULL, CHECK, DEFAULT 'Pending' | Pending, Ongoing, Resolved, Cancelled |
| description | VARCHAR(500) | NULL | Additional details/notes |
| upload_date | DATETIME | DEFAULT GETDATE() | Record creation date |

**Indexes:**
- idx_medicalrecords_patient (patient_id)
- idx_medicalrecords_doctor (doctor_id)
- idx_medicalrecords_status (status)

---

### 7. **notifications**
System notifications for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | INT | PRIMARY KEY, IDENTITY | Auto-increment ID |
| appointment_id | INT | NULL, FK → appointments | Related appointment |
| patient_id | VARCHAR(50) | NOT NULL, FK → users | Recipient patient |
| receptionist_id | VARCHAR(50) | NULL, FK → users | Sending receptionist |
| message | VARCHAR(255) | NOT NULL | Notification message |
| notification_type | VARCHAR(50) | NOT NULL, CHECK | appointment_confirmation, appointment_reminder, appointment_cancellation, prescription_ready, general |
| created_at | DATETIME | DEFAULT GETDATE() | Creation timestamp |
| seen | TINYINT | DEFAULT 0 | Read status (0=unread, 1=read) |

**Indexes:**
- idx_notifications_patient (patient_id)
- idx_notifications_seen (seen)
- idx_notifications_receptionist (receptionist_id)

---

### 8. **receptionist**
Receptionist staff information (separate from users table).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(50) | PRIMARY KEY | Unique receptionist ID (UUID) |
| name | VARCHAR(100) | NOT NULL | Full name |
| number | VARCHAR(20) | NOT NULL | Contact number |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Login username |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | DATETIME | DEFAULT GETDATE() | Account creation |
| updated_at | DATETIME | DEFAULT GETDATE() | Last update |

**Indexes:**
- idx_receptionist_username (username)
- idx_receptionist_email (email)

---

## Migration Instructions

### Option 1: Initial Setup (First Time)
```bash
npm run migrate
```

### Option 2: Update All Tables (⚠️ DESTRUCTIVE - Drops all data)
```bash
npm run migrate:all
```

### Option 3: Add Receptionist Table Only
Run migration file: `002_create_receptionist_table.sql`

---

## Key Changes from Original Schema

1. **users.user_id**: Changed from INT to VARCHAR(50) for UUID support
2. **users**: Merged patient fields directly into users table
3. **patientdetails**: Simplified to track only id, user_id, doctor_id, problem
4. **doctordetails**: Enhanced with name, city, phone, is_active, clinic info
5. **appointments**: Updated foreign keys to VARCHAR(50)
6. **prescriptions**: Added doctor_id, patient_id, problem fields; changed prescription_id to VARCHAR(50)
7. **medicalrecords**: Removed file fields; added doctor_id, problem, status
8. **notifications**: Updated foreign keys to VARCHAR(50)
9. **receptionist**: New standalone table for receptionist users

---

## API Endpoints

### Users
- POST /api/users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Patients
- POST /api/patients
- GET /api/patients
- GET /api/patients/:id
- PUT /api/patients/:id
- DELETE /api/patients/:id
- GET /api/patients/search?query=

### Doctors
- POST /api/doctors
- GET /api/doctors
- GET /api/doctors/:id
- PUT /api/doctors/:id
- DELETE /api/doctors/:id
- GET /api/doctors/specializations
- GET /api/doctors/specialization/:specialization
- GET /api/doctors/search?query=

### Appointments
- POST /api/appointments
- GET /api/appointments
- GET /api/appointments/:id
- PUT /api/appointments/:id
- PATCH /api/appointments/:id/status
- DELETE /api/appointments/:id
- GET /api/appointments/patient/:patientId
- GET /api/appointments/doctor/:doctorId
- GET /api/appointments/status/:status
- GET /api/appointments/upcoming

### Prescriptions
- POST /api/prescriptions
- GET /api/prescriptions
- GET /api/prescriptions/:id
- PUT /api/prescriptions/:id
- DELETE /api/prescriptions/:id
- GET /api/prescriptions/patient/:patientId
- GET /api/prescriptions/doctor/:doctorId

### Medical Records
- POST /api/medical-records
- GET /api/medical-records
- GET /api/medical-records/:id
- PUT /api/medical-records/:id
- DELETE /api/medical-records/:id
- GET /api/medical-records/patient/:patientId

### Notifications
- POST /api/notifications
- GET /api/notifications
- GET /api/notifications/:id
- PATCH /api/notifications/:id/seen
- DELETE /api/notifications/:id
- GET /api/notifications/patient/:patientId/unread

### Receptionist
- POST /api/receptionist/login
- POST /api/receptionist
- GET /api/receptionist
- GET /api/receptionist/:id
- PUT /api/receptionist/:id
- DELETE /api/receptionist/:id
- DELETE /api/receptionist (delete all)

---

## Server Information

**Server URL**: http://localhost:4000
**API Documentation**: http://localhost:4000/api-docs

---

*Last Updated: Based on Model folder schemas*

