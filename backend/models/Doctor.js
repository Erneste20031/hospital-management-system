const db = require('../config/db');

const Doctor = {
    // Get all doctors with user details
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT d.*, u.name, u.email, u.avatar 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            ORDER BY d.id
        `);
        return rows;
    },
    
    // Get doctor by ID
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT d.*, u.name, u.email, u.avatar 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE d.id = ?
        `, [id]);
        return rows[0];
    },
    
    // Get doctor by user_id
    getByUserId: async (userId) => {
        const [rows] = await db.query('SELECT * FROM doctors WHERE user_id = ?', [userId]);
        return rows[0];
    },
    
    // Create doctor
    create: async (doctorData) => {
        const { user_id, specialization, qualification, experience, phone, department, status, rating } = doctorData;
        const [result] = await db.query(`
            INSERT INTO doctors (user_id, specialization, qualification, experience, phone, department, status, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [user_id, specialization, qualification, experience, phone, department, status || 'Available', rating || 4.5]);
        return result.insertId;
    },
    
    // Update doctor
    update: async (id, doctorData) => {
        const { specialization, qualification, experience, phone, department, status, rating } = doctorData;
        const [result] = await db.query(`
            UPDATE doctors 
            SET specialization = ?, qualification = ?, experience = ?, phone = ?, department = ?, status = ?, rating = ?
            WHERE id = ?
        `, [specialization, qualification, experience, phone, department, status, rating, id]);
        return result.affectedRows;
    },
    
    // Update doctor status
    updateStatus: async (id, status) => {
        const [result] = await db.query('UPDATE doctors SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows;
    },
    
    // Delete doctor
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [id]);
        return result.affectedRows;
    },
    
    // Get doctors by department
    getByDepartment: async (department) => {
        const [rows] = await db.query(`
            SELECT d.*, u.name, u.email 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE d.department = ?
        `, [department]);
        return rows;
    },
    
    // Get available doctors
    getAvailable: async () => {
        const [rows] = await db.query(`
            SELECT d.*, u.name, u.email 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE d.status = 'Available'
        `);
        return rows;
    }
};

module.exports = Doctor;