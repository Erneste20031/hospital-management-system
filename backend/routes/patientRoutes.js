const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Search — MUST come before /:id
router.get('/search', authMiddleware, roleMiddleware(['admin', 'receptionist', 'doctor']), patientController.searchPatients);

// Get all patients
router.get('/', authMiddleware, roleMiddleware(['admin', 'receptionist', 'doctor']), patientController.getAllPatients);

// Get single patient
router.get('/:id', authMiddleware, patientController.getPatientById);

// Register new patient
router.post('/', authMiddleware, roleMiddleware(['admin', 'receptionist']), patientController.registerPatient);

// Update patient
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'receptionist']), patientController.updatePatient);

// Delete patient
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), patientController.deletePatient);

module.exports = router;
