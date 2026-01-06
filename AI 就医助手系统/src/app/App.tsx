import { useState } from 'react';
import { DoctorView } from './components/DoctorView';
import { LoginSelect } from './components/LoginSelect';
import { PatientLogin } from './components/PatientLogin';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorLogin } from './components/DoctorLogin';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

type UserRole = 'patient' | 'doctor' | 'admin' | null;
type AppState = 'select' | 'patient-login' | 'patient-dashboard' | 'doctor-login' | 'doctor-dashboard' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('select');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [patientId, setPatientId] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [adminId, setAdminId] = useState<string>('');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'patient') {
      setAppState('patient-login');
    } else if (role === 'doctor') {
      setAppState('doctor-login');
    } else if (role === 'admin') {
      setAppState('admin-login');
    }
  };

  const handlePatientLogin = (id: string) => {
    setPatientId(id);
    setAppState('patient-dashboard');
  };

  const handleDoctorLogin = (id: string) => {
    setDoctorId(id);
    setAppState('doctor-dashboard');
  };

  const handleAdminLogin = (id: string) => {
    setAdminId(id);
    setAppState('admin-dashboard');
  };

  const handleLogout = () => {
    setAppState('select');
    setUserRole(null);
    setPatientId('');
    setDoctorId('');
    setAdminId('');
  };

  const handleBackToSelect = () => {
    setAppState('select');
    setUserRole(null);
  };

  if (appState === 'select') {
    return <LoginSelect onSelectRole={handleRoleSelect} />;
  }

  if (appState === 'patient-login') {
    return (
      <PatientLogin 
        onLogin={handlePatientLogin}
        onBack={handleBackToSelect}
      />
    );
  }

  if (appState === 'patient-dashboard') {
    return (
      <PatientDashboard 
        patientId={patientId}
        onLogout={handleLogout}
      />
    );
  }

  if (appState === 'doctor-login') {
    return (
      <DoctorLogin 
        onLogin={handleDoctorLogin}
        onBack={handleBackToSelect}
      />
    );
  }

  if (appState === 'doctor-dashboard') {
    return (
      <DoctorDashboard 
        doctorId={doctorId}
        onLogout={handleLogout}
        accessibilityMode={accessibilityMode}
      />
    );
  }

  if (appState === 'admin-login') {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin}
        onBack={handleBackToSelect}
      />
    );
  }

  if (appState === 'admin-dashboard') {
    return (
      <AdminDashboard 
        adminId={adminId}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
