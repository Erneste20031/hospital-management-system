const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const appointmentController = require('../controllers/appointmentController');

// Get today's appointments for doctor (Doctor only)
// ⚠️ MUST be before /:id — otherwise "today" gets matched as an id param
router.get('/today/doctor', authMiddleware, roleMiddleware(['doctor']), appointmentController.getTodayAppointments);

// Get all appointments (filtered by role)
router.get('/', authMiddleware, appointmentController.getAllAppointments);

// Get single appointment
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);

// Create new appointment (Patient, Receptionist, Admin)
router.post('/', authMiddleware, appointmentController.createAppointment);

// Update appointment details like Date/Time (Reschedule)
router.put('/:id', authMiddleware, appointmentController.updateAppointment);

// Update appointment status (Doctor, Admin, Receptionist)
router.patch('/:id/status', authMiddleware, appointmentController.updateAppointmentStatus);

// Cancel appointment (Patient, Admin)
router.delete('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;