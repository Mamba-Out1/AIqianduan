import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Settings, Type, Contrast, Eye, Volume2 } from 'lucide-react';

interface AccessibilitySettingsProps {
  largeText: boolean;
  setLargeText: (enabled: boolean) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

export function AccessibilitySettings({ 
  largeText, 
  setLargeText, 
  highContrast, 
  setHighContrast 
}: AccessibilitySettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-teal-600" />
        <h2 className={`font-semibold ${largeText ? 'text-2xl' : 'text-xl'} ${
          highContrast ? 'text-black' : 'text-gray-800'
        }`}>
          无障碍设置
        </h2>
      </div>

      <Card className={`p-6 ${highContrast ? 'bg-white border-2 border-black' : 'bg-white'}`}>
        <div className="space-y-6">
          {/* 大字模式设置 */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${
                highContrast ? 'bg-black' : 'bg-gradient-to-r from-teal-100 to-cyan-100'
              }`}>
                <Type className={`w-6 h-6 ${
                  highContrast ? 'text-white' : 'text-teal-600'
                }`} />
              </div>
              <div className="flex-1">
                <Label className={`font-medium ${largeText ? 'text-xl' : 'text-lg'} ${
                  highContrast ? 'text-black' : 'text-gray-800'
                }`}>
                  大字模式
                </Label>
                <p className={`text-gray-600 mt-1 ${largeText ? 'text-lg' : 'text-sm'} ${
                  highContrast ? 'text-gray-800' : ''
                }`}>
                  启用后，所有界面文字将放大显示，便于阅读
                </p>
                <div className={`mt-2 p-3 rounded-lg ${
                  highContrast ? 'bg-gray-100 border border-black' : 'bg-gray-50'
                }`}>
                  <p className={`${largeText ? 'text-lg' : 'text-sm'} ${
                    highContrast ? 'text-black' : 'text-gray-700'
                  }`}>
                    示例文字：{largeText ? '大字模式已启用' : '正常字体大小'}
                  </p>
                </div>
              </div>
            </div>
            <Switch 
              checked={largeText}
              onCheckedChange={setLargeText}
              className="data-[state=checked]:bg-teal-500"
            />
          </div>

          <div className={`border-t ${highContrast ? 'border-black' : 'border-gray-200'}`} />

          {/* 高对比度模式设置 */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${
                highContrast ? 'bg-black' : 'bg-gradient-to-r from-teal-100 to-cyan-100'
              }`}>
                <Contrast className={`w-6 h-6 ${
                  highContrast ? 'text-white' : 'text-teal-600'
                }`} />
              </div>
              <div className="flex-1">
                <Label className={`font-medium ${largeText ? 'text-xl' : 'text-lg'} ${
                  highContrast ? 'text-black' : 'text-gray-800'
                }`}>
                  高对比度界面
                </Label>
                <p className={`text-gray-600 mt-1 ${largeText ? 'text-lg' : 'text-sm'} ${
                  highContrast ? 'text-gray-800' : ''
                }`}>
                  启用后，界面将使用高对比度配色，增强视觉辨识度
                </p>
                <div className={`mt-2 p-3 rounded-lg ${
                  highContrast ? 'bg-white border-2 border-black' : 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200'
                }`}>
                  <p className={`${largeText ? 'text-lg' : 'text-sm'} ${
                    highContrast ? 'text-black font-bold' : 'text-teal-700'
                  }`}>
                    示例界面：{highContrast ? '高对比度模式' : '标准配色模式'}
                  </p>
                </div>
              </div>
            </div>
            <Switch 
              checked={highContrast}
              onCheckedChange={setHighContrast}
              className="data-[state=checked]:bg-teal-500"
            />
          </div>

          <div className={`border-t ${highContrast ? 'border-black' : 'border-gray-200'}`} />

          {/* 其他辅助功能 */}
          <div className="space-y-4">
            <h3 className={`font-medium ${largeText ? 'text-lg' : ''} ${
              highContrast ? 'text-black' : 'text-gray-800'
            }`}>
              其他辅助功能
            </h3>
            
            <div className="grid gap-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                highContrast ? 'bg-gray-100 border border-black' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Eye className={`w-5 h-5 ${highContrast ? 'text-black' : 'text-teal-600'}`} />
                  <div>
                    <Label className={`${largeText ? 'text-lg' : ''} ${
                      highContrast ? 'text-black' : 'text-gray-800'
                    }`}>
                      屏幕阅读器支持
                    </Label>
                    <p className={`text-gray-600 ${largeText ? 'text-base' : 'text-sm'} ${
                      highContrast ? 'text-gray-800' : ''
                    }`}>
                      兼容主流屏幕阅读器软件
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  highContrast ? 'bg-black text-white' : 'bg-green-100 text-green-800'
                }`}>
                  已启用
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${
                highContrast ? 'bg-gray-100 border border-black' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Volume2 className={`w-5 h-5 ${highContrast ? 'text-black' : 'text-teal-600'}`} />
                  <div>
                    <Label className={`${largeText ? 'text-lg' : ''} ${
                      highContrast ? 'text-black' : 'text-gray-800'
                    }`}>
                      语音播报
                    </Label>
                    <p className={`text-gray-600 ${largeText ? 'text-base' : 'text-sm'} ${
                      highContrast ? 'text-gray-800' : ''
                    }`}>
                      重要信息语音提醒
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  highContrast ? 'bg-black text-white' : 'bg-green-100 text-green-800'
                }`}>
                  已启用
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 设置说明 */}
      <Card className={`p-4 ${
        highContrast ? 'bg-gray-100 border-2 border-black' : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          <Settings className={`w-5 h-5 mt-0.5 ${
            highContrast ? 'text-black' : 'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-medium ${largeText ? 'text-lg' : ''} ${
              highContrast ? 'text-black' : 'text-blue-900'
            }`}>
              设置说明
            </h4>
            <p className={`mt-1 ${largeText ? 'text-base' : 'text-sm'} ${
              highContrast ? 'text-gray-800' : 'text-blue-700'
            }`}>
              这些设置将应用到整个应用程序，帮助您更好地使用系统。设置会自动保存，下次登录时仍然有效。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}