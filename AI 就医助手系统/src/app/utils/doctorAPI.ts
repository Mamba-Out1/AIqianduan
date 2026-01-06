export interface Doctor {
  id?: number;
  doctorId: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const API_BASE_URL = 'http://localhost:8070/api';

export const doctorAPI = {
  // 获取所有医生
  async getAllDoctors(): Promise<Doctor[]> {
    const response = await fetch(`${API_BASE_URL}/doctors`);
    if (!response.ok) {
      throw new Error('获取医生列表失败');
    }
    return response.json();
  },

  // 创建医生
  async createDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctor),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || '创建医生失败');
    }
    return response.json();
  },

  // 更新医生
  async updateDoctor(id: number, doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctor),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || '更新医生失败');
    }
    return response.json();
  },

  // 删除医生
  async deleteDoctor(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除医生失败');
    }
  },
};