import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, ArrowLeft } from 'lucide-react';

interface DoctorLoginProps {
  onLogin: (doctorId: string) => void;
  onBack: () => void;
}

export function DoctorLogin({ onLogin, onBack }: DoctorLoginProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const doctors = [
    { id: 'doctor_001', name: '王医生', department: '内科' },
    { id: 'doctor_002', name: '李医生', department: '外科' },
    { id: 'doctor_003', name: '张医生', department: '儿科' }
  ];

  const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            医生端登录
          </h1>
          <p className="text-gray-600">请选择您的医生ID</p>
        </div>
        
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-gray-700 font-medium">选择医生</label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500">
                  <SelectValue placeholder="请选择医生ID" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.id}) - {doctor.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDoctor && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>医生信息：</strong>{selectedDoctor.name} - {selectedDoctor.department}
                </p>
                <p className="text-sm text-emerald-600">ID: {selectedDoctor.id}</p>
              </div>
            )}

            <Button 
              onClick={() => selectedDoctorId && onLogin(selectedDoctorId)}
              disabled={!selectedDoctorId}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium"
            >
              登录
            </Button>
          </div>
          
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