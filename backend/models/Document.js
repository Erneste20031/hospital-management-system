const db = require('../config/db');

const Document = {
    // Get all documents
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT d.*, CONCAT(p.first_name, ' ', p.last_name) as patient_name
            FROM documents d
            JOIN patients p ON d.patient_id = p.id
            ORDER BY d.upload_date DESC
        `);
        return rows;
    },
    
    // Get documents by patient ID
    getByPatientId: async (patientId) => {
        const [rows] = await db.query(`
            SELECT * FROM documents 
            WHERE patient_id = ? 
            ORDER BY upload_date DESC
        `, [patientId]);
        return rows;
    },
    
    // Get document by ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
        return rows[0];
    },
    
    // Create document
    create: async (documentData) => {
        const { patient_id, name, type, file_path, file_size, uploaded_by } = documentData;
        const [result] = await db.query(`
            INSERT INTO documents (patient_id, name, type, file_path, file_size, uploaded_by, upload_date)
            VALUES (?, ?, ?, ?, ?, ?, CURDATE())
        `, [patient_id, name, type, file_path, file_size, uploaded_by]);
        return result.insertId;
    },
    
    // Delete document
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM documents WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Document;