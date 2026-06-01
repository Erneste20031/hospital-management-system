const Document = require('../models/Document');
const Patient = require('../models/Patient');

const documentController = {
    // Get all documents for a patient
    getMyDocuments: async (req, res) => {
        try {
            const patient = await Patient.getByUserId(req.user.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            
            const documents = await Document.getByPatientId(patient.id);
            res.json(documents);
        } catch (error) {
            console.error('Get documents error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get all documents (Admin only)
    getAllDocuments: async (req, res) => {
        try {
            const documents = await Document.getAll();
            res.json(documents);
        } catch (error) {
            console.error('Get all documents error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Upload document (Doctor or Admin)
    uploadDocument: async (req, res) => {
        try {
            const { patient_id, name, type, file_size } = req.body;
            
            // In real implementation, you'd handle file upload here
            // For now, just save metadata
            const documentId = await Document.create({
                patient_id,
                name,
                type,
                file_path: null,
                file_size: file_size || 'N/A',
                uploaded_by: req.user.name
            });
            
            res.json({
                success: true,
                message: 'Document uploaded successfully',
                documentId
            });
        } catch (error) {
            console.error('Upload document error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Delete document
    deleteDocument: async (req, res) => {
        try {
            const deleted = await Document.delete(req.params.id);
            if (deleted === 0) {
                return res.status(404).json({ message: 'Document not found' });
            }
            res.json({ success: true, message: 'Document deleted successfully' });
        } catch (error) {
            console.error('Delete document error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = documentController;