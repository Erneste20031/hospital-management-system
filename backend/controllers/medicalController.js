const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const medicalController = {
    // Get all medical records
    getAllRecords: async (req, res) => {
        try {
            let records = [];
            
            console.log('User role:', req.user.role);
            console.log('User ID:', req.user.id);
            
            if (req.user.role === 'doctor') {
                const doctor = await Doctor.getByUserId(req.user.id);
                console.log('Doctor found:', doctor);
                
                if (doctor && doctor.id) {
                    records = await MedicalRecord.getByDoctorId(doctor.id);
                }
            } else if (req.user.role === 'patient') {
                const patient = await Patient.getByUserId(req.user.id);
                if (patient) {
                    const record = await MedicalRecord.getByPatientId(patient.id);
                    records = record ? [record] : [];
                }
            } else {
                records = await MedicalRecord.getAll();
            }
            
            console.log('Records found:', records.length);
            res.json(records);
            
        } catch (error) {
            console.error('Get records error:', error);
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    },
    
    // Get medical record by patient ID
    getRecordByPatientId: async (req, res) => {
        try {
            const record = await MedicalRecord.getByPatientId(req.params.patientId);
            if (!record) {
                return res.status(404).json({ message: 'Medical record not found' });
            }
            res.json(record);
        } catch (error) {
            console.error('Get record error:', error);
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    },
    
    // Create or update medical record
    upsertMedicalRecord: async (req, res) => {
        try {
            const { patientId, diagnosis, prescription, notes, allergies, status } = req.body;
            
            console.log('=== UPSERT MEDICAL RECORD ===');
            console.log('Request body:', req.body);
            console.log('User:', req.user.name, req.user.id);
            
            // Get doctor id and name
            const doctor = await Doctor.getByUserId(req.user.id);
            console.log('Doctor found:', doctor);
            
            if (!doctor) {
                return res.status(403).json({ message: 'Doctor not found for this user' });
            }
            
            // Check if patient exists
            const patient = await Patient.getById(patientId);
            if (!patient) {
                return res.status(404).json({ message: `Patient not found with ID: ${patientId}` });
            }
            
            // Upsert medical record with doctor_name
            const record = await MedicalRecord.upsert({
                patient_id: patientId,
                doctor_id: doctor.id,
                doctor_name: req.user.name,
                diagnosis,
                prescription,
                notes,
                allergies: allergies || null,
                status: status || 'Active'
            });
            
            // Add to history
            await MedicalRecord.addToHistory({
                patient_id: patientId,
                diagnosis,
                treatment: prescription,
                doctor_name: req.user.name,
                notes
            });
            
            console.log('Medical record saved successfully');
            res.json({
                success: true,
                message: record.isNew ? 'Medical record created' : 'Medical record updated',
                recordId: record.id
            });
            
        } catch (error) {
            console.error('Upsert record error:', error);
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    },
    
    // Get medical history for a patient
    getMedicalHistory: async (req, res) => {
        try {
            const history = await MedicalRecord.getHistory(req.params.patientId);
            res.json(history);
        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    },
    
    // Delete a medical record (Doctor only)
    deleteRecord: async (req, res) => {
        try {
            const recordId = req.params.id;
            
            // Check if record exists
            const record = await MedicalRecord.getById(recordId);
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            
            await MedicalRecord.delete(recordId);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Delete record error:', error);
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    },
    
    // Export a patient's medical record as PDF (Doctor only)
    exportPdf: async (req, res) => {
        try {
            const patientId = req.params.patientId;
            const record = await MedicalRecord.getByPatientId(patientId);
            
            if (!record) {
                return res.status(404).json({ message: 'Record not found' });
            }
            
            // Get patient details
            const patient = await Patient.getById(patientId);
            
            // Simple PDF generation
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument();
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="medical-record-${patientId}.pdf"`);
            
            doc.pipe(res);
            
            // Add content to PDF
            doc.fontSize(20).text('Medical Record', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Patient Name: ${record.patient_name || patient?.first_name + ' ' + patient?.last_name || 'N/A'}`);
            doc.text(`Age: ${record.age || patient?.age || 'N/A'}`);
            doc.text(`Gender: ${record.gender || patient?.gender || 'N/A'}`);
            doc.text(`Blood Group: ${record.blood_group || patient?.blood_group || 'N/A'}`);
            doc.moveDown();
            doc.text(`Doctor: ${record.doctor_name || 'N/A'}`);
            doc.text(`Diagnosis: ${record.diagnosis || 'N/A'}`);
            doc.text(`Prescription: ${record.prescription || 'N/A'}`);
            doc.text(`Notes: ${record.notes || 'N/A'}`);
            doc.text(`Allergies: ${record.allergies || 'None'}`);
            doc.text(`Status: ${record.status || 'Active'}`);
            doc.text(`Last Visit: ${record.last_visit || 'N/A'}`);
            doc.text(`Total Visits: ${record.visits_count || 1}`);
            
            doc.end();
            
        } catch (error) {
            console.error('Export PDF error:', error);
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    }
};

module.exports = medicalController;