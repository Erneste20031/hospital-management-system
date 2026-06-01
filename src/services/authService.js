import API from './api';

const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
};

export default authService;