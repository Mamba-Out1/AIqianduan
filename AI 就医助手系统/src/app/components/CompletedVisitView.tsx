import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User,
  FileText,
  ArrowLeft,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Separator } from './ui/separator';
import { Visit } from '../utils/visitsAPI';
import { medicalSummaryAPI, MedicalSummaryResponse } from '../utils/medicalAPI';

interface CompletedVisitViewProps {
  accessibilityMode: boolean;
  onBack: () => void;
  visit: Visit;
  doctorId: string;
}

export function CompletedVisitView({ accessibilityMode, onBack, visit, doctorId }: CompletedVisitViewProps) {
  const [summary, setSummary] = useState<MedicalSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummary();
  }, [visit.visitId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const summaryData = await medicalSummaryAPI.getSummaryByVisit(visit.visitId);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载病例总结失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回患者列表
        </Button>
        <h1 className="text-2xl font-bold">已就诊患者 - {visit.patientName}</h1>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          已完成
        </Badge>
      </div>

      <div className="space-y-6">
        {/* 患者信息卡片 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">患者信息</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">患者姓名</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>{visit.patientName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">患者ID</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>{visit.patientId}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">就诊日期</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>
                {new Date(visit.visitDate).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">就诊类型</p>
              <p className={accessibilityMode ? 'text-lg' : ''}>{visit.visitType}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">患者主诉</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className={accessibilityMode ? 'text-lg' : ''}>
                  {visit.chiefComplaint || '未填写'}
                </p>
              </div>
            </div>

            {visit.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">患者病情</p>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className={accessibilityMode ? 'text-lg' : ''}>{visit.notes}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 病例总结卡片 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold">病例总结</h2>
            </div>
            <Button onClick={loadSummary} variant="outline" size="sm" className="gap-2" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-900">加载失败: {error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
              <span>加载病例总结中...</span>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">患者症状</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className={accessibilityMode ? 'text-lg' : ''}>{summary.symptomDetails || '暂无记录'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">生命体征</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className={accessibilityMode ? 'text-lg' : ''}>{summary.vitalSigns || '暂无记录'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">既往病史</h4>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className={accessibilityMode ? 'text-lg' : ''}>{summary.pastMedicalHistory || '暂无记录'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">当前用药</h4>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className={accessibilityMode ? 'text-lg' : ''}>{summary.currentMedications || '暂无记录'}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                总结生成时间: {new Date(summary.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>暂无病例总结</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}