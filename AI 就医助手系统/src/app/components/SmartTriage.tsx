import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { VoiceRecorder } from './VoiceRecorder';
import { Brain, User, Calendar, FileText, Mic, RefreshCw, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { getVisitTypeDisplay, VISIT_TYPE_MAP, type VisitType } from '../utils/visitTypeUtils';

interface SmartTriageProps {
  largeText: boolean;
  highContrast: boolean;
  patientId: string;
}

interface PatientInfo {
  patientName: string;
  visitDate: string;
  visitType: VisitType | '';
}

interface ChiefComplaint {
  transcript: string;
  summary: string;
}

type Step = 'patient-info' | 'symptom-recording' | 'summary-review' | 'registration';



export function SmartTriage({ largeText, highContrast, patientId }: SmartTriageProps) {
  const [currentStep, setCurrentStep] = useState<Step>('patient-info');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    patientName: '',
    visitDate: '',
    visitType: ''
  });
  const [chiefComplaint, setChiefComplaint] = useState<ChiefComplaint>({
    transcript: '',
    summary: ''
  });
  const [visitId, setVisitId] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePatientInfoSubmit = async () => {
    if (!patientInfo.patientName || !patientInfo.visitDate || !patientInfo.visitType) {
      setError('请填写完整的患者信息');
      return;
    }
    
    try {
      setError('');
      // 获取 visit_id
      const response = await fetch('/api/visits/next-visit-id');
      if (!response.ok) {
        throw new Error('获取就诊ID失败');
      }
      const data = await response.json();
      // 根据接口文档，响应格式为 {"key": "value"}，需要找到包含visitId的键
      const newVisitId = data.visitId || data.nextVisitId || Object.values(data)[0];
      if (!newVisitId) {
        throw new Error('服务器未返回有效的就诊ID');
      }
      
      setVisitId(newVisitId as string);
      setCurrentStep('symptom-recording');
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取就诊ID失败');
    }
  };

  const handleTranscriptComplete = (transcript: string) => {
    setChiefComplaint(prev => ({ ...prev, transcript }));
    setCurrentStep('summary-review');
  };

  const generateChiefComplaint = async () => {
    if (!chiefComplaint.transcript) {
      setError('请先完成病情录音');
      return;
    }
    if (!visitId) {
      setError('就诊ID不存在，请重新开始');
      return;
    }

    setIsGeneratingSummary(true);
    setError('');

    try {
      const doctorId = 'doctor_001';
      
      const response = await fetch(`/api/dify/chief-complaint/${visitId}?doctorId=${doctorId}&patientId=${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('生成病情概要失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let summary = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        summary += chunk;
        setChiefComplaint(prev => ({ ...prev, summary }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成病情概要失败');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleRetranscribe = () => {
    setChiefComplaint({ transcript: '', summary: '' });
    setCurrentStep('symptom-recording');
  };

  const handleRegenerate = () => {
    setChiefComplaint(prev => ({ ...prev, summary: '' }));
    generateChiefComplaint();
  };

  const handleSubmitRegistration = async () => {
    if (!visitId) {
      setError('就诊ID不存在，请重新开始');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const registrationData = {
        visitId: visitId,
        patientId: patientId,
        patientName: patientInfo.patientName,
        visitType: patientInfo.visitType,
        visitDate: patientInfo.visitDate,
        chiefComplaint: chiefComplaint.summary,
        notes: `转录内容: ${chiefComplaint.transcript}`
      };

      const response = await fetch('/api/visits/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error('挂号失败');
      }

      setSubmitSuccess(true);
      setCurrentStep('registration');
    } catch (err) {
      setError(err instanceof Error ? err.message : '挂号失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('patient-info');
    setPatientInfo({ patientName: '', visitDate: '', visitType: '' });
    setChiefComplaint({ transcript: '', summary: '' });
    setVisitId('');
    setSubmitSuccess(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-teal-600" />
        <h2 className={`font-semibold ${largeText ? 'text-2xl' : 'text-xl'} ${
          highContrast ? 'text-black' : 'text-gray-800'
        }`}>
          智慧导诊
        </h2>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { key: 'patient-info', label: '患者信息', icon: User },
          { key: 'symptom-recording', label: '病情录音', icon: Mic },
          { key: 'summary-review', label: '病情概要', icon: FileText },
          { key: 'registration', label: '提交挂号', icon: Send }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = [
            'patient-info',
            currentStep === 'symptom-recording' ? null : 'symptom-recording',
            ['summary-review', 'registration'].includes(currentStep) ? 'summary-review' : null,
            currentStep === 'registration' && submitSuccess ? 'registration' : null
          ].filter(Boolean).includes(step.key);
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                  : isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <Icon className="w-4 h-4" />
                <span className={`text-sm ${largeText ? 'text-base' : ''}`}>{step.label}</span>
              </div>
              {index < 3 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* 步骤1: 患者信息填写 */}
      {currentStep === 'patient-info' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-teal-600" />
              <h3 className={`font-semibold ${largeText ? 'text-xl' : 'text-lg'}`}>患者信息</h3>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">患者姓名</Label>
                <Input
                  id="patientName"
                  value={patientInfo.patientName}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="请输入患者姓名"
                  className={largeText ? 'text-lg' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitDate">就诊日期</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={patientInfo.visitDate}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, visitDate: e.target.value }))}
                  className={largeText ? 'text-lg' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitType">就诊类型</Label>
                <Select value={patientInfo.visitType} onValueChange={(value) => setPatientInfo(prev => ({ ...prev, visitType: value }))}>
                  <SelectTrigger className={largeText ? 'text-lg' : ''}>
                    <SelectValue placeholder="请选择就诊类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VISIT_TYPE_MAP).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handlePatientInfoSubmit} className="w-full">
              下一步：病情录音
            </Button>
          </div>
        </Card>
      )}

      {/* 步骤2: 病情录音 */}
      {currentStep === 'symptom-recording' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-teal-600" />
              <h3 className={`font-semibold ${largeText ? 'text-xl' : 'text-lg'}`}>病情录音</h3>
            </div>

            <div className="text-center space-y-4">
              <p className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                请详细描述您的症状、不适感受和就诊原因
              </p>
              
              <VoiceRecorder
                userId={patientId}
                visitId={visitId}
                language="autodialect"
                domain="medical"
                onTranscriptComplete={handleTranscriptComplete}
                size="lg"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('patient-info')}>
                上一步
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 步骤3: 病情概要审核 */}
      {currentStep === 'summary-review' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className={`font-semibold ${largeText ? 'text-xl' : 'text-lg'}`}>病情概要</h3>
            </div>

            {/* 转录内容 */}
            <div className="space-y-3">
              <Label>录音转录内容</Label>
              <div className="p-4 bg-gray-50 border rounded-lg">
                <p className={`whitespace-pre-wrap ${largeText ? 'text-lg' : ''}`}>
                  {chiefComplaint.transcript || '暂无转录内容'}
                </p>
              </div>
            </div>

            <Separator />

            {/* 病情概要 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>AI生成的病情概要</Label>
                {!chiefComplaint.summary && (
                  <Button 
                    onClick={generateChiefComplaint}
                    disabled={isGeneratingSummary}
                    size="sm"
                  >
                    {isGeneratingSummary ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    生成病情概要
                  </Button>
                )}
              </div>
              
              {isGeneratingSummary ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <p className="text-blue-800">AI正在分析病情，生成概要中...</p>
                  </div>
                </div>
              ) : chiefComplaint.summary ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="whitespace-pre-wrap">
                      {chiefComplaint.summary}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRegenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新生成
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRetranscribe}>
                      <Mic className="w-4 h-4 mr-2" />
                      重新录音
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border rounded-lg text-center">
                  <p className="text-gray-500">点击上方按钮生成病情概要</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetranscribe}>
                重新录音
              </Button>
              <Button 
                onClick={handleSubmitRegistration}
                disabled={!chiefComplaint.summary || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                提交挂号
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 步骤4: 挂号成功 */}
      {currentStep === 'registration' && submitSuccess && (
        <Card className="p-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className={`font-semibold text-xl ${highContrast ? 'text-black' : 'text-gray-800'}`}>
                挂号成功！
              </h3>
              <p className={`text-gray-600 ${largeText ? 'text-lg' : ''}`}>
                您的挂号信息已提交，请按时就诊
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">患者姓名：</span>
                <span className="font-medium">{patientInfo.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">就诊日期：</span>
                <span className="font-medium">{patientInfo.visitDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">就诊类型：</span>
                <Badge variant="secondary">
                  {getVisitTypeDisplay(patientInfo.visitType)}
                </Badge>
              </div>
            </div>

            <Button onClick={resetForm} className="w-full">
              继续挂号
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}