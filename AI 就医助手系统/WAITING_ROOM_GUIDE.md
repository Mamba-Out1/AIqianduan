# 待就诊界面使用说明

## 功能概述

新的待就诊界面提供了完整的患者就诊流程，包括患者信息查看、语音转录、病例总结生成和完成就诊功能。

## 主要功能

### 1. 患者列表
- 显示所有待就诊患者（状态为SCHEDULED或IN_PROGRESS）
- 显示患者基本信息：姓名、ID、就诊时间、主诉
- 点击患者进入详细就诊界面

### 2. 患者信息展示
- **患者姓名**: 从visits表的patientName字段获取
- **患者ID**: 从visits表的patientId字段获取  
- **患者主诉**: 从visits表的chiefComplaint字段获取
- **患者病情**: 从visits表的notes字段获取
- **就诊日期**: 从visits表的visitDate字段获取
- **就诊类型**: 从visits表的visitType字段获取

### 3. 语音转录功能
- 与患者端语音转录功能一致
- 支持实时录音和转录
- 显示录音时长和转录结果

### 4. 病例总结生成
- 语音转录完成后，可生成AI病例总结
- 调用病例总结接口：`POST /api/medical-summary/generate/{visitId}`
- 病例总结JSON格式：
```json
{
  "properties": {
    "current_medications": {
      "description": "当前用药信息"
    },
    "past_medical_history": {
      "description": "既往病史"
    },
    "symptom_details": {
      "description": "症状详情"
    },
    "vital_signs": {
      "description": "生命体征"
    }
  }
}
```

### 5. 病例总结展示
- 参考患者端病情概要的处理逻辑
- 分别显示：症状详情、生命体征、既往病史、当前用药
- 每个部分使用不同颜色的卡片展示

### 6. 完成就诊
- 病例总结生成后，显示"完成就诊"按钮
- 调用接口：`PUT /api/visits/complete/{visitId}`
- 完成后从待就诊列表中移除该患者

## 使用流程

1. 在医生端主界面点击"进入待就诊界面"
2. 从左侧患者列表选择要就诊的患者
3. 查看患者详细信息
4. 点击"开始录音"进行语音转录
5. 录音完成后点击"生成病例总结"
6. 查看生成的病例总结
7. 确认无误后点击"完成就诊"

## 技术实现

- 使用React Hooks管理状态
- 集成SpeechTranscription语音转录服务
- 调用后端API获取患者数据和生成病例总结
- 响应式设计，支持无障碍模式
- 统一的医生端界面风格

## API接口

- `GET /api/visits/doctor/{doctorId}` - 获取医生的患者列表
- `POST /api/medical-summary/generate/{visitId}` - 生成病例总结（流式）
- `PUT /api/visits/complete/{visitId}` - 完成就诊