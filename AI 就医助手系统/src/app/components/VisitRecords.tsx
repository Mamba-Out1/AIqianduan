import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, User, Stethoscope, FileText, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { visitAPI, medicalSummaryAPI, type VisitRecord, type MedicalSummaryResponse } from '../utils/medicalAPI';
import { getVisitTypeDisplay } from '../utils/visitTypeUtils';

interface VisitRecordsProps {
  patientId: string;
  largeText: boolean;
  highContrast: boolean;
}

export function VisitRecords({ patientId, largeText, highContrast }: VisitRecordsProps) {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, MedicalSummaryResponse>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchVisitRecords();
  }, [patientId]);

  useEffect(() => {
    // 为已完成的就诊记录获取病历总结
    visits.forEach(visit => {
      if (visit.status === 'COMPLETED' && !summaries[visit.visitId] && !loadingSummaries[visit.visitId]) {
        fetchMedicalSummary(visit.visitId);
      }
    });
  }, [visits]);

  const fetchVisitRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await visitAPI.getPatientVisits(patientId);
      setVisits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      // 模拟数据用于演示
      setVisits([
        {
          id: 1,
          visitId: 'V001',
          patientId: patientId,
          patientName: '张三',
          doctorId: 'D001',
          visitType: 'CONSULTATION',
          visitDate: '2024-12-10',
          status: 'COMPLETED',
          chiefComplaint: '头痛、发热',
          notes: '患者主诉头痛3天，伴有发热，体温38.5°C，建议休息并服用退热药物。',
          createdAt: '2024-12-10T09:00:00',
          updatedAt: '2024-12-10T10:30:00',
          patient_name: '张三'
        },
        {
          id: 2,
          visitId: 'V002',
          patientId: patientId,
          patientName: '张三',
          doctorId: 'D002',
          visitType: 'FOLLOW_UP',
          visitDate: '2024-12-15',
          status: 'IN_PROGRESS',
          chiefComplaint: '复查血压',
          notes: '定期复查血压情况，调整用药方案。',
          createdAt: '2024-12-15T14:00:00',
          updatedAt: '2024-12-15T14:00:00',
          patient_name: '张三'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalSummary = async (visitId: string) => {
    try {
      setLoadingSummaries(prev => ({ ...prev, [visitId]: true }));
      const summary = await medicalSummaryAPI.getSummaryByVisit(visitId);
      setSummaries(prev => ({ ...prev, [visitId]: summary }));
    } catch (err) {
      console.error(`获取病历总结失败 (visitId: ${visitId}):`, err);
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [visitId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">已完成</Badge>;
    } else if (status === 'IN_PROGRESS') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">待就诊</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`text-gray-600 ${largeText ? 'text-xl' : ''}`}>加载就诊记录中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className={`text-red-600 ${largeText ? 'text-xl' : ''}`}>{error}</p>
          <Button onClick={fetchVisitRecords} variant="outline">
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-teal-600" />
        <h2 className={`font-semibold ${largeText ? 'text-2xl' : 'text-xl'} ${highContrast ? 'text-black' : 'text-gray-800'}`}>
          就诊记录
        </h2>
      </div>

      {visits.length === 0 ? (
        <Card className={`p-8 text-center ${highContrast ? 'bg-white border-black' : 'bg-white'}`}>
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-gray-600 ${largeText ? 'text-xl' : ''}`}>暂无就诊记录</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <Card 
              key={visit.id} 
              className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                highContrast ? 'bg-white border-2 border-black' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold ${largeText ? 'text-xl' : 'text-lg'} ${
                      highContrast ? 'text-black' : 'text-gray-800'
                    }`}>
                      {visit.patient_name || visit.patientName}
                    </h3>
                    <Badge variant="outline" className={largeText ? 'text-base px-3 py-1' : ''}>
                      {getVisitTypeDisplay(visit.visitType)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                        {formatDate(visit.visitDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                        医生ID: {visit.doctorId}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`text-gray-700 font-medium mb-1 ${largeText ? 'text-lg' : ''}`}>
                      主诉：
                    </p>
                    <p className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                      {visit.chiefComplaint}
                    </p>
                  </div>
                  
                  {/* 病历总结显示（仅已完成的就诊） */}
                  {visit.status === 'COMPLETED' && (
                    <div className="mb-4">
                      <p className={`text-gray-700 font-medium mb-2 ${largeText ? 'text-lg' : ''}`}>
                        病历总结：
                      </p>
                      {loadingSummaries[visit.visitId] ? (
                        <div className={`p-3 rounded-lg ${highContrast ? 'bg-gray-100 border border-black' : 'bg-blue-50'}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className={`text-gray-600 ${largeText ? 'text-lg' : 'text-sm'}`}>加载病历总结中...</span>
                          </div>
                        </div>
                      ) : summaries[visit.visitId] ? (
                        <div className={`p-3 rounded-lg space-y-2 ${highContrast ? 'bg-gray-100 border border-black' : 'bg-green-50'}`}>
                          {summaries[visit.visitId].symptomDetails && (
                            <div>
                              <span className={`font-medium text-gray-700 ${largeText ? 'text-base' : 'text-sm'}`}>症状详情：</span>
                              <span className={`text-gray-600 ml-2 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].symptomDetails}</span>
                            </div>
                          )}
                          {summaries[visit.visitId].vitalSigns && (
                            <div>
                              <span className={`font-medium text-gray-700 ${largeText ? 'text-base' : 'text-sm'}`}>生命体征：</span>
                              <span className={`text-gray-600 ml-2 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].vitalSigns}</span>
                            </div>
                          )}
                          {summaries[visit.visitId].currentMedications && (
                            <div>
                              <span className={`font-medium text-gray-700 ${largeText ? 'text-base' : 'text-sm'}`}>当前用药：</span>
                              <span className={`text-gray-600 ml-2 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].currentMedications}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg ${highContrast ? 'bg-gray-100 border border-black' : 'bg-gray-50'}`}>
                          <span className={`text-gray-500 ${largeText ? 'text-base' : 'text-sm'}`}>暂无病历总结</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(visit.status)}
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-full ${largeText ? 'text-lg py-3' : ''}`}
                  >
                    查看详细信息
                  </Button>
                </DialogTrigger>
                <DialogContent className={`max-w-2xl ${highContrast ? 'bg-white border-2 border-black' : ''}`}>
                  <DialogHeader>
                    <DialogTitle className={largeText ? 'text-2xl' : 'text-xl'}>
                      就诊详情 - {visit.visitId}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-6 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>患者姓名</Label>
                          <p className={`text-gray-700 ${largeText ? 'text-lg' : ''}`}>
                            {visit.patient_name || visit.patientName}
                          </p>
                        </div>
                        <div>
                          <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>就诊类型</Label>
                          <p className={`text-gray-700 ${largeText ? 'text-lg' : ''}`}>
                            {getVisitTypeDisplay(visit.visitType)}
                          </p>
                        </div>
                        <div>
                          <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>医生ID</Label>
                          <p className={`text-gray-700 ${largeText ? 'text-lg' : ''}`}>
                            {visit.doctorId}
                          </p>
                        </div>
                        <div>
                          <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>就诊日期</Label>
                          <p className={`text-gray-700 ${largeText ? 'text-lg' : ''}`}>
                            {formatDate(visit.visitDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>患者主诉</Label>
                        <div className={`mt-2 p-4 bg-gray-50 rounded-lg ${
                          highContrast ? 'bg-gray-100 border border-black' : ''
                        }`}>
                          <p className={`text-gray-700 ${largeText ? 'text-lg' : ''}`}>
                            {visit.chiefComplaint}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>患者病情</Label>
                        <div className={`mt-2 p-4 bg-gray-50 rounded-lg ${
                          highContrast ? 'bg-gray-100 border border-black' : ''
                        }`}>
                          <p className={`text-gray-700 ${largeText ? 'text-lg' : ''} whitespace-pre-wrap`}>
                            {visit.notes}
                          </p>
                        </div>
                      </div>
                      
                      {/* 病历总结详情（仅已完成的就诊） */}
                      {visit.status === 'COMPLETED' && summaries[visit.visitId] && (
                        <div>
                          <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>病历总结</Label>
                          <div className={`mt-2 space-y-3`}>
                            {summaries[visit.visitId].symptomDetails && (
                              <div className={`p-3 bg-gray-50 rounded-lg ${
                                highContrast ? 'bg-gray-100 border border-black' : ''
                              }`}>
                                <p className={`font-medium text-gray-700 mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>症状详情</p>
                                <p className={`text-gray-600 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].symptomDetails}</p>
                              </div>
                            )}
                            {summaries[visit.visitId].vitalSigns && (
                              <div className={`p-3 bg-gray-50 rounded-lg ${
                                highContrast ? 'bg-gray-100 border border-black' : ''
                              }`}>
                                <p className={`font-medium text-gray-700 mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>生命体征</p>
                                <p className={`text-gray-600 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].vitalSigns}</p>
                              </div>
                            )}
                            {summaries[visit.visitId].pastMedicalHistory && (
                              <div className={`p-3 bg-gray-50 rounded-lg ${
                                highContrast ? 'bg-gray-100 border border-black' : ''
                              }`}>
                                <p className={`font-medium text-gray-700 mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>既往病史</p>
                                <p className={`text-gray-600 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].pastMedicalHistory}</p>
                              </div>
                            )}
                            {summaries[visit.visitId].currentMedications && (
                              <div className={`p-3 bg-gray-50 rounded-lg ${
                                highContrast ? 'bg-gray-100 border border-black' : ''
                              }`}>
                                <p className={`font-medium text-gray-700 mb-1 ${largeText ? 'text-base' : 'text-sm'}`}>当前用药</p>
                                <p className={`text-gray-600 ${largeText ? 'text-base' : 'text-sm'}`}>{summaries[visit.visitId].currentMedications}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className={`font-medium ${largeText ? 'text-lg' : ''}`}>创建时间</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <p className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                            {formatDateTime(visit.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>{children}</label>;
}