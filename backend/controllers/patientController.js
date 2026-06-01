const Patient = require('../models/Patient');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const patientController = {
    // Get all patients
    getAllPatients: async (req, res) => {
        try {
            const patients = await Patient.getAll();
            res.json(patients);
        } catch (error) {
            console.error('Get patients error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get single patient
    getPatientById: async (req, res) => {
        try {
            const patient = await Patient.getById(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json(patient);
        } catch (error) {
            console.error('Get patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Register new patient
    registerPatient: async (req, res) => {
        try {
            const {
                firstName, lastName, dob, age, gender, phone, altPhone, email,
                address, city, emergencyContact, emergencyPhone, bloodGroup,
                allergies, conditions, dept, insuranceProvider, insuranceNumber
            } = req.body;
            
            // Check if user exists
            let existingUser = await User.findByEmail(email);
            let userId;
            
            if (existingUser) {
                userId = existingUser.id;
            } else {
                // Create user account
                const defaultPassword = 'patient123';
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                
                userId = await User.create({
                    name: `${firstName} ${lastName}`,
                    email,
                    password: hashedPassword,
                    role: 'patient',
                    avatar: '👤'
                });
            }
            
            // Create patient record
            const patientId = await Patient.create({
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                dob: dob || null,
                age: age || null,
                gender: gender || null,
                phone,
                alt_phone: altPhone || null,
                email,
                address: address || null,
                city: city || null,
                emergency_contact: emergencyContact || null,
                emergency_phone: emergencyPhone || null,
                blood_group: bloodGroup || null,
                allergies: allergies || null,
                conditions: conditions || null,
                department: dept || null,
                insurance_provider: insuranceProvider || null,
                insurance_number: insuranceNumber || null
            });
            
            res.json({
                success: true,
                message: 'Patient registered successfully',
                patientId,
                patient: {
                    id: patientId,
                    name: `${firstName} ${lastName}`,
                    email,
                    phone
                }
            });
            
        } catch (error) {
            console.error('Register patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Update patient
    updatePatient: async (req, res) => {
        try {
            const { firstName, lastName, age, gender, phone, email, address, bloodGroup, status } = req.body;
            
            const updated = await Patient.update(req.params.id, {
                first_name: firstName,
                last_name: lastName,
                age,
                gender,
                phone,
                email,
                address,
                blood_group: bloodGroup,
                status
            });
            
            if (updated === 0) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            
            res.json({ success: true, message: 'Patient updated successfully' });
            
        } catch (error) {
            console.error('Update patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Delete patient
    deletePatient: async (req, res) => {
        try {
            const deleted = await Patient.delete(req.params.id);
            if (deleted === 0) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json({ success: true, message: 'Patient deleted successfully' });
        } catch (error) {
            console.error('Delete patient error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Search patients
    searchPatients: async (req, res) => {
        try {
            const { q } = req.query;
            const patients = await Patient.search(q);
            res.json(patients);
        } catch (error) {
            console.error('Search patients error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = patientController;