# 语音转录功能集成说明

## 功能概述

本次更新为AI就医助手系统集成了真实的语音转录功能，支持：

- 🎤 浏览器麦克风录音
- 🔄 实时音频可视化
- 📝 语音转文字（支持普通话和多种方言）
- 🏥 医疗领域优化
- 👥 患者端和医生端双重支持

## 新增文件

### 核心工具类
- `src/app/utils/speechTranscription.ts` - 语音转录核心类
- `src/app/utils/useSpeechTranscription.ts` - 语音转录React Hook

### 组件
- `src/app/components/VoiceRecorder.tsx` - 可复用的语音录制组件
- `src/app/components/VoiceTranscriptionTest.tsx` - 语音转录测试页面

## 功能特性

### 1. 音频处理
- 自动重采样到16kHz
- PCM格式转换
- 回声消除和噪声抑制
- 实时音频可视化

### 2. 转录配置
```typescript
interface TranscriptionConfig {
  userId: string;        // 用户ID
  visitId: string;       // 访问ID
  language?: string;     // 语言模式 (默认: 'autodialect')
  domain?: string;       // 领域优化 (默认: 'medical')
}
```

### 3. 支持的语言模式
- `autodialect` - 中英+方言识别
- `autominor` - 37语种识别

### 4. 领域优化
- `medical` - 医疗领域
- `finance` - 金融领域

## API接口

系统需要后端提供以下接口：

```
POST /api/transcription/upload
```

### 请求参数
- `file` - 音频文件 (PCM格式)
- `userId` - 用户ID
- `visitId` - 访问ID
- `audioEncode` - 音频编码 (pcm_s16le)
- `sampleRate` - 采样率 (16000)
- `lang` - 语言模式
- `pd` - 领域优化 (可选)

### 响应格式
```json
{
  "status": "SUCCESS",
  "transcriptionText": "转录的文本内容",
  "message": "处理成功"
}
```

## 使用方法

### 1. 在患者端使用
患者可以通过语音描述症状，系统自动转录并生成病情摘要。

### 2. 在医生端使用
医生可以录制问诊对话，系统自动转录并生成结构化病历。

### 3. 测试功能
访问"语音测试"页面可以独立测试语音转录功能。

## 组件使用示例

```tsx
import { VoiceRecorder } from './components/VoiceRecorder';

function MyComponent() {
  const handleTranscriptComplete = (transcript: string) => {
    console.log('转录完成:', transcript);
  };

  return (
    <VoiceRecorder
      userId="user_001"
      visitId="visit_001"
      language="autodialect"
      domain="medical"
      onTranscriptComplete={handleTranscriptComplete}
      size="md"
    />
  );
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 权限要求

- 麦克风访问权限
- HTTPS环境（生产环境必需）

## 注意事项

1. **API接口**: 需要部署真实的语音转录后端接口
2. **HTTPS**: 生产环境必须使用HTTPS才能访问麦克风
3. **权限**: 首次使用需要用户授权麦克风访问权限
4. **网络**: 转录过程需要网络连接

## 错误处理

系统包含完整的错误处理机制：
- 麦克风权限被拒绝
- 网络连接失败
- API接口错误
- 音频处理失败

所有错误都会显示用户友好的提示信息。