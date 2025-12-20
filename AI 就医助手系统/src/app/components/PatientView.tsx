import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Mic, 
  StopCircle, 
  FileText, 
  Shield, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  QrCode,
  Volume2,
  Type,
  Contrast
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface PatientViewProps {
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
}

interface SymptomRecord {
  id: string;
  timestamp: Date;
  symptoms: string;
  summary: {
    chiefComplaint: string;
    duration: string;
    severity: string;
    medications: string[];
    additionalNotes: string;
  };
}

interface DataAccessLog {
  id: string;
  timestamp: Date;
  accessor: string;
  purpose: string;
  dataType: string;
}

export function PatientView({ accessibilityMode, setAccessibilityMode }: PatientViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [records, setRecords] = useState<SymptomRecord[]>([]);
  const [dataLogs, setDataLogs] = useState<DataAccessLog[]>([
    {
      id: '1',
      timestamp: new Date('2024-12-10T09:30:00'),
      accessor: '王医生',
      purpose: '门诊问诊',
      dataType: '病情摘要'
    },
    {
      id: '2',
      timestamp: new Date('2024-12-08T14:15:00'),
      accessor: '李医生',
      purpose: '复诊查看',
      dataType: '就诊记录'
    }
  ]);
  const [dataConsent, setDataConsent] = useState(true);

  // 模拟语音识别
  const startRecording = () => {
    setIsRecording(true);
    setCurrentTranscript('');
    
    // 模拟语音输入过程
    const simulatedInput = "我最近三天一直头疼，特别是右边太阳穴那里，一阵一阵的疼，疼起来的时候还有点恶心想吐。昨天晚上疼得睡不着觉，吃了一片布洛芬，好了一点。我还有点发烧，体温大概37.5度左右。";
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < simulatedInput.length) {
        setCurrentTranscript(prev => prev + simulatedInput[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (currentTranscript) {
      // 生成结构化摘要
      const newRecord: SymptomRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        symptoms: currentTranscript,
        summary: {
          chiefComplaint: '头痛伴恶心',
          duration: '3天',
          severity: '中度（影响睡眠）',
          medications: ['布洛芬 1片'],
          additionalNotes: '右侧太阳穴疼痛，发热37.5°C'
        }
      };
      
      setRecords([newRecord, ...records]);
    }
  };

  const generateQRCode = () => {
    // 模拟生成二维码供医生扫描
    alert('已生成就诊二维码，医生扫描后可查看您的病情摘要');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* 左侧：语音问诊 */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 无障碍设置卡片 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2>无障碍设置</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label htmlFor="large-text">大字模式</Label>
                    <p className="text-sm text-gray-500">适合老年用户阅读</p>
                  </div>
                </div>
                <Switch 
                  id="large-text"
                  checked={accessibilityMode}
                  onCheckedChange={setAccessibilityMode}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Contrast className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label>高对比度界面</Label>
                    <p className="text-sm text-gray-500">增强视觉辨识度</p>
                  </div>
                </div>
                <Badge variant="outline">已启用</Badge>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label>语音播报</Label>
                    <p className="text-sm text-gray-500">朗读界面内容</p>
                  </div>
                </div>
                <Badge variant="outline">已启用</Badge>
              </div>
            </div>
          </Card>

          {/* 语音问诊卡片 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mic className="w-6 h-6 text-blue-600" />
              <h2>语音描述症状</h2>
            </div>

            {/* 语音录制区域 */}
            <div className="mb-6">
              <div className={`
                border-2 rounded-lg p-8 text-center transition-all
                ${isRecording 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 bg-gray-50'
                }
              `}>
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <Mic className="w-16 h-16 text-red-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
                      </div>
                    </div>
                    <p className="text-red-600">正在录音中...</p>
                    <p className="text-sm text-gray-600">请清晰描述您的症状</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Mic className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="text-gray-600">点击下方按钮开始语音描述</p>
                    <p className="text-sm text-gray-500">系统支持普通话及多种方言识别</p>
                  </div>
                )}
              </div>

              {/* 实时转写文本 */}
              {currentTranscript && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">实时转写：</p>
                  <p className={accessibilityMode ? 'text-lg' : ''}>{currentTranscript}</p>
                </div>
              )}

              {/* 录音控制按钮 */}
              <div className="flex gap-3 mt-6 justify-center">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording}
                    size="lg"
                    className="gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    开始录音
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording}
                    size="lg"
                    variant="destructive"
                    className="gap-2"
                  >
                    <StopCircle className="w-5 h-5" />
                    停止录音
                  </Button>
                )}
              </div>
            </div>

            {/* 语音确认提示 */}
            {currentTranscript && !isRecording && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-900 mb-2">请确认信息准确性</p>
                  <p className="text-sm text-amber-700">
                    AI已根据您的描述生成病情摘要，请仔细核对后确认
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* 病情摘要列表 */}
          {records.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2>病情摘要</h2>
              </div>

              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        {record.timestamp.toLocaleString('zh-CN')}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={generateQRCode}
                        className="gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        生成就诊码
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label className="text-gray-600">主诉</Label>
                        <p className={accessibilityMode ? 'text-lg mt-1' : 'mt-1'}>
                          {record.summary.chiefComplaint}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">持续时间</Label>
                        <p className={accessibilityMode ? 'text-lg mt-1' : 'mt-1'}>
                          {record.summary.duration}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">严重程度</Label>
                        <p className={accessibilityMode ? 'text-lg mt-1' : 'mt-1'}>
                          {record.summary.severity}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">已用药物</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.summary.medications.map((med, idx) => (
                            <Badge key={idx} variant="secondary">{med}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-600">补充说明</Label>
                      <p className={`${accessibilityMode ? 'text-lg' : ''} text-gray-700 mt-1`}>
                        {record.summary.additionalNotes}
                      </p>
                    </div>

                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-green-900">AI 可信度评估：高</p>
                        <p className="text-green-700">
                          判断依据：症状描述清晰，时间线完整，包含关键信息（体温、用药）
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* 右侧：隐私控制面板 */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2>隐私与授权</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-consent">数据收集授权</Label>
                  <p className="text-sm text-gray-500">允许收集健康数据</p>
                </div>
                <Switch 
                  id="data-consent"
                  checked={dataConsent}
                  onCheckedChange={setDataConsent}
                />
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">授权范围</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">症状记录</span>
                    <Badge variant="outline">已授权</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">用药历史</span>
                    <Badge variant="outline">已授权</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">就诊记录</span>
                    <Badge variant="outline">已授权</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Eye className="w-4 h-4" />
                    查看使用日志
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>数据使用日志</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {dataLogs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span>{log.accessor}</span>
                            <Badge>{log.purpose}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>访问时间: {log.timestamp.toLocaleString('zh-CN')}</p>
                            <p>访问数据: {log.dataType}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="mt-2 gap-1"
                          >
                            <EyeOff className="w-3 h-3" />
                            撤销此次授权
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button variant="destructive" className="w-full" disabled={!dataConsent}>
                一键撤销所有授权
              </Button>
            </div>
          </Card>

          {/* 安全提示 */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="mb-2">数据安全承诺</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 所有数据加密存储</li>
                  <li>• 仅授权医生可查看</li>
                  <li>• 可随时撤销授权</li>
                  <li>• 完整的访问日志记录</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
