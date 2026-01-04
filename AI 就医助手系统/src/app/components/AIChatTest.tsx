import { AIChat } from './AIChat';

export function AIChatTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI医疗助手对话测试</h1>
          <p className="text-gray-600">测试智能体对话功能和语音输入</p>
        </div>

        <AIChat
          largeText={false}
          highContrast={false}
          patientId="test_patient_001"
        />

        {/* 测试说明 */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">测试说明</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">1.</span>
              <p>在输入框中输入问题，点击发送或按Enter键发送消息</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">2.</span>
              <p>点击麦克风图标可以进行语音输入，语音转录后会自动填入输入框</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">3.</span>
              <p>AI助手会通过流式输出实时回复您的消息</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">4.</span>
              <p>对话历史会保持在当前会话中，支持上下文理解</p>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-800">
                <strong>注意：</strong>此功能需要连接到真实的AI对话API接口 
                <code className="bg-amber-100 px-1 rounded">/api/dify/chat</code> 和语音转录接口。
                如果接口未部署，对话功能将无法正常工作。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}