import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Stethoscope, LogOut, User, Clock, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { DoctorView } from './DoctorView';
import { NewWaitingRoom } from './NewWaitingRoom';

interface Visit {
  visitId: string;
  patientId: string;
  patientName: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  chiefComplaint: string;
  visitDate: string;
}

interface DoctorDashboardProps {
  doctorId: string;
  onLogout: () => void;
  accessibilityMode?: boolean;
}

export function DoctorDashboard({ doctorId, onLogout, accessibilityMode = false }: DoctorDashboardProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [completing, setCompleting] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);

  const doctors = [
    { id: 'doctor_001', name: '王医生', department: '内科' },
    { id: 'doctor_002', name: '李医生', department: '外科' },
    { id: 'doctor_003', name: '张医生', department: '儿科' }
  ];

  const doctor = doctors.find(d => d.id === doctorId);

  useEffect(() => {
    loadVisits();
  }, [doctorId]);

  const loadVisits = async () => {
    try {
      const response = await fetch(`http://localhost:8070/api/visits/doctor/${doctorId}`);
      if (response.ok) {
        const apiVisits = await response.json();
        apiVisits.sort((a, b) => a.patientId.localeCompare(b.patientId));
        setVisits(apiVisits);
      } else {
        setVisits([]);
      }
    } catch (error) {
      console.log('API调用失败:', error);
      setVisits([]);
    }
  };

  const handleCompleteVisit = async () => {
    if (!selectedVisit) return;
    
    try {
      setCompleting(true);
      
      const response = await fetch(`http://localhost:8070/api/visits/${selectedVisit.visitId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      
      if (response.ok) {
        setVisits(prev => prev.map(v => 
          v.visitId === selectedVisit.visitId 
            ? { ...v, status: 'COMPLETED' as const }
            : v
        ));
        setSelectedVisit(null);
      } else {
        alert('结束就诊失败，请重试');
      }
    } catch (error) {
      console.log('API调用失败:', error);
      alert('结束就诊失败，请重试');
    } finally {
      setCompleting(false);
    }
  };

  // 新的待就诊界面
  if (showWaitingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
        <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  医生工作台 - 待就诊管理
                </h1>
                <p className="text-sm text-gray-600">
                  {doctor?.name} ({doctorId}) - {doctor?.department}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout} 
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>
        </div>
        <NewWaitingRoom 
          accessibilityMode={accessibilityMode} 
          onBack={() => setShowWaitingRoom(false)} 
        />
      </div>
    );
  }

  // 就诊界面
  if (selectedVisit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
        <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedVisit(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedVisit.patientName} - {selectedVisit.chiefComplaint}
                </h1>
                <p className="text-sm text-gray-600">
                  就诊ID: {selectedVisit.visitId} | 患者ID: {selectedVisit.patientId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedVisit.status === 'IN_PROGRESS' && (
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

  const pendingVisits = visits.filter(v => v.status === 'IN_PROGRESS');
  const completedVisits = visits.filter(v => v.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                医生工作台
              </h1>
              <p className="text-sm text-gray-600">
                {doctor?.name} ({doctorId}) - {doctor?.department}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout} 
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-emerald-50">
                <TabsTrigger 
                  value="pending" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700"
                >
                  <Clock className="w-4 h-4" />
                  待就诊
                  {pendingVisits.length > 0 && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {pendingVisits.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700"
                >
                  <FileText className="w-4 h-4" />
                  已就诊
                  {completedVisits.length > 0 && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {completedVisits.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      共 {pendingVisits.length} 位待就诊患者
                    </p>
                    <Button 
                      onClick={() => setShowWaitingRoom(true)}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Stethoscope className="w-4 h-4" />
                      进入待就诊管理
                    </Button>
                  </div>
                  {pendingVisits.map(visit => (
                    <Card 
                      key={visit.visitId} 
                      className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-yellow-400 cursor-pointer"
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{visit.patientName}</h3>
                            <p className="text-sm text-gray-600">患者ID: {visit.patientId}</p>
                            <p className="text-sm text-gray-700">{visit.chiefComplaint}</p>
                            <p className="text-xs text-gray-500">{visit.visitDate}</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          待就诊
                        </Badge>
                      </div>
                    </Card>
                  ))}
                  {pendingVisits.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>暂无待就诊患者</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {completedVisits.map(visit => (
                    <Card 
                      key={visit.visitId} 
                      className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-400 cursor-pointer"
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{visit.patientName}</h3>
                            <p className="text-sm text-gray-600">患者ID: {visit.patientId}</p>
                            <p className="text-sm text-gray-700">{visit.chiefComplaint}</p>
                            <p className="text-xs text-gray-500">{visit.visitDate}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          已就诊
                        </Badge>
                      </div>
                    </Card>
                  ))}
                  {completedVisits.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>暂无已就诊记录</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}