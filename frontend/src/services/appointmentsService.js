import API from './api';

const appointmentService = {
  getAll: () => API.get('/appointments'),
  getById: (id) => API.get(`/appointments/${id}`),
  create: (data) => API.post('/appointments', data),
  update: (id, data) => API.put(`/appointments/${id}`, data),
  cancel: (id) => API.delete(`/appointments/${id}/cancel`),
  getByDoctor: (doctorId) => API.get(`/appointments/doctor/${doctorId}`),
  getByPatient: (patientId) => API.get(`/appointments/patient/${patientId}`),
  getTodayByDoctor: () => API.get('/appointments/today/doctor'),
  updateStatus: (id, status) => API.patch(`/appointments/${id}/status`, { status }),
};

export default appointmentService;