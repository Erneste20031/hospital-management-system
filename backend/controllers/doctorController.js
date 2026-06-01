const Doctor = require('../models/Doctor');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const doctorController = {
    // Get all doctors
    getAllDoctors: async (req, res) => {
        try {
            const doctors = await Doctor.getAll();
            res.json(doctors);
        } catch (error) {
            console.error('Get doctors error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get single doctor
    getDoctorById: async (req, res) => {
        try {
            const doctor = await Doctor.getById(req.params.id);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            res.json(doctor);
        } catch (error) {
            console.error('Get doctor error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Add new doctor
    addDoctor: async (req, res) => {
        try {
            const { name, email, specialization, qualification, experience, phone, department, status, rating } = req.body;

            if (!name || !email || !specialization || !department) {
                return res.status(400).json({ message: 'name, email, specialization and department are required' });
            }

            // Check if user exists
            let existingUser = await User.findByEmail(email);
            let userId;

            if (existingUser) {
                userId = existingUser.id;

                // Prevent attaching a doctor record to a user that already has one
                const existingDoctor = await Doctor.getByUserId(userId);
                if (existingDoctor) {
                    return res.status(400).json({ message: 'Doctor already exists for this user' });
                }
            } else {
                // Create user account
                const defaultPassword = 'doctor123';
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);

                userId = await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    role: 'doctor',
                    avatar: '👨‍⚕️'
                });
            }

            // Create doctor record
            const doctorId = await Doctor.create({
                user_id: userId,
                specialization,
                qualification,
                experience,
                phone,
                department,
                status: status || 'Available',
                rating: rating || 4.5
            });

            res.json({
                success: true,
                message: 'Doctor added successfully',
                doctorId
            });

        } catch (error) {
            console.error('Add doctor error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Update doctor
    updateDoctor: async (req, res) => {
        try {
            const { specialization, qualification, experience, phone, department, status, rating } = req.body;

            const updated = await Doctor.update(req.params.id, {
                specialization,
                qualification,
                experience,
                phone,
                department,
                status,
                rating
            });

            if (updated === 0) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            res.json({ success: true, message: 'Doctor updated successfully' });

        } catch (error) {
            console.error('Update doctor error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Update doctor status
    updateDoctorStatus: async (req, res) => {
        try {
            const { status } = req.body;

            if (!['Available', 'Busy', 'On Leave'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const updated = await Doctor.updateStatus(req.params.id, status);

            if (updated === 0) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            res.json({ success: true, message: 'Doctor status updated' });

        } catch (error) {
            console.error('Update status error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Delete doctor
    deleteDoctor: async (req, res) => {
        try {
            const deleted = await Doctor.delete(req.params.id);

            if (deleted === 0) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            res.json({ success: true, message: 'Doctor deleted successfully' });

        } catch (error) {
            console.error('Delete doctor error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get doctors by department
    getDoctorsByDepartment: async (req, res) => {
        try {
            const doctors = await Doctor.getByDepartment(req.params.department);
            res.json(doctors);
        } catch (error) {
            console.error('Get by department error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Get available doctors
    getAvailableDoctors: async (req, res) => {
        try {
            const doctors = await Doctor.getAvailable();
            res.json(doctors);
        } catch (error) {
            console.error('Get available doctors error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = doctorController;
