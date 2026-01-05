import { useState } from 'react';
import { Button } from './ui/button';
import { LogOut, CheckCircle } from 'lucide-react';
import { DoctorView } from './DoctorView';
import { visitsAPI, Visit } from '../utils/visitsAPI';

interface ConsultationViewProps {
  visit: Visit;
  onBack: () => void;
  onLogout: () => void;
  onVisitCompleted: () => void;
}

export function ConsultationView({ visit, onBack, onLogout, onVisitCompleted }: ConsultationViewProps) {
  const [completing, setCompleting] = useState(false);

  const handleCompleteVisit = async () => {
    try {
      setCompleting(true);
      await visitsAPI.updateVisitStatus(visit.visitId, 'COMPLETED');
      onVisitCompleted();
      onBack();
    } catch (error) {
      console.error('结束就诊失败:', error);
      alert('结束就诊失败，请重试');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              返回列表
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {visit.patientName} - {visit.chiefComplaint}
              </h1>
              <p className="text-sm text-gray-600">
                就诊ID: {visit.visitId} | 患者ID: {visit.patientId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(visit.status === 'IN_PROGRESS' || visit.status === 'SCHEDULED') && (
              <Button 
                onClick={handleCompleteVisit}
                disabled={completing}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                {completing ? '结束中...' : '结束就诊'}
              </Button>
            )}
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>
        </div>
      </div>
      <DoctorView accessibilityMode={false} />
    </div>
  );
}