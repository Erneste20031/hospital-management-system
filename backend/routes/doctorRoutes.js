const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const doctorController = require('../controllers/doctorController');

// IMPORTANT: specific paths BEFORE /:id to avoid being swallowed
router.get('/available/all',          authMiddleware, doctorController.getAvailableDoctors);
router.get('/department/:department', authMiddleware, doctorController.getDoctorsByDepartment);

// Generic CRUD
router.get('/',          authMiddleware,                          doctorController.getAllDoctors);
router.get('/:id',       authMiddleware,                          doctorController.getDoctorById);
router.post('/',         authMiddleware, roleMiddleware(['admin']), doctorController.addDoctor);
router.put('/:id',       authMiddleware, roleMiddleware(['admin']), doctorController.updateDoctor);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'doctor']), doctorController.updateDoctorStatus);
router.delete('/:id',    authMiddleware, roleMiddleware(['admin']), doctorController.deleteDoctor);

module.exports = router;
