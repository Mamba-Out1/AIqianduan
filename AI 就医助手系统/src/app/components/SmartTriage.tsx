import { Card } from './ui/card';
import { Brain, Construction } from 'lucide-react';

interface SmartTriageProps {
  largeText: boolean;
  highContrast: boolean;
}

export function SmartTriage({ largeText, highContrast }: SmartTriageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-teal-600" />
        <h2 className={`font-semibold ${largeText ? 'text-2xl' : 'text-xl'} ${
          highContrast ? 'text-black' : 'text-gray-800'
        }`}>
          智慧导诊
        </h2>
      </div>

      <Card className={`p-12 text-center ${
        highContrast ? 'bg-white border-2 border-black' : 'bg-gradient-to-br from-teal-50 to-cyan-50'
      }`}>
        <div className="space-y-6">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
            highContrast ? 'bg-black' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
          }`}>
            <Construction className={`w-10 h-10 ${
              highContrast ? 'text-white' : 'text-white'
            }`} />
          </div>
          
          <div className="space-y-3">
            <h3 className={`font-semibold ${largeText ? 'text-2xl' : 'text-xl'} ${
              highContrast ? 'text-black' : 'text-gray-800'
            }`}>
              功能开发中
            </h3>
            
            <p className={`text-gray-600 max-w-md mx-auto ${largeText ? 'text-lg' : ''} ${
              highContrast ? 'text-gray-800' : ''
            }`}>
              智慧导诊功能正在开发中，将为您提供AI驱动的症状分析和科室推荐服务。
            </p>
            
            <div className={`mt-6 p-4 rounded-lg ${
              highContrast ? 'bg-gray-100 border border-black' : 'bg-white/60'
            }`}>
              <p className={`text-gray-700 ${largeText ? 'text-base' : 'text-sm'} ${
                highContrast ? 'text-black' : ''
              }`}>
                敬请期待即将推出的功能：
              </p>
              <ul className={`mt-2 space-y-1 text-left ${largeText ? 'text-base' : 'text-sm'} ${
                highContrast ? 'text-black' : 'text-gray-600'
              }`}>
                <li>• AI症状分析</li>
                <li>• 智能科室推荐</li>
                <li>• 预约挂号建议</li>
                <li>• 健康风险评估</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}