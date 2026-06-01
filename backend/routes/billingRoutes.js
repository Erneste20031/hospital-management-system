const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const billingController = require('../controllers/billingController');

// Get all bills (filtered by role)
router.get('/', authMiddleware, billingController.getAllBills);

// Get my bills (Patient only)
router.get('/my-bills', authMiddleware, roleMiddleware(['patient']), billingController.getMyBills);

// Get bill by number
router.get('/:billNumber', authMiddleware, billingController.getBillByNumber);

// Create new bill (Admin, Receptionist)
router.post('/', authMiddleware, roleMiddleware(['admin', 'receptionist']), billingController.createBill);

// Process payment (Patient, Admin, Receptionist)
router.post('/pay/:billNumber', authMiddleware, billingController.processPayment);

// Get revenue summary (Admin only)
router.get('/summary/revenue', authMiddleware, roleMiddleware(['admin']), billingController.getRevenueSummary);

module.exports = router;