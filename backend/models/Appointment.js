const db = require('../config/db');

const Appointment = {
    // Get paginated appointments
    getAllPaginated: async (limit, offset) => {
        const [rows] = await db.query(`
            SELECT a.*, 
                   CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                   u.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            ORDER BY a.date DESC, a.time ASC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        return rows;
    },

    getTotalCount: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM appointments');
        return rows[0].count;
    },

    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT a.*, CONCAT(p.first_name, ' ', p.last_name) as patient_name, u.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.id = ?
        `, [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const { date, time, type, reason, notes, status } = data;
        const [result] = await db.query(`
            UPDATE appointments SET date=?, time=?, type=?, reason=?, notes=?, status=? WHERE id=?
        `, [date, time, type, reason, notes, status, id]);
        return result.affectedRows;
    },

    cancel: async (id) => {
        const [result] = await db.query('UPDATE appointments SET status = "Cancelled" WHERE id = ?', [id]);
        return result.affectedRows;
    },

    getByDoctorId: async (doctorId) => {
        const [rows] = await db.query(`
            SELECT a.*, 
                   CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                   p.age, p.gender, p.blood_group, p.phone
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = ?
            ORDER BY a.date DESC, a.time ASC
        `, [doctorId]);
        return rows;
    },

    getTodayByDoctorId: async (doctorId) => {
        const [rows] = await db.query(`
            SELECT a.*, 
                   CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                   p.age, p.gender, p.blood_group, p.phone
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = ? AND a.date = CURDATE()
            ORDER BY a.time ASC
        `, [doctorId]);
        return rows;
    },

    getByPatientId: async (patientId) => {
        const [rows] = await db.query(`
            SELECT a.*, 
                   u.name as doctor_name
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = ?
            ORDER BY a.date DESC, a.time ASC
        `, [patientId]);
        return rows;
    },

    create: async (data) => {
        const { patient_id, doctor_id, date, time, type, reason, notes, status } = data;
        
        // Fetch names to cache
        const [patientRow] = await db.query('SELECT first_name, last_name, department FROM patients WHERE id = ?', [patient_id]);
        const [doctorRow] = await db.query(`
            SELECT u.name as doctor_name, d.department 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE d.id = ?
        `, [doctor_id]);

        const pName = patientRow[0] ? `${patientRow[0].first_name} ${patientRow[0].last_name}` : '';
        const dName = doctorRow[0] ? doctorRow[0].doctor_name : '';
        const deptName = doctorRow[0] ? doctorRow[0].department : (patientRow[0] ? patientRow[0].department : '');

        const [result] = await db.query(`
            INSERT INTO appointments (
                patient_id, doctor_id, department_name, doctor_name, patient_name, 
                date, time, type, reason, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            patient_id, doctor_id, deptName, dName, pName,
            date, time, type || 'Checkup', reason || null, notes || null, status || 'Scheduled'
        ]);
        return result.insertId;
    },

    updateStatus: async (id, status) => {
        const [result] = await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows;
    }
};

module.exports = Appointment;