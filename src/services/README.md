# API服务模块使用说明

## 概述

这个模块提供了与后端API的统一接口，主要用于ChatBar组件的消息收发功能。

## 文件结构

```
src/services/
├── api.js          # 主要的API服务模块
├── README.md       # 使用说明文档
└── ../config/
    └── api.js      # API配置文件
└── ../examples/
    └── chatbar-api-usage.js  # API使用示例
```

## 主要功能

### 1. 聊天API (chatAPI)

#### 发送消息
```javascript
import { chatAPI } from './services/api.js';

const response = await chatAPI.sendMessage({
  message: '你好',
  model: 'gpt-3.5-turbo',
  history: [],
  context: {
    sessionId: 'session_123',
    timestamp: new Date().toISOString()
  }
});

if (response.success) {
  console.log('AI回复:', response.data);
} else {
  console.error('发送失败:', response.error);
}
```

#### 获取可用模型
```javascript
const response = await chatAPI.getAvailableModels();
if (response.success) {
  console.log('可用模型:', response.data);
}
```

#### 流式聊天（实时响应）
```javascript
await chatAPI.sendStreamMessage(
  messageData,
  (data) => console.log('收到数据:', data),  // 消息回调
  (error) => console.error('错误:', error),  // 错误回调
  () => console.log('完成')                  // 完成回调
);
```

### 2. 工作流API (workflowAPI)

#### 获取工作流列表
```javascript
import { workflowAPI } from './services/api.js';

const response = await workflowAPI.getWorkflows();
if (response.success) {
  console.log('工作流列表:', response.data);
}
```

## 配置

### API基础URL配置

在 `src/config/api.js` 中配置不同环境的API地址：

```javascript
const development = {
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
};

const production = {
  baseURL: 'https://api.wence.com/api',
  timeout: 30000,
};
```

### 环境变量

可以通过环境变量覆盖默认配置：

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8000/api

# 生产环境
VITE_API_BASE_URL=https://api.wence.com/api
```

## 错误处理

所有API调用都返回统一格式的响应：

```javascript
{
  success: boolean,    // 请求是否成功
  data?: any,         // 成功时的数据
  error?: string      // 失败时的错误信息
}
```

## 认证

如果需要认证，可以设置token：

```javascript
import { apiService } from './services/api.js';

// 设置认证token
apiService.setAuthToken('your-jwt-token');

// 移除认证token
apiService.removeAuthToken();
```

## 测试

使用测试工具验证API连接：

```javascript
import { runAllTests } from '../utils/apiTest.js';

// 运行所有测试
const results = await runAllTests();
console.log('测试结果:', results);
```

## 后端接口规范

### 聊天接口

#### POST /api/chat/send
发送消息到AI模型

**请求体：**
```json
{
  "message": "用户消息内容",
  "model": "gpt-3.5-turbo",
  "history": [
    {
      "role": "user",
      "content": "历史消息",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "context": {
    "sessionId": "session_123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "content": "AI回复内容",
    "model": "gpt-3.5-turbo",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/chat/models
获取可用的AI模型列表

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "value": "gpt-3.5-turbo",
      "label": "GPT-3.5 Turbo"
    },
    {
      "value": "gpt-4",
      "label": "GPT-4"
    }
  ]
}
```

#### POST /api/chat/stream
流式聊天接口（Server-Sent Events）

**请求体：** 同 `/api/chat/send`

**响应：** 流式数据，每行一个JSON对象

## 注意事项

1. 所有API调用都是异步的，需要使用 `await` 或 `.then()`
2. 网络错误会自动重试（可配置）
3. 请求超时时间默认为30秒
4. 所有响应都会进行错误处理，不会抛出未捕获的异常
5. 流式接口需要浏览器支持 `fetch` 和 `ReadableStream`

## 快速开始

### 在ChatBar组件中使用

```javascript
// 在Vue组件中导入
import { chatAPI } from '../services/api.js';

// 发送消息
const response = await chatAPI.sendMessage({
  message: '你好',
  model: 'gpt-3.5-turbo',
  history: [],
  context: { sessionId: 'session_123' }
});

// 获取可用模型
const models = await chatAPI.getAvailableModels();
```

### 查看完整示例

参考 `src/examples/chatbar-api-usage.js` 文件，包含：
- 基本消息发送
- 带历史记录的对话
- 流式聊天
- 错误处理
- 认证设置

## 更新日志

- v1.0.0: 初始版本，支持基本的聊天和工作流API
- 支持多种AI模型
- 支持流式响应
- 完整的错误处理机制
- 集成到ChatBar组件
- 添加使用示例和文档
