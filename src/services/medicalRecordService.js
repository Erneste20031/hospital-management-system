import API from './api';

const medicalRecordService = {
  getAll:        ()            => API.get('/medical/records'),
  getByPatientId:(patientId)  => API.get(`/medical/records/patient/${patientId}`),
  upsert:        (data)       => API.post('/medical/records', data),
  getHistory:    (patientId)  => API.get(`/medical/history/${patientId}`),
  deleteRecord:  (recordId)   => API.delete(`/medical/records/${recordId}`),
  exportPdf:     (patientId)  => API.get(`/medical/export/${patientId}`, { responseType: 'blob' }),
};

export default medicalRecordService;
