const Department = require('../models/Department');

// Predefined color map for common departments
const colorMap = {
    'Cardiology': '#dc2626',
    'Pediatrics': '#0891b2',
    'Neurology': '#7c3aed',
    'Orthopedics': '#16a34a',
    'Emergency': '#dc2626',
    'Radiology': '#d97706',
    'Gynecology': '#db2777',
    'Surgery': '#2563eb',
    'Dermatology': '#d97706',
    'Ophthalmology': '#0369a1',
    'Psychiatry': '#8b5cf6',
    'Urology': '#0d9488',
    'ENT': '#059669',
    'Dentistry': '#c2410c',
    'Oncology': '#7e22ce',
    'Nephrology': '#0891b2',
    'Gastroenterology': '#ea580c',
    'Pulmonology': '#0284c7',
    'Endocrinology': '#9333ea',
    'Hematology': '#dc2626'
};

// Function to generate color based on department name
const getDepartmentColor = (name) => {
    // Check if department has predefined color
    if (colorMap[name]) {
        return colorMap[name];
    }
    
    // Generate a random but consistent color based on name
    const colors = [
        '#3D4DB7', '#7c3aed', '#0891b2', '#059669', 
        '#dc2626', '#d97706', '#db2777', '#2563eb',
        '#0d9488', '#ea580c', '#9333ea', '#0284c7'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
};

const departmentController = {
    // Get all departments
    getAllDepartments: async (req, res) => {
        try {
            const departments = await Department.getAll();
            res.json(departments);
        } catch (error) {
            console.error('Get departments error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get single department
    getDepartmentById: async (req, res) => {
        try {
            const department = await Department.getById(req.params.id);
            if (!department) {
                return res.status(404).json({ message: 'Department not found' });
            }
            res.json(department);
        } catch (error) {
            console.error('Get department error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Create new department (with auto-color generation)
    createDepartment: async (req, res) => {
        try {
            let { name, icon, head, doctors, patients, beds, available, status, description } = req.body;
            
            // Auto-generate color based on department name
            const color = getDepartmentColor(name);
            const bg_color = `${color}18`; // 18 = 10% opacity in hex
            
            // Check if department exists
            const existing = await Department.getByName(name);
            if (existing) {
                return res.status(400).json({ message: 'Department already exists' });
            }
            
            const departmentId = await Department.create({
                name, 
                icon: icon || '🏥', 
                color, 
                bg_color, 
                head: head || null,
                doctors: doctors || 0,
                patients: patients || 0,
                beds: beds || 0,
                available: available || 0,
                status: status || 'Active',
                description: description || null
            });
            
            res.json({
                success: true,
                message: 'Department created successfully',
                departmentId,
                department: {
                    id: departmentId,
                    name,
                    icon,
                    color,
                    bg_color
                }
            });
        } catch (error) {
            console.error('Create department error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Update department
    updateDepartment: async (req, res) => {
        try {
            const { name, icon, head, doctors, patients, beds, available, status, description } = req.body;
            
            // Get existing department to preserve original color or generate new one if name changed
            const existingDept = await Department.getById(req.params.id);
            let color = existingDept?.color;
            let bg_color = existingDept?.bg_color;
            
            // If name changed, generate new color
            if (existingDept && existingDept.name !== name) {
                color = getDepartmentColor(name);
                bg_color = `${color}18`;
            }
            
            const updated = await Department.update(req.params.id, {
                name, 
                icon, 
                color, 
                bg_color, 
                head,
                doctors: doctors || 0,
                patients: patients || 0,
                beds: beds || 0,
                available: available || 0,
                status,
                description
            });
            
            if (updated === 0) {
                return res.status(404).json({ message: 'Department not found' });
            }
            
            res.json({ success: true, message: 'Department updated successfully' });
        } catch (error) {
            console.error('Update department error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Delete department
    deleteDepartment: async (req, res) => {
        try {
            const deleted = await Department.delete(req.params.id);
            if (deleted === 0) {
                return res.status(404).json({ message: 'Department not found' });
            }
            res.json({ success: true, message: 'Department deleted successfully' });
        } catch (error) {
            console.error('Delete department error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Update department stats
    updateDepartmentStats: async (req, res) => {
        try {
            const { doctors, patients, beds, available } = req.body;
            const updated = await Department.updateStats(req.params.id, { doctors, patients, beds, available });
            
            if (updated === 0) {
                return res.status(404).json({ message: 'Department not found' });
            }
            
            res.json({ success: true, message: 'Department stats updated' });
        } catch (error) {
            console.error('Update stats error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = departmentController;