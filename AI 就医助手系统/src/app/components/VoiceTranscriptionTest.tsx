import { useState } from 'react';
import { Card } from './ui/card';
import { VoiceRecorder } from './VoiceRecorder';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function VoiceTranscriptionTest() {
  const [transcripts, setTranscripts] = useState<Array<{
    id: string;
    timestamp: Date;
    text: string;
    type: 'patient' | 'doctor';
  }>>([]);

  const handlePatientTranscript = (transcript: string) => {
    setTranscripts(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: new Date(),
      text: transcript,
      type: 'patient'
    }]);
  };

  const handleDoctorTranscript = (transcript: string) => {
    setTranscripts(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: new Date(),
      text: transcript,
      type: 'doctor'
    }]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">语音转录功能测试</h1>
        <p className="text-gray-600">测试患者端和医生端的语音转录功能</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 患者端测试 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-semibold">患者端语音录制</h2>
          </div>
          
          <VoiceRecorder
            userId="patient_test_001"
            visitId={`visit_${Date.now()}`}
            language="autodialect"
            domain="medical"
            onTranscriptComplete={handlePatientTranscript}
            size="md"
          />
        </Card>

        {/* 医生端测试 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-semibold">医生端语音录制</h2>
          </div>
          
          <VoiceRecorder
            userId="doctor_test_001"
            visitId={`consultation_${Date.now()}`}
            language="autodialect"
            domain="medical"
            onTranscriptComplete={handleDoctorTranscript}
            size="md"
          />
        </Card>
      </div>

      {/* 转录历史记录 */}
      {transcripts.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">转录历史记录</h3>
          <div className="space-y-4">
            {transcripts.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={record.type === 'patient' ? 'default' : 'secondary'}>
                      {record.type === 'patient' ? '患者' : '医生'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {record.timestamp.toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="whitespace-pre-wrap">{record.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">使用说明</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-600">1.</span>
            <p>点击"开始录音"按钮，允许浏览器访问麦克风权限</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-600">2.</span>
            <p>清晰地说出您要转录的内容，支持普通话和多种方言</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-600">3.</span>
            <p>点击"停止录音"按钮，系统将自动处理并转录音频</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-600">4.</span>
            <p>转录完成后，结果将显示在下方，并添加到历史记录中</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-800">
              <strong>注意：</strong>此功能需要连接到真实的语音转录API接口 
              <code className="bg-amber-100 px-1 rounded">/api/transcription/upload</code>。
              如果接口未部署，转录功能将无法正常工作。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}