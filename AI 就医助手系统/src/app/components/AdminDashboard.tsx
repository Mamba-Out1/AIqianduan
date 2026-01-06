import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Shield, Plus, Edit, Trash2, LogOut, Users } from 'lucide-react';
import { Doctor, doctorAPI } from '../utils/doctorAPI';
import { DoctorForm } from './DoctorForm';

interface AdminDashboardProps {
  adminId: string;
  onLogout: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';

export function AdminDashboard({ adminId, onLogout }: AdminDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorAPI.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '加载医生列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!doctor.id) return;
    
    if (window.confirm(`确定要删除医生 ${doctor.name} 吗？`)) {
      try {
        await doctorAPI.deleteDoctor(doctor.id);
        await loadDoctors();
      } catch (error) {
        setError(error instanceof Error ? error.message : '删除医生失败');
      }
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setViewMode('edit');
  };

  const handleFormSave = async () => {
    await loadDoctors();
    setViewMode('list');
    setSelectedDoctor(undefined);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedDoctor(undefined);
  };

  if (viewMode === 'create') {
    return (
      <DoctorForm
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  if (viewMode === 'edit' && selectedDoctor) {
    return (
      <DoctorForm
        doctor={selectedDoctor}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                管理员控制台
              </h1>
              <p className="text-gray-600">欢迎，{adminId}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总医生数</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">激活医生</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.filter(d => d.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-full">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">停用医生</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.filter(d => d.status === 'INACTIVE').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Doctor Management */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">医生管理</h2>
              <Button
                onClick={() => setViewMode('create')}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                新建医生
              </Button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无医生数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">医生ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">姓名</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">专科</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">电话</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">邮箱</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{doctor.doctorId}</td>
                        <td className="py-3 px-4 text-gray-900">{doctor.name}</td>
                        <td className="py-3 px-4 text-gray-600">{doctor.specialization}</td>
                        <td className="py-3 px-4 text-gray-600">{doctor.phone}</td>
                        <td className="py-3 px-4 text-gray-600">{doctor.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doctor.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.status === 'ACTIVE' ? '激活' : '停用'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(doctor)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(doctor)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}