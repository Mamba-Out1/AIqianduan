import { Card } from './ui/card';
import { Button } from './ui/button';
import { User, Stethoscope } from 'lucide-react';

interface LoginSelectProps {
  onSelectRole: (role: 'patient' | 'doctor') => void;
}

export function LoginSelect({ onSelectRole }: LoginSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 就医助手系统</h1>
          <p className="text-gray-600">请选择您的身份</p>
        </div>
        
        <div className="space-y-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => onSelectRole('patient')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">患者端</h3>
                <p className="text-gray-600">记录症状，获取AI健康建议</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectRole('doctor')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Stethoscope className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">医生端</h3>
                <p className="text-gray-600">管理患者，生成病例总结</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}