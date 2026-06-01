const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const medicalController = require('../controllers/medicalController');

// Get all medical records (filtered by role)
router.get('/records', authMiddleware, medicalController.getAllRecords);

// Get medical record by patient ID
router.get('/records/patient/:patientId', authMiddleware, medicalController.getRecordByPatientId);

// Create or update medical record (Doctor only)
router.post('/records', authMiddleware, roleMiddleware(['doctor']), medicalController.upsertMedicalRecord);

// Get medical history for a patient (Doctor only)
router.get('/history/:patientId', authMiddleware, roleMiddleware(['doctor']), medicalController.getMedicalHistory);

// Delete a medical record (Doctor only)
router.delete('/records/:id', authMiddleware, roleMiddleware(['doctor']), medicalController.deleteRecord);

// Export a patient's medical record as PDF (Doctor only)
router.get('/export/:patientId', authMiddleware, roleMiddleware(['doctor']), medicalController.exportPdf);

module.exports = router;