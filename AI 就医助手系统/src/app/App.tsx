import { useState } from 'react';
import { DoctorView } from './components/DoctorView';
import { LoginSelect } from './components/LoginSelect';
import { PatientLogin } from './components/PatientLogin';
import { PatientDashboard } from './components/PatientDashboard';

type UserRole = 'patient' | 'doctor' | null;
type AppState = 'select' | 'patient-login' | 'patient-dashboard' | 'doctor-dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('select');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [patientId, setPatientId] = useState<string>('');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'patient') {
      setAppState('patient-login');
    } else if (role === 'doctor') {
      setAppState('doctor-dashboard');
    }
  };

  const handlePatientLogin = (id: string) => {
    setPatientId(id);
    setAppState('patient-dashboard');
  };

  const handleLogout = () => {
    setAppState('select');
    setUserRole(null);
    setPatientId('');
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

  if (appState === 'doctor-dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorView accessibilityMode={accessibilityMode} />
      </div>
    );
  }

  return null;
}
