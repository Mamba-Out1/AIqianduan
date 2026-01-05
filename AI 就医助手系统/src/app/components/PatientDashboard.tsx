import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, FileText, Settings, Brain, MessageCircle } from 'lucide-react';
import { VisitRecords } from './VisitRecords';
import { AccessibilitySettings } from './AccessibilitySettings';
import { SmartTriage } from './SmartTriage';
import { AIChat } from './AIChat';

interface PatientDashboardProps {
  patientId: string;
  onLogout: () => void;
}

export function PatientDashboard({ patientId, onLogout }: PatientDashboardProps) {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [activeTab, setActiveTab] = useState('records');

  return (
    <div className={`min-h-screen ${
      highContrast 
        ? 'bg-white' 
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100'
    }`}>
      {/* 顶部导航栏 */}
      <div className={`border-b ${
        highContrast ? 'bg-white border-black' : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                highContrast ? 'bg-black' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
              }`}>
                <span className={`text-white font-bold ${largeText ? 'text-lg' : ''}`}>
                  患
                </span>
              </div>
              <div>
                <h1 className={`font-bold ${largeText ? 'text-2xl' : 'text-xl'} ${
                  highContrast ? 'text-black' : 'bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'
                }`}>
                  AI 就医助手系统
                </h1>
                <p className={`text-gray-600 ${largeText ? 'text-lg' : 'text-sm'} ${
                  highContrast ? 'text-gray-800' : ''
                }`}>
                  患者ID: {patientId}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={onLogout}
              variant="outline"
              className={`gap-2 ${largeText ? 'text-lg px-6 py-3' : ''} ${
                highContrast ? 'border-black text-black hover:bg-black hover:text-white' : ''
              }`}
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* 标签页导航 */}
          <TabsList className={`grid w-full grid-cols-4 ${largeText ? 'h-14' : 'h-12'} ${
            highContrast ? 'bg-white border-2 border-black' : 'bg-white/60 backdrop-blur-sm'
          }`}>
            <TabsTrigger 
              value="records" 
              className={`gap-2 ${largeText ? 'text-lg px-6' : ''} ${
                highContrast 
                  ? 'data-[state=active]:bg-black data-[state=active]:text-white' 
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              就诊记录
            </TabsTrigger>
            <TabsTrigger 
              value="accessibility" 
              className={`gap-2 ${largeText ? 'text-lg px-6' : ''} ${
                highContrast 
                  ? 'data-[state=active]:bg-black data-[state=active]:text-white' 
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              无障碍设置
            </TabsTrigger>
            <TabsTrigger 
              value="triage" 
              className={`gap-2 ${largeText ? 'text-lg px-6' : ''} ${
                highContrast 
                  ? 'data-[state=active]:bg-black data-[state=active]:text-white' 
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              智慧导诊
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className={`gap-2 ${largeText ? 'text-lg px-6' : ''} ${
                highContrast 
                  ? 'data-[state=active]:bg-black data-[state=active]:text-white' 
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              AI对话
            </TabsTrigger>
          </TabsList>

          {/* 标签页内容 */}
          <TabsContent value="records" className="space-y-6">
            <VisitRecords 
              patientId={patientId}
              largeText={largeText}
              highContrast={highContrast}
            />
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <AccessibilitySettings
              largeText={largeText}
              setLargeText={setLargeText}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
            />
          </TabsContent>

          <TabsContent value="triage" className="space-y-6">
            <SmartTriage
              largeText={largeText}
              highContrast={highContrast}
              patientId={patientId}
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <AIChat
              largeText={largeText}
              highContrast={highContrast}
              patientId={patientId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}