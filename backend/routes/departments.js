const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const departmentController = require('../controllers/departmentController');

// Get all departments (All authenticated users)
router.get('/', authMiddleware, departmentController.getAllDepartments);

// Get single department
router.get('/:id', authMiddleware, departmentController.getDepartmentById);

// Create new department (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), departmentController.createDepartment);

// Update department (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), departmentController.updateDepartment);

// Update department stats (Admin only)
router.patch('/:id/stats', authMiddleware, roleMiddleware(['admin']), departmentController.updateDepartmentStats);

// Delete department (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), departmentController.deleteDepartment);

module.exports = router;