const db = require('../config/db');

const Patient = {
    // Get all patients
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT p.*, u.email 
            FROM patients p 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        return rows;
    },
    
    // Get patient by ID
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT p.*, u.email 
            FROM patients p 
            LEFT JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    },
    
    // Get patient by user_id
    getByUserId: async (userId) => {
        const [rows] = await db.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
        return rows[0];
    },
    
    // Create patient
    create: async (patientData) => {
        const {
            user_id, first_name, last_name, dob, age, gender, phone, alt_phone, email,
            address, city, emergency_contact, emergency_phone, blood_group,
            allergies, conditions, department, insurance_provider, insurance_number
        } = patientData;
        
        const [result] = await db.query(`
            INSERT INTO patients (
                user_id, first_name, last_name, dob, age, gender, phone, alt_phone, email,
                address, city, emergency_contact, emergency_phone, blood_group,
                allergies, conditions, department, insurance_provider, insurance_number, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        `, [user_id, first_name, last_name, dob, age, gender, phone, alt_phone, email,
            address, city, emergency_contact, emergency_phone, blood_group,
            allergies, conditions, department, insurance_provider, insurance_number]);
        
        return result.insertId;
    },
    
    // Update patient
    update: async (id, patientData) => {
        const {
            first_name, last_name, age, gender, phone, email, address, blood_group, status
        } = patientData;
        
        const [result] = await db.query(`
            UPDATE patients 
            SET first_name = ?, last_name = ?, age = ?, gender = ?, phone = ?, 
                email = ?, address = ?, blood_group = ?, status = ?
            WHERE id = ?
        `, [first_name, last_name, age, gender, phone, email, address, blood_group, status, id]);
        
        return result.affectedRows;
    },
    
    // Delete patient
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM patients WHERE id = ?', [id]);
        return result.affectedRows;
    },
    
    // Search patients
    search: async (keyword) => {
        const [rows] = await db.query(`
            SELECT p.*, u.email 
            FROM patients p 
            LEFT JOIN users u ON p.user_id = u.id 
            WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR p.phone LIKE ? OR p.email LIKE ?
        `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
        return rows;
    },
    
    // Get patient count
    getCount: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM patients');
        return rows[0].count;
    }
};

module.exports = Patient;