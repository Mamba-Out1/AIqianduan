import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Stethoscope, LogOut, User, Clock, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { NewWaitingRoom } from './NewWaitingRoom';
import { CompletedVisitView } from './CompletedVisitView';

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
  const [viewMode, setViewMode] = useState<'dashboard' | 'waiting' | 'completed'>('dashboard');

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

  // 待就诊流程
  if (viewMode === 'waiting') {
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
          onBack={() => setViewMode('dashboard')} 
          doctorId={doctorId}
        />
      </div>
    );
  }

  // 已就诊患者查看
  if (viewMode === 'completed' && selectedVisit) {
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
                  医生工作台 - 已就诊查看
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
        <CompletedVisitView 
          accessibilityMode={accessibilityMode} 
          onBack={() => {
            setViewMode('dashboard');
            setSelectedVisit(null);
          }} 
          visit={selectedVisit}
          doctorId={doctorId}
        />
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
                <div className="text-center py-12">
                  <Stethoscope className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                  <h3 className="text-xl font-semibold mb-2">待就诊管理</h3>
                  <p className="text-gray-600 mb-6">
                    共 {pendingVisits.length} 位待就诊患者
                  </p>
                  <Button 
                    onClick={() => setViewMode('waiting')}
                    size="lg"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Stethoscope className="w-5 h-5" />
                    开始就诊
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {completedVisits.map(visit => (
                    <Card 
                      key={visit.visitId} 
                      className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-400 cursor-pointer"
                      onClick={() => {
                        setSelectedVisit(visit);
                        setViewMode('completed');
                      }}
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