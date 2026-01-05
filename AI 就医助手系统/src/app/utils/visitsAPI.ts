// API utilities - 使用VisitController接口

export interface Visit {
  id: number;
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  visitType: string;
  visitDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  chiefComplaint: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitsResponse {
  visits: Visit[];
  total: number;
}

export class VisitsAPI {
  private baseURL = 'http://localhost:8070/api/visits';

  async getVisitsByDoctor(doctorId: string): Promise<VisitsResponse> {
    const response = await fetch(`${this.baseURL}/doctor/${doctorId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const visits: Visit[] = await response.json();
    visits.sort((a, b) => a.patientId.localeCompare(b.patientId));
    
    return {
      visits,
      total: visits.length
    };
  }

  async updateVisitStatus(visitId: string, status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<boolean> {
    const response = await fetch(`${this.baseURL}/${visitId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.ok;
  }

  async completeVisit(visitId: string): Promise<boolean> {
    const response = await fetch(`${this.baseURL}/complete/${visitId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  }

  async getVisitById(visitId: string): Promise<Visit> {
    const response = await fetch(`${this.baseURL}/${visitId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

// 状态映射函数
export const mapVisitStatus = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS': return 'pending';
    case 'COMPLETED': return 'completed';
    case 'CANCELLED': return 'cancelled';
    case 'SCHEDULED': return 'pending';
    default: return 'pending';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
    case 'SCHEDULED':
    case 'pending': return '待就诊';
    case 'COMPLETED':
    case 'completed': return '已就诊';
    case 'CANCELLED':
    case 'cancelled': return '已取消';
    default: return '未知';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
    case 'SCHEDULED':
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
    case 'completed': return 'bg-green-100 text-green-800';
    case 'CANCELLED':
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// 导出单例实例
export const visitsAPI = new VisitsAPI();