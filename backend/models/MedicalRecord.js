const db = require('../config/db');

const MedicalRecord = {
    // Get all medical records
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT 
                mr.*,
                p.first_name,
                p.last_name,
                p.age,
                p.gender,
                p.blood_group,
                p.phone
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            ORDER BY mr.last_visit DESC
        `);
        return rows;
    },
    
    // Get record by ID
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT 
                mr.*,
                p.first_name,
                p.last_name,
                p.age,
                p.gender,
                p.blood_group,
                p.phone
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            WHERE mr.id = ?
        `, [id]);
        return rows[0];
    },
    
    // Get records by patient ID
    getByPatientId: async (patientId) => {
        const [rows] = await db.query(`
            SELECT 
                mr.*,
                p.first_name,
                p.last_name,
                p.age,
                p.gender,
                p.blood_group,
                p.phone
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            WHERE mr.patient_id = ?
        `, [patientId]);
        return rows[0];
    },
    
    // Get records by doctor ID
    getByDoctorId: async (doctorId) => {
        const [rows] = await db.query(`
            SELECT 
                mr.*,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.age,
                p.gender,
                p.blood_group,
                p.phone
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            WHERE mr.doctor_id = ?
            ORDER BY mr.last_visit DESC
        `, [doctorId]);
        return rows;
    },
    
    // Create or update medical record
    upsert: async (recordData) => {
        const { patient_id, doctor_id, doctor_name, diagnosis, prescription, notes, allergies, status } = recordData;
        
        // Check if record exists
        const [existing] = await db.query('SELECT id, visits_count FROM medical_records WHERE patient_id = ?', [patient_id]);
        
        if (existing.length > 0) {
            // Update existing
            const [result] = await db.query(`
                UPDATE medical_records 
                SET diagnosis = ?, prescription = ?, notes = ?, allergies = ?, status = ?, 
                    doctor_name = ?, last_visit = CURDATE(), visits_count = visits_count + 1
                WHERE patient_id = ?
            `, [diagnosis, prescription, notes, allergies, status, doctor_name, patient_id]);
            return { id: existing[0].id, isNew: false };
        } else {
            // Create new
            const [result] = await db.query(`
                INSERT INTO medical_records (
                    patient_id, doctor_id, doctor_name, diagnosis, prescription, notes, allergies, status, last_visit, visits_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 1)
            `, [patient_id, doctor_id, doctor_name, diagnosis, prescription, notes, allergies, status]);
            return { id: result.insertId, isNew: true };
        }
    },
    
    // Add to medical history
    addToHistory: async (historyData) => {
        const { patient_id, diagnosis, treatment, doctor_name, notes } = historyData;
        const [result] = await db.query(`
            INSERT INTO medical_history (patient_id, visit_date, diagnosis, treatment, doctor_name, notes)
            VALUES (?, CURDATE(), ?, ?, ?, ?)
        `, [patient_id, diagnosis, treatment, doctor_name, notes]);
        return result.insertId;
    },
    
    // Get medical history for a patient
    getHistory: async (patientId) => {
        const [rows] = await db.query(`
            SELECT * FROM medical_history 
            WHERE patient_id = ? 
            ORDER BY visit_date DESC
        `, [patientId]);
        return rows;
    },
    
    // Delete medical record
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM medical_records WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = MedicalRecord;