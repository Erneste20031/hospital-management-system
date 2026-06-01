const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const authController = {
    // Login user
    login: async (req, res) => {
        try {
            const { email, password, role } = req.body;
            
            console.log('Login attempt:', { email, role });
            
            // Find user by email
            const user = await User.findByEmail(email);
            
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            // For demo: accept any password (remove in production)
            // const isMatch = await bcrypt.compare(password, user.password);
            const isMatch = true;
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            // Check role matches
            if (user.role !== role) {
                return res.status(401).json({ message: `Please login as ${user.role}` });
            }
            
            // Get additional data based on role
            let additionalData = {};
            
            if (user.role === 'doctor') {
                const doctor = await Doctor.getByUserId(user.id);
                if (doctor) {
                    additionalData = {
                        doctorId: doctor.id,
                        specialization: doctor.specialization,
                        department: doctor.department,
                        qualification: doctor.qualification,
                        experience: doctor.experience,
                        status: doctor.status,
                        rating: doctor.rating,
                        patients_count: doctor.patients_count
                    };
                }
            } else if (user.role === 'patient') {
                const patient = await Patient.getByUserId(user.id);
                if (patient) {
                    additionalData = {
                        name: `${patient.first_name} ${patient.last_name}`,
                        phone: patient.phone,
                        bloodGroup: patient.blood_group
                    };
                }
            }
            
            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );
            
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar || '👤',
                    ...additionalData
                }
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Register new user
    register: async (req, res) => {
        try {
            const { name, email, password, role, phone } = req.body;
            
            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create user
            const userId = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'patient',
                avatar: role === 'doctor' ? '👨‍⚕️' : '👤'
            });
            
            // Create role-specific record
            if (role === 'patient') {
                const nameParts = name.split(' ');
                await Patient.create({
                    user_id: userId,
                    first_name: nameParts[0],
                    last_name: nameParts.slice(1).join(' ') || '',
                    phone: phone || '',
                    email: email
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Registration successful',
                userId 
            });
            
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get current user
    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            let additionalData = {};
            
            if (user.role === 'doctor') {
                const doctor = await Doctor.getByUserId(user.id);
                if (doctor) {
                    additionalData = {
                        doctorId: doctor.id,
                        specialization: doctor.specialization,
                        department: doctor.department,
                        qualification: doctor.qualification,
                        experience: doctor.experience,
                        status: doctor.status,
                        rating: doctor.rating,
                        patients_count: doctor.patients_count
                    };
                }
            } else if (user.role === 'patient') {
                const patient = await Patient.getByUserId(user.id);
                if (patient) {
                    additionalData = {
                        patientId: patient.id,
                        firstName: patient.first_name,
                        lastName: patient.last_name,
                        phone: patient.phone,
                        bloodGroup: patient.blood_group
                    };
                }
            }
            
            res.json({ ...user, ...additionalData });
            
        } catch (error) {
            console.error('Get me error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController;