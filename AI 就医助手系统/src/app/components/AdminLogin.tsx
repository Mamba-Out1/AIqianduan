import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (adminId: string) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [adminId, setAdminId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId.trim()) {
      onLogin(adminId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            管理员登录
          </h1>
          <p className="text-gray-600">请输入您的管理员ID</p>
        </div>
        
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">
                管理员ID
              </label>
              <input
                type="text"
                id="adminId"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入管理员ID"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                登录
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}