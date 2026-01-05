import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User,
  FileText,
  Mic,
  StopCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { visitsAPI, Visit } from '../utils/visitsAPI';
import { SpeechTranscription } from '../utils/speechTranscription';
import { medicalSummaryAPI } from '../utils/medicalAPI';

interface NewWaitingRoomProps {
  accessibilityMode: boolean;
  onBack: () => void;
}

interface MedicalSummary {
  symptom_details: string;
  vital_signs: string;
  past_medical_history: string;
  current_medications: string;
}

export function NewWaitingRoom({ accessibilityMode, onBack }: NewWaitingRoomProps) {
  const [patients, setPatients] = useState<Visit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 语音转录相关状态
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'ready' | 'recording' | 'processing' | 'error'>('ready');
  
  // 病例总结相关状态
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  
  const speechTranscription = useRef(new SpeechTranscription());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDoctorId = 'doctor_001';

  useEffect(() => {
    loadPatients();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await visitsAPI.getVisitsByDoctor(currentDoctorId);
      const waitingPatients = response.visits.filter(visit => 
        visit.status === 'SCHEDULED' || visit.status === 'IN_PROGRESS'
      );
      
      setPatients(waitingPatients);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载患者数据失败');
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = (patient: Visit) => {
    // 如果选择了不同的患者，才重置病例总结
    if (selectedPatient?.visitId !== patient.visitId) {
      setSummary(null);
    }
    
    setSelectedPatient(patient);
    // 重置语音转录状态
    setTranscript('');
    setTranscriptionStatus('ready');
    setSummaryError('');
  };

  const startRecording = async () => {
    try {
      setTranscriptionStatus('recording');
      setTranscript('');
      await speechTranscription.current.startRecording();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      setTranscriptionStatus('error');
      console.error('录音启动失败:', error);
    }
  };

  const stopRecording = async () => {
    if (!selectedPatient) return;
    
    try {
      setTranscriptionStatus('processing');
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const audioBlob = await speechTranscription.current.stopRecording();
      
      const result = await speechTranscription.current.transcribeAudio(audioBlob, {
        userId: currentDoctorId,
        visitId: selectedPatient.visitId,
        language: 'autodialect',
        domain: 'medical'
      });
      
      if (result.status === 'SUCCESS' && result.transcriptionText) {
        setTranscript(result.transcriptionText);
        setTranscriptionStatus('ready');
        // 自动生成病例总结
        generateSummary(result.transcriptionText);
      } else {
        setTranscriptionStatus('error');
      }
    } catch (error) {
      setTranscriptionStatus('error');
      console.error('处理录音失败:', error);
    }
  };

  const generateSummary = async (transcriptText?: string) => {
    if (!selectedPatient || (!transcript && !transcriptText)) return;
    
    try {
      setIsGeneratingSummary(true);
      setSummaryError('');
      
      const response = await medicalSummaryAPI.generateSummaryStream(
        selectedPatient.visitId,
        currentDoctorId,
        selectedPatient.patientId
      );

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      
      // 读取完整响应
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value);
      }
      
      // 解析病例总结内容
      let summaryData: MedicalSummary = {
        symptom_details: '',
        vital_signs: '',
        past_medical_history: '',
        current_medications: ''
      };
      
      try {
        // 查找包含properties的JSON数据
        const symptomMatch = fullResponse.match(/"symptom_details"\s*:\s*{\s*"description"\s*:\s*"([^"]*)"/); 
        const vitalMatch = fullResponse.match(/"vital_signs"\s*:\s*{\s*"description"\s*:\s*"([^"]*)"/); 
        const historyMatch = fullResponse.match(/"past_medical_history"\s*:\s*{\s*"description"\s*:\s*"([^"]*)"/); 
        const medicationMatch = fullResponse.match(/"current_medications"\s*:\s*{\s*"description"\s*:\s*"([^"]*)"/); 
        
        summaryData = {
          symptom_details: symptomMatch ? symptomMatch[1] : '暂无记录',
          vital_signs: vitalMatch ? vitalMatch[1] : '暂无记录',
          past_medical_history: historyMatch ? historyMatch[1] : '暂无记录',
          current_medications: medicationMatch ? medicationMatch[1] : '暂无记录'
        };
      } catch (parseError) {
        console.warn('解析病例总结内容失败:', parseError);
        summaryData = {
          symptom_details: '解析失败',
          vital_signs: '解析失败',
          past_medical_history: '解析失败',
          current_medications: '解析失败'
        };
      }
      
      setSummary(summaryData);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : '生成病例总结失败');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const completeVisit = async () => {
    if (!selectedPatient) return;
    
    try {
      setIsCompleting(true);
      await visitsAPI.completeVisit(selectedPatient.visitId);
      
      alert('就诊已完成！');
      // 清理当前患者状态
      setSelectedPatient(null);
      setSummary(null);
      setTranscript('');
      setTranscriptionStatus('ready');
      setSummaryError('');
      loadPatients(); // 重新加载患者列表
    } catch (err) {
      alert('完成就诊失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // 如果选中了患者，显示患者就诊界面
  if (selectedPatient) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => setSelectedPatient(null)} variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回患者列表
          </Button>
          <h1 className="text-2xl font-bold">患者就诊 - {selectedPatient.patientName}</h1>
        </div>

        <div className="space-y-6">
          {/* 患者信息卡片 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">患者信息</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">患者姓名</p>
                <p className={accessibilityMode ? 'text-lg' : ''}>{selectedPatient.patientName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">患者ID</p>
                <p className={accessibilityMode ? 'text-lg' : ''}>{selectedPatient.patientId}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">就诊日期</p>
                <p className={accessibilityMode ? 'text-lg' : ''}>
                  {new Date(selectedPatient.visitDate).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">就诊类型</p>
                <p className={accessibilityMode ? 'text-lg' : ''}>{selectedPatient.visitType}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">患者主诉</p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className={accessibilityMode ? 'text-lg' : ''}>
                    {selectedPatient.chiefComplaint || '未填写'}
                  </p>
                </div>
              </div>

              {selectedPatient.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">患者病情</p>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className={accessibilityMode ? 'text-lg' : ''}>{selectedPatient.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 语音转录卡片 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold">语音转录</h2>
            </div>

            <div className={`border-2 rounded-lg p-6 transition-all mb-4 ${
              isRecording 
                ? 'border-red-500 bg-red-50' 
                : transcriptionStatus === 'processing'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}>
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Mic className="w-8 h-8 text-red-500 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-600 font-medium">正在录音...</p>
                    <div className="text-lg font-bold text-red-600 mt-1">
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                </div>
              ) : transcriptionStatus === 'processing' ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-blue-600 font-medium">正在处理音频...</p>
                    <p className="text-sm text-gray-600">AI正在转录对话</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Mic className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-gray-600">点击开始录制问诊对话</p>
                    <p className="text-sm text-gray-500">录音完成后将自动生成病例总结</p>
                  </div>
                </div>
              )}
            </div>

            {transcript && (
              <div className="border rounded-lg p-4 bg-white mb-4">
                <p className="text-sm text-gray-600 mb-2">转录结果：</p>
                <ScrollArea className="h-[150px]">
                  <p className={accessibilityMode ? 'text-lg' : ''}>{transcript}</p>
                </ScrollArea>
              </div>
            )}

            <div className="flex gap-3">
              {!isRecording && transcriptionStatus !== 'processing' ? (
                <Button onClick={startRecording} className="gap-2">
                  <Mic className="w-4 h-4" />
                  开始录音
                </Button>
              ) : isRecording ? (
                <Button onClick={stopRecording} variant="destructive" className="gap-2">
                  <StopCircle className="w-4 h-4" />
                  停止录音
                </Button>
              ) : null}
              
              {transcript && !isRecording && transcriptionStatus === 'ready' && !isGeneratingSummary && (
                <Button onClick={() => generateSummary()} disabled={isGeneratingSummary} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  重新生成总结
                </Button>
              )}
            </div>
          </Card>

          {/* 病例总结卡片 */}
          {(summary || isGeneratingSummary || summaryError) && (
            <Card className="p-6 summary-section">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold">病例总结</h2>
              </div>

              {summaryError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-900">生成失败: {summaryError}</p>
                  </div>
                </div>
              )}

              {isGeneratingSummary && (
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                  <div>
                    <p className="text-green-600 font-medium">AI正在生成病例总结...</p>
                    <p className="text-sm text-gray-600">分析症状、体征和病史</p>
                  </div>
                </div>
              )}

              {summary && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">病例总结已生成</span>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">患者症状</h4>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className={accessibilityMode ? 'text-lg' : ''}>{summary.symptom_details || '暂无记录'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">生命体征</h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className={accessibilityMode ? 'text-lg' : ''}>{summary.vital_signs || '暂无记录'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">既往病史</h4>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className={accessibilityMode ? 'text-lg' : ''}>{summary.past_medical_history || '暂无记录'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">当前用药</h4>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className={accessibilityMode ? 'text-lg' : ''}>{summary.current_medications || '暂无记录'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* 完成就诊按钮 */}
          {summary && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">完成就诊</h3>
                  <p className="text-sm text-gray-600">确认病例总结无误后，点击完成就诊</p>
                </div>
                <Button 
                  onClick={completeVisit}
                  disabled={isCompleting}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isCompleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isCompleting ? '完成中...' : '完成就诊'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // 患者列表界面
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              待就诊患者
            </h1>
            <p className="text-sm text-gray-600">选择患者开始就诊</p>
          </div>
        </div>
        <Button onClick={loadPatients} variant="outline" size="sm" className="gap-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      <div className="patient-card-grid">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 processing-spinner text-blue-600 mr-3" />
            <span className="text-lg">加载患者数据中...</span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <p className="text-red-600 mb-2 text-lg">加载失败</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={loadPatients} variant="outline">
              重新加载
            </Button>
          </div>
        ) : patients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">暂无待就诊患者</p>
            <p className="text-sm">请检查后端服务是否正常运行</p>
          </div>
        ) : (
          patients.map((patient) => (
            <Card 
              key={patient.visitId}
              className="waiting-room-card p-6 cursor-pointer"
              onClick={() => selectPatient(patient)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{patient.patientName}</h3>
                    <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(patient.status)}>
                  {getStatusText(patient.status)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(patient.visitDate).toLocaleString('zh-CN')}</span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">主诉：</p>
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {patient.chiefComplaint || '未填写'}
                  </p>
                </div>

                {patient.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">病情：</p>
                    <p className="text-sm text-gray-800 line-clamp-2">{patient.notes}</p>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs text-gray-500">就诊类型: {patient.visitType}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button 
                  className="w-full gap-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    selectPatient(patient);
                  }}
                >
                  <Stethoscope className="w-4 h-4" />
                  开始就诊
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}