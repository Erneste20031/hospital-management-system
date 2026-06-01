const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const documentController = require('../controllers/documentController');

// Get my documents (Patient only)
router.get('/my-documents', authMiddleware, roleMiddleware(['patient']), documentController.getMyDocuments);

// Get all documents (Admin only)
router.get('/all', authMiddleware, roleMiddleware(['admin']), documentController.getAllDocuments);

// Upload document (Doctor or Admin)
router.post('/upload', authMiddleware, roleMiddleware(['doctor', 'admin']), documentController.uploadDocument);

// Delete document (Doctor or Admin)
router.delete('/:id', authMiddleware, roleMiddleware(['doctor', 'admin']), documentController.deleteDocument);

module.exports = router;