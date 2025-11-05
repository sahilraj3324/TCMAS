const express = require('express');
const router = express.Router();
const {
  login,
  createReceptionist,
  getReceptionistById,
  getAllReceptionists,
  updateReceptionist,
  deleteReceptionistById,
  deleteAllReceptionists
} = require('../Controller/receptionistController');

// Login
router.post('/login', login);

// Create receptionist
router.post('/', createReceptionist);

// Get all receptionists
router.get('/', getAllReceptionists);

// Get receptionist by ID
router.get('/:id', getReceptionistById);

// Update receptionist (all fields)
router.put('/:id', updateReceptionist);

// Delete receptionist by ID
router.delete('/:id', deleteReceptionistById);

// Delete all receptionists
router.delete('/', deleteAllReceptionists);

module.exports = router;

