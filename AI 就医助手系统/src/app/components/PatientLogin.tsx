import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, ArrowLeft } from 'lucide-react';

interface PatientLoginProps {
  onLogin: (patientId: string) => void;
  onBack: () => void;
}

export function PatientLogin({ onLogin, onBack }: PatientLoginProps) {
  const [patientId, setPatientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;
    
    setIsLoading(true);
    // 模拟登录验证
    setTimeout(() => {
      onLogin(patientId.trim());
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            患者登录
          </h1>
          <p className="text-gray-600">请输入您的患者ID进行登录</p>
        </div>
        
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patientId" className="text-gray-700 font-medium">
                患者ID
              </Label>
              <Input
                id="patientId"
                type="text"
                placeholder="请输入您的患者ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium"
              disabled={isLoading || !patientId.trim()}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>
          
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="w-full mt-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回选择界面
          </Button>
        </Card>
      </div>
    </div>
  );
}