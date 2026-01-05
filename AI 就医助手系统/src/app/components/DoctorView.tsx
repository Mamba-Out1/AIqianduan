import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Search,
  Mic,
  StopCircle,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  QrCode,
  Sparkles,
  Download,
  RefreshCw,
  Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SpeechTranscription } from '../utils/speechTranscription';
import { MedicalSummaryPanel } from './MedicalSummaryPanel';
import { medicalSummaryAPI } from '../utils/medicalAPI';
import { visitsAPI, Visit, getStatusText, getStatusColor } from '../utils/visitsAPI';
import { WaitingRoomView } from './WaitingRoomView';

interface DoctorViewProps {
  accessibilityMode: boolean;
}

interface Patient {
  id: string;
  visitId: string;
  patientId: string;
  name: string;
  doctorId: string;
  visitType: string;
  visitDate: string;
  status: string;
  chiefComplaint: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsultationRecord {
  patientId: string;
  patientName: string;
  transcript: string;
  timestamp: Date;
  generatedSummary?: string;
}

interface MedicalSummary {
  summaryId: string;
  visitId: string;
  content: string;
  status: 'generating' | 'completed' | 'error';
  timestamp: Date;
  isStreaming?: boolean;
}

export function DoctorView({ accessibilityMode }: DoctorViewProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'waiting-room'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [consultationTranscript, setConsultationTranscript] = useState('');
  const [consultationRecords, setConsultationRecords] = useState<ConsultationRecord[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'ready' | 'recording' | 'processing' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState('');
  
  const speechTranscription = useRef(new SpeechTranscription());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDoctorId = 'doctor_001'; // 当前医生ID，实际应用中从登录状态获取

  // 如果当前视图是待就诊界面且有选中的患者，直接渲染
  if (currentView === 'waiting-room' && selectedPatient) {
    // 转换为Visit类型
    const visitPatient: Visit = {
      id: parseInt(selectedPatient.id),
      visitId: selectedPatient.visitId,
      patientId: selectedPatient.patientId,
      patientName: selectedPatient.name,
      doctorId: selectedPatient.doctorId,
      visitType: selectedPatient.visitType,
      visitDate: selectedPatient.visitDate,
      status: selectedPatient.status,
      chiefComplaint: selectedPatient.chiefComplaint,
      notes: selectedPatient.notes,
      createdAt: selectedPatient.createdAt,
      updatedAt: selectedPatient.updatedAt
    };
    
    return (
      <WaitingRoomView 
        accessibilityMode={accessibilityMode}
        patient={visitPatient}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedPatient(null);
        }}
      />
    );
  }

  // 加载患者数据
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await visitsAPI.getVisitsByDoctor(currentDoctorId);
      const patientData = response.visits.map(visit => ({
        id: visit.id.toString(),
        visitId: visit.visitId,
        patientId: visit.patientId,
        name: visit.patientName,
        doctorId: visit.doctorId,
        visitType: visit.visitType,
        visitDate: visit.visitDate,
        status: visit.status,
        chiefComplaint: visit.chiefComplaint || '未填写',
        notes: visit.notes || '',
        createdAt: visit.createdAt,
        updatedAt: visit.updatedAt
      }));
      setPatients(patientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载患者数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualizerRef.current) clearInterval(visualizerRef.current);
    };
  }, []);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startVisualizer = () => {
    const bars = Array(32).fill(0);
    setVisualizerData(bars);
    
    visualizerRef.current = setInterval(() => {
      const data = speechTranscription.current.getAudioVisualizationData();
      if (data) {
        const newBars = Array(32).fill(0).map((_, index) => {
          const value = data[Math.floor(index * data.length / 32)];
          return Math.max(5, (value / 255) * 50);
        });
        setVisualizerData(newBars);
      }
    }, 50);
  };

  const stopVisualizer = () => {
    if (visualizerRef.current) {
      clearInterval(visualizerRef.current);
      visualizerRef.current = null;
    }
    setVisualizerData([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredPatients = patients.filter(patient => 
    (patient.name || '').includes(searchQuery) || 
    (patient.chiefComplaint || '').includes(searchQuery)
  );

  // 扫码获取患者信息
  const scanPatientQRCode = () => {
    if (patients.length > 0) {
      setSelectedPatient(patients[0]);
    }
  };

  // 真实语音问诊记录
  const startConsultationRecording = async () => {
    try {
      setTranscriptionStatus('recording');
      setConsultationTranscript('');
      setErrorMessage('');
      
      await speechTranscription.current.startRecording();
      setIsRecording(true);
      
      startTimer();
      startVisualizer();
    } catch (error) {
      setTranscriptionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '录音启动失败');
    }
  };

  const stopConsultationRecording = async () => {
    try {
      setTranscriptionStatus('processing');
      setIsRecording(false);
      
      stopTimer();
      stopVisualizer();
      
      const audioBlob = await speechTranscription.current.stopRecording();
      
      const result = await speechTranscription.current.transcribeAudio(audioBlob, {
        userId: currentDoctorId,
        visitId: selectedPatient ? selectedPatient.visitId : `visit_${Date.now()}`,
        language: 'autodialect',
        domain: 'medical'
      });
      
      if (result.status === 'SUCCESS' && result.transcriptionText) {
        setConsultationTranscript(result.transcriptionText);
        setTranscriptionStatus('ready');
      } else {
        setTranscriptionStatus('error');
        setErrorMessage(result.errorMessage || '转录失败');
      }
    } catch (error) {
      setTranscriptionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '处理录音失败');
      setIsRecording(false);
      stopTimer();
      stopVisualizer();
    }
  };

  // 测试API接口
  const testAPIConnection = async () => {
    try {
      const summaries = await medicalSummaryAPI.getAllSummaries();
      
      alert(`API连接测试成功！\n病历总结数量: ${summaries.length}`);
    } catch (error) {
      alert(`API连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const generateMedicalRecord = () => {
    if (!selectedPatient || !consultationTranscript) return;

    const summary = `【病历摘要】
患者姓名：${selectedPatient.name}
患者ID：${selectedPatient.patientId}
就诊时间：${new Date().toLocaleString('zh-CN')}
就诊类型：${selectedPatient.visitType}

主诉：${selectedPatient.chiefComplaint}

问诊记录：
${consultationTranscript}

备注：${selectedPatient.notes}

医生签名：${currentDoctorId}
日期：${new Date().toLocaleDateString('zh-CN')}`;

    const newRecord: ConsultationRecord = {
      patientId: selectedPatient.patientId,
      patientName: selectedPatient.name,
      transcript: consultationTranscript,
      timestamp: new Date(),
      generatedSummary: summary
    };

    setConsultationRecords([newRecord, ...consultationRecords]);
    alert('病历总结已生成！');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* 左侧：患者列表 */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2>待诊患者</h2>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索患者姓名或症状"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 进入待就诊界面 */}
            <Button 
              onClick={() => setCurrentView('waiting-room')}
              className="w-full mb-4 gap-2"
            >
              <Users className="w-4 h-4" />
              进入待就诊界面
            </Button>

            {/* 刷新数据 */}
            <Button 
              onClick={loadPatients}
              variant="outline" 
              className="w-full mb-4 gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新患者列表
            </Button>

            {/* 扫码功能 */}
            <Button 
              onClick={scanPatientQRCode}
              variant="outline" 
              className="w-full mb-4 gap-2"
              disabled={patients.length === 0}
            >
              <QrCode className="w-4 h-4" />
              扫描患者就诊码
            </Button>

            {/* API测试按钮 */}
            <Button 
              onClick={testAPIConnection}
              variant="outline" 
              className="w-full mb-4 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              测试API连接
            </Button>

            {/* 患者列表 */}
            <ScrollArea className="h-[500px]">
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
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>暂无患者数据</p>
                  <p className="text-sm">请检查后端服务是否正常运行</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setCurrentView('waiting-room');
                      }}
                      className="border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={accessibilityMode ? 'text-lg' : ''}>
                          {patient.name}
                        </span>
                        <Badge className={getStatusColor(patient.status)}>
                          {getStatusText(patient.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>患者ID: {patient.patientId}</p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(patient.visitDate).toLocaleString('zh-CN')}
                        </p>
                        <p className="text-gray-900">{patient.chiefComplaint}</p>
                        <p className="text-xs text-gray-500">就诊类型: {patient.visitType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

        {/* 中间和右侧：患者详情与问诊 */}
        <div className="md:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* 患者基本信息 */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2>患者信息</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      导入HIS系统
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">患者姓名</p>
                      <p className={accessibilityMode ? 'text-lg' : ''}>
                        {selectedPatient.name}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">患者ID</p>
                      <p className={accessibilityMode ? 'text-lg' : ''}>
                        {selectedPatient.patientId}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">就诊时间</p>
                      <p className={accessibilityMode ? 'text-lg' : ''}>
                        {new Date(selectedPatient.visitDate).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">就诊类型</p>
                      <p className={accessibilityMode ? 'text-lg' : ''}>
                        {selectedPatient.visitType}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 mb-1">主诉</p>
                    <p className={`${accessibilityMode ? 'text-lg' : ''} text-gray-900`}>
                      {selectedPatient.chiefComplaint}
                    </p>
                  </div>

                  {selectedPatient.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">备注</p>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className={`${accessibilityMode ? 'text-lg' : ''} text-gray-700`}>
                            {selectedPatient.notes}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-900">就诊状态：{getStatusText(selectedPatient.status)}</p>
                      <p className="text-blue-700">
                        就诊ID: {selectedPatient.visitId}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI 病例总结面板 */}
              <Card className="p-6">
                <MedicalSummaryPanel 
                  patientId={selectedPatient.patientId}
                  patientName={selectedPatient.name}
                  visitId={selectedPatient.visitId}
                  doctorId={selectedPatient.doctorId}
                  accessibilityMode={accessibilityMode}
                  onSummaryGenerated={(summary) => {
                    console.log('病例总结生成完成:', summary);
                  }}
                />
              </Card>

              {/* 问诊记录 */}
              <Card className="p-6">
                <Tabs defaultValue="recording">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recording">语音问诊</TabsTrigger>
                    <TabsTrigger value="records">
                      历史记录
                      {consultationRecords.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {consultationRecords.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="recording" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Mic className="w-6 h-6 text-blue-600" />
                      <h3>语音问诊记录</h3>
                    </div>

                    {/* 录音区域 */}
                    <div className={`
                      border-2 rounded-lg p-6 transition-all
                      ${isRecording 
                        ? 'border-red-500 bg-red-50' 
                        : transcriptionStatus === 'processing'
                        ? 'border-blue-500 bg-blue-50'
                        : transcriptionStatus === 'error'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                      }
                    `}>
                      {isRecording ? (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Mic className="w-8 h-8 text-red-500 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
                          </div>
                          <div className="flex-1">
                            <p className="text-red-600">正在录音...</p>
                            <p className="text-sm text-gray-600">
                              系统正在记录您与患者的对话
                            </p>
                            <div className="text-lg font-bold text-red-600 mt-1">
                              {formatTime(recordingTime)}
                            </div>
                          </div>
                        </div>
                      ) : transcriptionStatus === 'processing' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <div>
                            <p className="text-blue-600">正在处理音频...</p>
                            <p className="text-sm text-gray-600">
                              AI正在转录问诊对话
                            </p>
                          </div>
                        </div>
                      ) : transcriptionStatus === 'error' ? (
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-8 h-8 text-red-500" />
                          <div>
                            <p className="text-red-600">录音失败</p>
                            <p className="text-sm text-gray-600">{errorMessage}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Mic className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="text-gray-600">点击开始录制问诊对话</p>
                            <p className="text-sm text-gray-500">
                              AI 将自动生成结构化病历摘要
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 音频可视化 */}
                    {isRecording && visualizerData.length > 0 && (
                      <div className="flex justify-center items-end h-16 mt-4 gap-1">
                        {visualizerData.map((height, index) => (
                          <div
                            key={index}
                            className="w-1 bg-red-500 rounded-sm transition-all duration-100"
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                    )}

                    {/* 实时转写 */}
                    {consultationTranscript && (
                      <div className="border rounded-lg p-4 bg-white">
                        <p className="text-sm text-gray-600 mb-2">实时转写：</p>
                        <ScrollArea className="h-[200px]">
                          <pre className={`${accessibilityMode ? 'text-lg' : ''} whitespace-pre-wrap`}>
                            {consultationTranscript}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}

                    {/* 控制按钮 */}
                    <div className="flex gap-3">
                      {!isRecording && transcriptionStatus !== 'processing' ? (
                        <Button 
                          onClick={startConsultationRecording}
                          className="gap-2"
                          disabled={transcriptionStatus === 'error'}
                        >
                          <Mic className="w-4 h-4" />
                          开始问诊录音
                        </Button>
                      ) : isRecording ? (
                        <Button 
                          onClick={stopConsultationRecording}
                          variant="destructive"
                          className="gap-2"
                        >
                          <StopCircle className="w-4 h-4" />
                          停止录音
                        </Button>
                      ) : null}
                      
                      {consultationTranscript && !isRecording && transcriptionStatus === 'ready' && (
                        <Button 
                          onClick={generateMedicalRecord}
                          className="gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          AI 生成病历总结
                        </Button>
                      )}
                      
                      {transcriptionStatus === 'error' && (
                        <Button 
                          onClick={() => {
                            setTranscriptionStatus('ready');
                            setErrorMessage('');
                          }}
                          variant="outline"
                          className="gap-2"
                        >
                          重新开始
                        </Button>
                      )}
                    </div>

                    {consultationTranscript && !isRecording && transcriptionStatus === 'ready' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-green-900 mb-1">
                            语音转录完成
                          </p>
                          <p className="text-sm text-green-700">
                            点击"AI 生成病历总结"按钮，系统将自动生成结构化病历
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="records" className="space-y-4">
                    {consultationRecords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>暂无问诊记录</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {consultationRecords.map((record, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p>{record.patientName}</p>
                                  <p className="text-sm text-gray-500">
                                    {record.timestamp.toLocaleString('zh-CN')}
                                  </p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Download className="w-3 h-3" />
                                  导出
                                </Button>
                              </div>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full">
                                    查看完整病历
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>病历总结</DialogTitle>
                                  </DialogHeader>
                                  <ScrollArea className="h-[500px]">
                                    <pre className="whitespace-pre-wrap text-sm">
                                      {record.generatedSummary}
                                    </pre>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2">请选择患者</h3>
              <p className="text-gray-600">
                从左侧列表选择患者或扫描患者就诊码
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
