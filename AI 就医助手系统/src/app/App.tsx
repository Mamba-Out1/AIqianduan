import { useState } from 'react';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';
import { LoginSelect } from './components/LoginSelect';

type UserRole = 'patient' | 'doctor' | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  if (!userRole) {
    return <LoginSelect onSelectRole={setUserRole} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'doctor' ? (
        <DoctorView accessibilityMode={accessibilityMode} />
      ) : (
        <PatientView 
          accessibilityMode={accessibilityMode} 
          setAccessibilityMode={setAccessibilityMode}
        />
      )}
    </div>
  );
}
