import API from './api';

const patientService = {
  getAll: () => API.get('/patients'),
  getById: (id) => API.get(`/patients/${id}`),
  create: (data) => API.post('/patients', data),
  update: (id, data) => API.put(`/patients/${id}`, data),
  delete: (id) => API.delete(`/patients/${id}`),
  getMedicalHistory: (id) => API.get(`/patients/${id}/medical-history`),
};

export default patientService;