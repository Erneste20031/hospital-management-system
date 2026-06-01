import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/Dashboard';
import Doctors from '../pages/admin/Doctors';
import Patients from '../pages/admin/Patients';
import Departments from '../pages/admin/Departments';
import AddDepartment from '../pages/admin/AddDepartment';
import EditDepartment from '../pages/admin/EditDepartment';
import AdminAppointments from '../pages/admin/Appointments';
import Reports from '../pages/admin/Reports';
import DoctorDashboard from '../pages/doctor/Dashboard';
import DoctorAppointments from '../pages/doctor/Appointments';
import MedicalRecords from '../pages/doctor/MedicalRecords';
import Prescriptions from '../pages/doctor/Prescriptions';
import PatientDashboard from '../pages/patient/Dashboard';
import BookAppointment from '../pages/patient/BookAppointment';
import MedicalHistory from '../pages/patient/MedicalHistory';
import PatientBills from '../pages/patient/Bills';
import ReceptionistDashboard from '../pages/receptionist/Dashboard';
import RegisterPatient from '../pages/receptionist/RegisterPatient';
import Payments from '../pages/receptionist/Payments';

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients" element={<Patients />} />
            <Route path="departments" element={<Departments />} />
            <Route path="departments/new" element={<AddDepartment />} />
            <Route path="departments/edit/:id" element={<EditDepartment />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="reports" element={<Reports />} />
            
            <Route path="doctor/appointments" element={<DoctorAppointments />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="my-bills" element={<PatientBills />} />
            
            <Route path="register-patient" element={<RegisterPatient />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;