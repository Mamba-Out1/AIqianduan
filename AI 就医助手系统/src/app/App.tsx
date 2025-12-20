import { useState } from 'react';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';
import { VoiceTranscriptionTest } from './components/VoiceTranscriptionTest';
import { Button } from './components/ui/button';
import { Users, Stethoscope, Mic } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'patient' | 'doctor' | 'test'>('patient');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  return (
    <div className={`min-h-screen ${accessibilityMode ? 'text-xl' : ''}`}>
      {/* 顶部切换栏 */}
      <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <h1 className={accessibilityMode ? 'font-bold' : ''}>AI 就医助手系统</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'patient' ? 'default' : 'outline'}
              onClick={() => setViewMode('patient')}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              患者端
            </Button>
            <Button
              variant={viewMode === 'doctor' ? 'default' : 'outline'}
              onClick={() => setViewMode('doctor')}
              className="gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              医生端
            </Button>
            <Button
              variant={viewMode === 'test' ? 'default' : 'outline'}
              onClick={() => setViewMode('test')}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              语音测试
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      {viewMode === 'patient' ? (
        <PatientView 
          accessibilityMode={accessibilityMode} 
          setAccessibilityMode={setAccessibilityMode}
        />
      ) : viewMode === 'doctor' ? (
        <DoctorView accessibilityMode={accessibilityMode} />
      ) : (
        <VoiceTranscriptionTest />
      )}
    </div>
  );
}
