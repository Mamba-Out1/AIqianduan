// 就诊类型枚举
export type VisitType = 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY' | 'ROUTINE_CHECK';

// 就诊类型中英文映射
export const VISIT_TYPE_MAP: Record<VisitType, string> = {
  'CONSULTATION': '门诊',
  'FOLLOW_UP': '复诊',
  'EMERGENCY': '急诊',
  'ROUTINE_CHECK': '常规检查'
} as const;

// 将英文就诊类型转换为中文显示
export function getVisitTypeDisplay(visitType: string): string {
  return VISIT_TYPE_MAP[visitType as VisitType] || visitType;
}