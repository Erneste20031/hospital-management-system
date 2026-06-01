const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const appointmentController = {
    getAllAppointments: async (req, res) => {
        try {
            // Filter based on role
            if (req.user.role === 'doctor') {
                const doctor = await Doctor.getByUserId(req.user.id);
                if (!doctor) {
                    return res.json([]);
                }
                const appointments = await Appointment.getByDoctorId(doctor.id);
                return res.json(appointments);
            } else if (req.user.role === 'patient') {
                const patient = await Patient.getByUserId(req.user.id);
                if (!patient) {
                    return res.json([]);
                }
                const appointments = await Appointment.getByPatientId(patient.id);
                return res.json(appointments);
            } else {
                // Admin or receptionist gets paginated full list
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;

                const appointments = await Appointment.getAllPaginated(limit, offset);
                const total = await Appointment.getTotalCount();

                return res.json({ 
                    appointments, 
                    total, 
                    totalPages: Math.ceil(total / limit), 
                    currentPage: page 
                });
            }
        } catch (error) {
            console.error('getAllAppointments error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getTodayAppointments: async (req, res) => {
        try {
            const doctor = await Doctor.getByUserId(req.user.id);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            const appointments = await Appointment.getTodayByDoctorId(doctor.id);
            res.json(appointments);
        } catch (error) {
            console.error('getTodayAppointments error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getAppointmentById: async (req, res) => {
        try {
            const appointment = await Appointment.getById(req.params.id);
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            res.json(appointment);
        } catch (error) {
            console.error('getAppointmentById error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    createAppointment: async (req, res) => {
        try {
            const { patient_id, doctor_id, date, time, type, reason, notes, status } = req.body;
            
            let finalPatientId = patient_id;
            if (req.user.role === 'patient') {
                const patient = await Patient.getByUserId(req.user.id);
                if (!patient) {
                    return res.status(404).json({ message: 'Patient profile not found' });
                }
                finalPatientId = patient.id;
            }

            if (!finalPatientId || !doctor_id || !date || !time) {
                return res.status(400).json({ message: 'patient_id, doctor_id, date and time are required' });
            }

            const appointmentId = await Appointment.create({
                patient_id: finalPatientId,
                doctor_id,
                date,
                time,
                type,
                reason,
                notes,
                status
            });

            res.json({
                success: true,
                message: 'Appointment created successfully',
                appointmentId
            });
        } catch (error) {
            console.error('createAppointment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateAppointment: async (req, res) => {
        try {
            const appointment = await Appointment.getById(req.params.id);
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            const { date, time, type, reason, notes, status } = req.body;
            const updatedData = {
                date: date || appointment.date,
                time: time || appointment.time,
                type: type || appointment.type,
                reason: reason || appointment.reason,
                notes: notes || appointment.notes,
                status: status || appointment.status
            };

            await Appointment.update(req.params.id, updatedData);
            res.json({ success: true, message: 'Appointment updated successfully' });
        } catch (error) {
            console.error('updateAppointment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateAppointmentStatus: async (req, res) => {
        try {
            const { status } = req.body;
            if (!['Scheduled', 'Completed', 'Cancelled', 'In Progress'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const updated = await Appointment.updateStatus(req.params.id, status);
            if (updated === 0) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            res.json({ success: true, message: `Appointment status updated to ${status}` });
        } catch (error) {
            console.error('updateAppointmentStatus error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    cancelAppointment: async (req, res) => {
        try {
            const updated = await Appointment.cancel(req.params.id);
            if (updated === 0) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            res.json({ success: true, message: 'Appointment cancelled successfully' });
        } catch (error) {
            console.error('cancelAppointment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = appointmentController;