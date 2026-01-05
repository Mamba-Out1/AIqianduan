# API 测试说明

## 更新内容

1. **删除模拟数据**: 移除了DoctorView组件中的硬编码患者数据
2. **集成真实API**: 使用visitsAPI从后端获取患者数据
3. **保留核心功能**: 
   - AI病例总结功能 (MedicalSummaryPanel)
   - 语音问诊记录功能
   - 语音转录功能

## API接口使用

### 获取患者列表
- 接口: `GET /api/visits/doctor/{doctorId}`
- 当前使用的doctorId: `doctor_001`

### 病例总结相关
- 获取总结: `GET /api/medical-summary/visit/{visitId}`
- 生成总结: `POST /api/medical-summary/generate/{visitId}?doctorId={doctorId}&patientId={patientId}`

## 测试步骤

1. 确保后端服务运行在 `http://localhost:8070`
2. 启动前端: `npm run dev`
3. 点击"刷新患者列表"按钮测试API连接
4. 点击"测试API连接"按钮验证病例总结API

## 注意事项

- 如果没有患者数据，界面会显示"暂无患者数据"
- 确保后端数据库中有对应doctorId的患者记录
- 语音功能和AI总结功能保持不变