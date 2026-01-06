import { Card } from './ui/card';
import { Button } from './ui/button';
import { User, Stethoscope, Shield } from 'lucide-react';

interface LoginSelectProps {
  onSelectRole: (role: 'patient' | 'doctor' | 'admin') => void;
}

export function LoginSelect({ onSelectRole }: LoginSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            AI 就医助手系统
          </h1>
          <p className="text-gray-600">请选择您的身份</p>
        </div>
        
        <div className="space-y-4">
          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90" 
                onClick={() => onSelectRole('patient')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full">
                <User className="w-8 h-8 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">患者端</h3>
                <p className="text-gray-600">查看就诊记录，管理个人健康信息</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                onClick={() => onSelectRole('doctor')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full">
                <Stethoscope className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">医生端</h3>
                <p className="text-gray-600">管理患者，生成病例总结</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                onClick={() => onSelectRole('admin')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">管理员</h3>
                <p className="text-gray-600">管理医生信息，系统配置</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}