// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 通用请求函数
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  return response;
}

// 患者就诊记录接口
export const visitAPI = {
  // 根据患者ID获取就诊记录
  getPatientVisits: async (patientId: string) => {
    const response = await apiRequest(`/api/visits/patient/${patientId}`);
    return response.json();
  },
};

// MedicalSummaryController 接口
export const medicalSummaryAPI = {
  // 获取所有病历总结
  getAllSummaries: async () => {
    const response = await apiRequest('/api/medical-summary/all');
    return response.json();
  },

  // 根据visitId获取病历总结
  getSummaryByVisit: async (visitId: string) => {
    const response = await apiRequest(`/api/medical-summary/visit/${visitId}`);
    return response.json();
  },

  // 生成病历总结（流式）
  generateSummaryStream: async (visitId: string, doctorId: string, patientId: string) => {
    return apiRequest(
      `/api/medical-summary/generate/${visitId}?doctorId=${doctorId}&patientId=${patientId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
        }
      }
    );
  },

  // 手动创建病历总结
  createSummary: async (data: {
    visitId: string;
    doctorId: string;
    patientId: string;
  }) => {
    const response = await apiRequest('/api/medical-summary/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// 类型定义
export interface VisitRecord {
  id: number;
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  visitType: string;
  visitDate: string;
  status: string;
  chiefComplaint: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  patient_name: string;
}

export interface MedicalSummaryResponse {
  summaryId: string;
  visitId: string;
  doctorId: string;
  patientId: string;
  symptomDetails: string;
  vitalSigns: string;
  pastMedicalHistory: string;
  currentMedications: string;
  createdAt: string;
}