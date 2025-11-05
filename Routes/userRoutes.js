const express = require('express');
const router = express.Router();
const {
  login,
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  getUserCountByRole
} = require('../Controller/userController');

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user in the system (user_id auto-generated if not provided)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Optional user ID (auto-generated UUID if not provided)
 *                 example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, patient, receptionist]
 *                 example: patient
 *               contact_number:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/', createUser);

// Get all users (with optional role filter)
router.get('/', getAllUsers);

// Get user count by role
router.get('/count-by-role', getUserCountByRole);

// Get user by ID
router.get('/:id', getUserById);

// Get user by email
router.get('/email/:email', getUserByEmail);

// Update user
router.put('/:id', updateUser);

// Update password
router.patch('/:id/password', updatePassword);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;

