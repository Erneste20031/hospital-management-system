import API from './api';

const doctorService = {
  getAll: () => API.get('/doctors'),
  getById: (id) => API.get(`/doctors/${id}`),
  create: (data) => API.post('/doctors', data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  delete: (id) => API.delete(`/doctors/${id}`),
  getSchedule: (id) => API.get(`/doctors/${id}/schedule`),
  updateStatus: (id, status) => API.patch(`/doctors/${id}/status`, { status }),
};

export default doctorService;