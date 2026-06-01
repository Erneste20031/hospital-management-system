const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // For demo: allow any password (since frontend accepts any)
        // In production, uncomment below:
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        
        // Check role matches
        if (user.role !== role) {
            return res.status(401).json({ message: `Please login as ${user.role}` });
        }
        
        // Get additional data based on role
        let additionalData = {};
        
        if (user.role === 'doctor') {
            const [doctors] = await db.query('SELECT specialization, department, qualification, experience FROM doctors WHERE user_id = ?', [user.id]);
            if (doctors.length) additionalData = doctors[0];
        } else if (user.role === 'patient') {
            const [patients] = await db.query('SELECT first_name, last_name, phone, blood_group FROM patients WHERE user_id = ?', [user.id]);
            if (patients.length) {
                additionalData = {
                    name: `${patients[0].first_name} ${patients[0].last_name}`,
                    phone: patients[0].phone,
                    bloodGroup: patients[0].blood_group
                };
            }
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                ...additionalData
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        
        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );
        
        // If patient, create patient record
        if (role === 'patient') {
            const nameParts = name.split(' ');
            await db.query(
                'INSERT INTO patients (user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?)',
                [result.insertId, nameParts[0], nameParts.slice(1).join(' ') || '', phone || '']
            );
        }
        
        res.json({ success: true, message: 'Registration successful' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;