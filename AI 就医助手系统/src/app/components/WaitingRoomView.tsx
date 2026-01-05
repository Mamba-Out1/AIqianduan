import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  User,
  FileText,
  Mic,
  StopCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { visitsAPI, Visit } from '../utils/visitsAPI';
import { SpeechTranscription } from '../utils/speechTranscription';
import { medicalSummaryAPI } from '../utils/medicalAPI';

interface WaitingRoomViewProps {
  accessibilityMode: boolean;
  patient: Visit;
  onBack: () => void;
}

interface MedicalSummary {
  symptom_details: string;
  vital_signs: string;
  past_medical_history: string;
  current_medications: string;
}

export function WaitingRoomView({ accessibilityMode, patient, onBack }: WaitingRoomViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'ready' | 'recording' | 'processing' | 'error'>('ready');
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  
  const speechTranscription = useRef(new SpeechTranscription());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDoctorId = 'doctor_001';

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        visitId: patient.visitId,
        language: 'autodialect',
        domain: 'medical'
      });
      
      if (result.status === 'SUCCESS' && result.transcriptionText) {
        setTranscript(result.transcriptionText);
        setTranscriptionStatus('ready');
      } else {
        setTranscriptionStatus('error');
      }
    } catch (error) {
      setTranscriptionStatus('error');
      console.error('处理录音失败:', error);
    }
  };

  const generateSummary = async () => {
    if (!transcript) return;
    
    try {
      setIsGeneratingSummary(true);
      setSummaryError('');
      
      const response = await medicalSummaryAPI.generateSummaryStream(
        patient.visitId,
        currentDoctorId,
        patient.patientId
      );

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let summaryData: MedicalSummary = {
        symptom_details: '',
        vital_signs: '',
        past_medical_history: '',
        current_medications: ''
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.event === 'message' && data.content) {
                try {
                  const parsedContent = JSON.parse(data.content);
                  if (parsedContent.properties) {
                    summaryData = {
                      symptom_details: parsedContent.properties.symptom_details?.description || '',
                      vital_signs: parsedContent.properties.vital_signs?.description || '',
                      past_medical_history: parsedContent.properties.past_medical_history?.description || '',
                      current_medications: parsedContent.properties.current_medications?.description || ''
                    };
                    setSummary(summaryData);
                  }
                } catch (parseError) {
                  console.warn('解析病例总结内容失败:', parseError);
                }
              } else if (data.event === 'completed') {
                break;
              } else if (data.event === 'error') {
                throw new Error(data.message || '生成失败');
              }
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : '生成病例总结失败');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const completeVisit = async () => {
    try {
      setIsCompleting(true);
      await visitsAPI.completeVisit(patient.visitId);
      
      alert('就诊已完成！');
      onBack();
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回患者列表
        </Button>
        <h1 className="text-2xl font-bold">患者就诊 - {patient.patientName}</h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h2>患者信息</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">患者姓名</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>{patient.patientName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">患者ID</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>{patient.patientId}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">就诊日期</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>
                {new Date(patient.visitDate).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">就诊类型</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>{patient.visitType}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">患者主诉</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className={accessibilityMode ? 'text-lg' : ''}>
                  {patient.chiefComplaint || '未填写'}
                </p>
              </div>
            </div>

            {patient.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">患者病情</p>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className={accessibilityMode ? 'text-lg' : ''}>{patient.notes}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-6 h-6 text-purple-600" />
            <h2>语音转录</h2>
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
                  <p className="text-red-600">正在录音...</p>
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
            
            {transcript && !isRecording && transcriptionStatus === 'ready' && (
              <Button onClick={generateSummary} disabled={isGeneratingSummary} className="gap-2">
                {isGeneratingSummary ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                生成病例总结
              </Button>
            )}
          </div>
        </Card>

        {(summary || isGeneratingSummary || summaryError) && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h2>病例总结</h2>
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
                  <p className="text-green-600">AI正在生成病例总结...</p>
                  <p className="text-sm text-gray-600">分析症状、体征和病史</p>
                </div>
              </div>
            )}

            {summary && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">病例总结已生成</span>
                </div>

                <div className="grid gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">症状详情</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className={accessibilityMode ? 'text-lg' : ''}>{summary.symptom_details}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">生命体征</h4>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className={accessibilityMode ? 'text-lg' : ''}>{summary.vital_signs}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">既往病史</h4>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className={accessibilityMode ? 'text-lg' : ''}>{summary.past_medical_history}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">当前用药</h4>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className={accessibilityMode ? 'text-lg' : ''}>{summary.current_medications}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

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
                className="gap-2"
              >
                {isCompleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                完成就诊
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}