const db = require('../config/db');

const Department = {
    // Get all departments
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM departments ORDER BY name');
        return rows;
    },
    
    // Get department by ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM departments WHERE id = ?', [id]);
        return rows[0];
    },
    
    // Create new department
    create: async (departmentData) => {
        const { name, icon, color, bg_color, description, head, doctors, patients, beds, available, status } = departmentData;
        const [result] = await db.query(
            'INSERT INTO departments (name, icon, color, bg_color, description, head, doctors, patients, beds, available, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, icon, color, bg_color, description, head, doctors || 0, patients || 0, beds || 0, available || 0, status || 'Active']
        );
        return result.insertId;
    },
    
    // Update department
    update: async (id, departmentData) => {
        const { name, icon, color, bg_color, description, head, doctors, patients, beds, available, status } = departmentData;
        const [result] = await db.query(
            'UPDATE departments SET name = ?, icon = ?, color = ?, bg_color = ?, description = ?, head = ?, doctors = ?, patients = ?, beds = ?, available = ?, status = ? WHERE id = ?',
            [name, icon, color, bg_color, description, head, doctors, patients, beds, available, status, id]
        );
        return result.affectedRows;
    },
    
    // Delete department
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM departments WHERE id = ?', [id]);
        return result.affectedRows;
    },
    
    // Update department stats (doctors, patients, beds)
    updateStats: async (id, stats) => {
        const { doctors, patients, beds, available } = stats;
        const [result] = await db.query(
            'UPDATE departments SET doctors = ?, patients = ?, beds = ?, available = ? WHERE id = ?',
            [doctors, patients, beds, available, id]
        );
        return result.affectedRows;
    },
    
    // Get department by name
    getByName: async (name) => {
        const [rows] = await db.query('SELECT * FROM departments WHERE name = ?', [name]);
        return rows[0];
    }
};

module.exports = Department;