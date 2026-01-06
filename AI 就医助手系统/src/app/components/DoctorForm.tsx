import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Doctor, doctorAPI } from '../utils/doctorAPI';

interface DoctorFormProps {
  doctor?: Doctor;
  onSave: () => void;
  onCancel: () => void;
}

export function DoctorForm({ doctor, onSave, onCancel }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    doctorId: '',
    name: '',
    specialization: '',
    phone: '',
    email: '',
    status: 'ACTIVE' as const,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorIdError, setDoctorIdError] = useState('');

  useEffect(() => {
    if (doctor) {
      setFormData({
        doctorId: doctor.doctorId,
        name: doctor.name,
        specialization: doctor.specialization,
        phone: doctor.phone,
        email: doctor.email,
        status: doctor.status,
      });
    }
  }, [doctor]);

  const validateDoctorId = (id: string) => {
    if (!id.startsWith('doctor_')) {
      setDoctorIdError('医生ID格式必须为 "doctor_XXX"');
      return false;
    }
    setDoctorIdError('');
    return true;
  };

  const checkDoctorIdExists = async (doctorId: string) => {
    if (doctor && doctor.doctorId === doctorId) return false; // 编辑时跳过自己
    
    try {
      const doctors = await doctorAPI.getAllDoctors();
      return doctors.some(d => d.doctorId === doctorId);
    } catch (error) {
      console.error('检查医生ID失败:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateDoctorId(formData.doctorId)) {
      setLoading(false);
      return;
    }

    try {
      // 检查医生ID是否已存在
      const exists = await checkDoctorIdExists(formData.doctorId);
      if (exists) {
        setDoctorIdError('该医生ID已存在，请使用其他ID');
        setLoading(false);
        return;
      }

      if (doctor) {
        await doctorAPI.updateDoctor(doctor.id!, formData);
      } else {
        await doctorAPI.createDoctor(formData);
      }
      onSave();
    } catch (error) {
      setError(error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'doctorId') {
      validateDoctorId(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {doctor ? '编辑医生信息' : '新建医生'}
          </h1>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                医生ID *
              </label>
              <input
                type="text"
                value={formData.doctorId}
                onChange={(e) => handleInputChange('doctorId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  doctorIdError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="doctor_001"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                格式固定为 "doctor_XXX"，例如：doctor_001
              </p>
              {doctorIdError && (
                <p className="mt-1 text-sm text-red-600">{doctorIdError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入医生姓名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                专科 *
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入专科"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                电话 *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入电话号码"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="ACTIVE">激活</option>
                <option value="INACTIVE">停用</option>
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 py-3"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                disabled={loading || !!doctorIdError}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}