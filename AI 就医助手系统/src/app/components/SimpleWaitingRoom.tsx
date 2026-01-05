import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { visitsAPI, Visit } from '../utils/visitsAPI';

interface SimpleWaitingRoomProps {
  accessibilityMode: boolean;
  onBack: () => void;
}

export function SimpleWaitingRoom({ accessibilityMode, onBack }: SimpleWaitingRoomProps) {
  const [patients, setPatients] = useState<Visit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentDoctorId = 'doctor_001';

  // 加载患者数据
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('开始加载患者数据...');
      
      const response = await visitsAPI.getVisitsByDoctor(currentDoctorId);
      console.log('API响应:', response);
      
      const waitingPatients = response.visits.filter(visit => 
        visit.status === 'SCHEDULED' || visit.status === 'IN_PROGRESS'
      );
      
      console.log('待就诊患者:', waitingPatients);
      setPatients(waitingPatients);
    } catch (err) {
      console.error('加载患者数据失败:', err);
      setError(err instanceof Error ? err.message : '加载患者数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '已预约';
      case 'IN_PROGRESS': return '就诊中';
      default: return '未知';
    }
  };

  console.log('当前状态:', { loading, error, patients: patients.length, selectedPatient });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-2xl font-bold">待就诊患者 (测试版)</h1>
        <Button onClick={loadPatients} variant="outline" size="sm" className="gap-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 左侧：患者列表 */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2>待就诊列表 ({patients.length})</h2>
            </div>

            <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
              <p>调试信息:</p>
              <p>加载中: {loading ? '是' : '否'}</p>
              <p>错误: {error || '无'}</p>
              <p>患者数量: {patients.length}</p>
              <p>选中患者: {selectedPatient ? selectedPatient.patientName : '无'}</p>
            </div>

            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                  <p className="text-red-600 mb-2">加载失败</p>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <Button onClick={loadPatients} variant="outline" size="sm">
                    重新加载
                  </Button>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>暂无待就诊患者</p>
                  <p className="text-sm">请检查后端服务是否正常运行</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient, index) => (
                    <div
                      key={`${patient.visitId}-${index}`}
                      onClick={() => {
                        console.log('点击患者:', patient);
                        setSelectedPatient(patient);
                      }}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all
                        ${selectedPatient?.visitId === patient.visitId 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {patient.patientName || '未知姓名'}
                        </span>
                        <Badge className={getStatusColor(patient.status)}>
                          {getStatusText(patient.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>患者ID: {patient.patientId}</p>
                        <p>就诊ID: {patient.visitId}</p>
                        <p>主诉: {patient.chiefComplaint || '未填写'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

        {/* 右侧：患者详情 */}
        <div className="md:col-span-2">
          {selectedPatient ? (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h2>患者信息</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">患者姓名</p>
                    <p>{selectedPatient.patientName || '未知'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">患者ID</p>
                    <p>{selectedPatient.patientId}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">就诊日期</p>
                    <p>{new Date(selectedPatient.visitDate).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">就诊类型</p>
                    <p>{selectedPatient.visitType}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">患者主诉</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p>{selectedPatient.chiefComplaint || '未填写'}</p>
                  </div>
                </div>

                {selectedPatient.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">患者病情</p>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p>{selectedPatient.notes}</p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm">
                    <strong>调试信息:</strong> 患者选择成功，visitId: {selectedPatient.visitId}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2">请选择患者</h3>
              <p className="text-gray-600">从左侧列表选择要就诊的患者</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}