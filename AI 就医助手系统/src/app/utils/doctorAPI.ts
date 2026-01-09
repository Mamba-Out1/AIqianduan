export interface Doctor {
  id?: number;
  doctorId: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const API_BASE_URL = 'http://localhost:8070';

export const doctorAPI = {
  // 获取所有医生
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('无法连接到后端服务，请确认服务是否启动');
      }
      throw error;
    }
  },

  // 创建医生
  async createDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/api/doctors`, {
      method: 'POST',
      mode: 'cors',
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
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      method: 'PUT',
      mode: 'cors',
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
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('删除医生失败');
    }
  },
};