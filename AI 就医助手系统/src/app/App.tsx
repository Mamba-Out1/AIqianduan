import { useState } from 'react';
import { DoctorView } from './components/DoctorView';
import { LoginSelect } from './components/LoginSelect';
import { PatientLogin } from './components/PatientLogin';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorLogin } from './components/DoctorLogin';
import { DoctorDashboard } from './components/DoctorDashboard';

type UserRole = 'patient' | 'doctor' | null;
type AppState = 'select' | 'patient-login' | 'patient-dashboard' | 'doctor-login' | 'doctor-dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('select');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [patientId, setPatientId] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'patient') {
      setAppState('patient-login');
    } else if (role === 'doctor') {
      setAppState('doctor-login');
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

  const handleLogout = () => {
    setAppState('select');
    setUserRole(null);
    setPatientId('');
    setDoctorId('');
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

  return null;
}
