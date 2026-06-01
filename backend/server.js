const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✅ MySQL Connected');
});

// Make db available to routes
app.set('db', db);

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const billingRoutes = require('./routes/billingRoutes');
const departmentsRoutes = require('./routes/departments');
const documentRoutes = require('./routes/documentRoutes');

// Import authMiddleware to protect routes
const authMiddleware = require('./middleware/authMiddleware');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/documents', documentRoutes);

// Dashboard stats endpoint
app.get('/api/stats', authMiddleware, (req, res) => {
    const db = req.app.get('db');

    const queries = {
        totalPatients:     'SELECT COUNT(*) as count FROM patients',
        totalDoctors:      'SELECT COUNT(*) as count FROM doctors',
        todayAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE date = CURDATE()',
        revenue:           'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM bills WHERE status = "Paid" AND MONTH(date) = MONTH(CURDATE())',
        pendingBills:      'SELECT COUNT(*) as count FROM bills WHERE status = "Unpaid"',
    };

    Promise.all([
        new Promise((resolve) => db.query(queries.totalPatients,     (err, result) => resolve(result?.[0]?.count   || 0))),
        new Promise((resolve) => db.query(queries.totalDoctors,      (err, result) => resolve(result?.[0]?.count   || 0))),
        new Promise((resolve) => db.query(queries.todayAppointments, (err, result) => resolve(result?.[0]?.count   || 0))),
        new Promise((resolve) => db.query(queries.revenue,           (err, result) => resolve(result?.[0]?.revenue || 0))),
        new Promise((resolve) => db.query(queries.pendingBills,      (err, result) => resolve(result?.[0]?.count   || 0))),
    ]).then(([totalPatients, totalDoctors, todayAppointments, revenue, pendingBills]) => {
        res.json({ totalPatients, totalDoctors, todayAppointments, revenue, pendingBills });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});