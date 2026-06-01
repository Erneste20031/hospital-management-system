const db = require('../config/db');

const Bill = {
    // Generate unique bill number
    generateBillNumber: () => {
        return `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    },
    
    // Get all bills
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT b.*, p.first_name, p.last_name
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            ORDER BY b.date DESC
        `);
        return rows;
    },
    
    // Get bill by ID
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT b.*, p.first_name, p.last_name
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            WHERE b.id = ?
        `, [id]);
        return rows[0];
    },
    
    // Get bill by bill number
    getByBillNumber: async (billNumber) => {
        const [rows] = await db.query(`
            SELECT b.*, p.first_name, p.last_name, p.phone, p.email
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            WHERE b.bill_number = ?
        `, [billNumber]);
        return rows[0];
    },
    
    // Get bills by patient ID
    getByPatientId: async (patientId) => {
        const [rows] = await db.query(`
            SELECT * FROM bills 
            WHERE patient_id = ? 
            ORDER BY date DESC
        `, [patientId]);
        return rows;
    },
    
    // Get unpaid bills by patient ID
    getUnpaidByPatientId: async (patientId) => {
        const [rows] = await db.query(`
            SELECT * FROM bills 
            WHERE patient_id = ? AND status = 'Unpaid'
            ORDER BY due_date ASC
        `, [patientId]);
        return rows;
    },
    
    // Create bill
    create: async (billData) => {
        const {
            bill_number, patient_id, patient_name, doctor_name, department, description,
            date, due_date, subtotal, insurance_amount, total_amount, status
        } = billData;
        
        const [result] = await db.query(`
            INSERT INTO bills (
                bill_number, patient_id, patient_name, doctor_name, department, description,
                date, due_date, subtotal, insurance_amount, total_amount, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [bill_number, patient_id, patient_name, doctor_name, department, description,
            date, due_date, subtotal, insurance_amount, total_amount, status || 'Unpaid']);
        
        return result.insertId;
    },
    
    // Add bill item
    addItem: async (billId, label, amount) => {
        const [result] = await db.query(
            'INSERT INTO bill_items (bill_id, label, amount) VALUES (?, ?, ?)',
            [billId, label, amount]
        );
        return result.insertId;
    },
    
    // Get bill items
    getItems: async (billId) => {
        const [rows] = await db.query('SELECT label, amount FROM bill_items WHERE bill_id = ?', [billId]);
        return rows;
    },
    
    // Process payment
    processPayment: async (billNumber, method) => {
        const [result] = await db.query(`
            UPDATE bills 
            SET status = 'Paid', paid_date = CURDATE(), payment_method = ? 
            WHERE bill_number = ?
        `, [method, billNumber]);
        return result.affectedRows;
    },
    
    // Get revenue summary
    getRevenueSummary: async () => {
        const [rows] = await db.query(`
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END), 0) as paid_revenue,
                COALESCE(SUM(CASE WHEN status = 'Unpaid' THEN total_amount ELSE 0 END), 0) as unpaid_revenue,
                COUNT(*) as total_bills,
                COUNT(CASE WHEN status = 'Paid' THEN 1 END) as paid_bills
            FROM bills
            WHERE MONTH(date) = MONTH(CURDATE())
        `);
        return rows[0];
    },
    
    // Get bill count by status
    getCountByStatus: async (status) => {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM bills WHERE status = ?', [status]);
        return rows[0].count;
    }
};

module.exports = Bill;