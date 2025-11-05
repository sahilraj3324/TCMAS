/**
 * This file contains all Swagger/OpenAPI annotations for the Medical Management System API
 * These annotations are used by swagger-jsdoc to generate the API documentation
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: User already exists
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, doctor, patient, receptionist]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               contact_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/users/{id}/password:
 *   patch:
 *     summary: Update user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/users/count-by-role:
 *   get:
 *     summary: Get user count by role
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User count by role
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create patient details
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientDetails'
 *     responses:
 *       201:
 *         description: Patient details created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of all patients
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Search patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient details by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update patient details
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientDetails'
 *     responses:
 *       200:
 *         description: Patient details updated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete patient details
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient details deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create doctor details
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorDetails'
 *     responses:
 *       201:
 *         description: Doctor details created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all doctors
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/doctors/search:
 *   get:
 *     summary: Search doctors
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/doctors/specializations:
 *   get:
 *     summary: Get all specializations
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of specializations
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of all appointments
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments/upcoming:
 *   get:
 *     summary: Get upcoming appointments
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of upcoming appointments
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments/patient/{patientId}:
 *   get:
 *     summary: Get appointments by patient ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient's appointments
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get appointments by doctor ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor's appointments
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments/status/{status}:
 *   get:
 *     summary: Get appointments by status
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Appointments by status
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all prescriptions
 *     tags: [Prescriptions]
 *     responses:
 *       200:
 *         description: List of all prescriptions
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get prescriptions by patient ID
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient's prescriptions
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/prescriptions/doctor/{doctorId}:
 *   get:
 *     summary: Get prescriptions by doctor ID
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor's prescriptions
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Create a new medical record
 *     tags: [Medical Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalRecord'
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all medical records
 *     tags: [Medical Records]
 *     responses:
 *       200:
 *         description: List of all medical records
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/medical-records/patient/{patientId}:
 *   get:
 *     summary: Get medical records by patient ID
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient's medical records
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of all notifications
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/notifications/patient/{patientId}/unread:
 *   get:
 *     summary: Get unread notifications by patient ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unread notifications
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/notifications/{id}/seen:
 *   patch:
 *     summary: Mark notification as seen
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as seen
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

