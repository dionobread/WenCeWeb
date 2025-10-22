/**
 * ChatBar API 使用示例
 * 展示如何使用统一的API服务进行消息收发
 */

import { chatAPI, apiService } from '../services/api.js';

// 示例1: 基本消息发送
async function sendBasicMessage() {
  console.log('=== 发送基本消息 ===');
  
  const response = await chatAPI.sendMessage({
    message: '你好，请介绍一下你自己',
    model: 'gpt-3.5-turbo',
    history: [],
    context: {
      sessionId: 'demo_session_001',
      timestamp: new Date().toISOString()
    }
  });

  if (response.success) {
    console.log('AI回复:', response.data.content);
  } else {
    console.error('发送失败:', response.error);
  }
}

// 示例2: 带历史记录的对话
async function sendMessageWithHistory() {
  console.log('=== 带历史记录的对话 ===');
  
  const history = [
    {
      role: 'user',
      content: '你好',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      role: 'assistant', 
      content: '你好！有什么可以帮助你的吗？',
      timestamp: new Date(Date.now() - 30000).toISOString()
    }
  ];

  const response = await chatAPI.sendMessage({
    message: '请帮我写一个JavaScript函数',
    model: 'gpt-4',
    history: history,
    context: {
      sessionId: 'demo_session_002',
      timestamp: new Date().toISOString()
    }
  });

  if (response.success) {
    console.log('AI回复:', response.data.content);
  } else {
    console.error('发送失败:', response.error);
  }
}

// 示例3: 获取可用模型列表
async function getModels() {
  console.log('=== 获取可用模型 ===');
  
  const response = await chatAPI.getAvailableModels();
  
  if (response.success) {
    console.log('可用模型:', response.data);
  } else {
    console.error('获取模型失败:', response.error);
  }
}

// 示例4: 流式聊天
async function streamChat() {
  console.log('=== 流式聊天 ===');
  
  let fullResponse = '';
  
  await chatAPI.sendStreamMessage(
    {
      message: '请详细解释一下Vue.js的响应式原理',
      model: 'gpt-3.5-turbo',
      history: [],
      context: {
        sessionId: 'demo_session_003',
        timestamp: new Date().toISOString()
      }
    },
    // 消息回调
    (data) => {
      console.log('收到数据块:', data);
      if (data.content) {
        fullResponse += data.content;
        // 这里可以实时更新UI
      }
    },
    // 错误回调
    (error) => {
      console.error('流式请求错误:', error);
    },
    // 完成回调
    () => {
      console.log('流式响应完成，完整回复:', fullResponse);
    }
  );
}

// 示例5: WebSocket聊天
function webSocketChat() {
  console.log('=== WebSocket聊天 ===');
  
  // 创建WebSocket连接
  const ws = chatAPI.createWebSocket('ws://192.168.3.176:8000/ws');
  
  // 设置事件监听器
  ws.onopen = () => {
    console.log('[*] WebSocket已连接后端');
    // 发送测试消息
    ws.send('你好，这是WebSocket测试消息');
  };

  ws.onmessage = (event) => {
    console.log('【后端】', event.data);
  };

  ws.onclose = () => {
    console.log('[*] WebSocket连接已断开');
  };

  ws.onerror = (error) => {
    console.error('[!] WebSocket出错:', error);
  };

  // 返回WebSocket实例，方便外部控制
  return ws;
}

// 示例6: 设置认证token
function setupAuth() {
  console.log('=== 设置认证 ===');
  
  // 设置JWT token
  apiService.setAuthToken('your-jwt-token-here');
  
  // 发送需要认证的请求
  sendBasicMessage();
  
  // 移除认证token
  // apiService.removeAuthToken();
}

// 示例7: 错误处理
async function handleErrors() {
  console.log('=== 错误处理示例 ===');
  
  try {
    const response = await chatAPI.sendMessage({
      message: '测试消息',
      model: 'invalid-model', // 故意使用无效模型
      history: [],
      context: {
        sessionId: 'error_test',
        timestamp: new Date().toISOString()
      }
    });

    if (!response.success) {
      console.log('API返回错误:', response.error);
      // 处理业务逻辑错误
      if (response.error.includes('模型')) {
        console.log('模型不存在，请选择其他模型');
      }
    }
  } catch (error) {
    console.error('网络错误:', error.message);
    // 处理网络错误
  }
}

// 运行所有示例
async function runAllExamples() {
  console.log('开始运行ChatBar API示例...\n');
  
  try {
    await getModels();
    console.log('\n');
    
    await sendBasicMessage();
    console.log('\n');
    
    await sendMessageWithHistory();
    console.log('\n');
    
    // 注意：流式聊天需要后端支持
    // await streamChat();
    // console.log('\n');
    
    // WebSocket聊天示例
    // const ws = webSocketChat();
    // console.log('\n');
    
    await handleErrors();
    
  } catch (error) {
    console.error('运行示例时出错:', error);
  }
  
  console.log('\n示例运行完成！');
}

// 导出示例函数
export {
  sendBasicMessage,
  sendMessageWithHistory,
  getModels,
  streamChat,
  webSocketChat,
  setupAuth,
  handleErrors,
  runAllExamples
};

// 如果直接运行此文件，执行所有示例
if (import.meta.hot) {
  // 在开发环境中可以调用
  window.chatAPIExamples = {
    runAll: runAllExamples,
    sendBasic: sendBasicMessage,
    getModels: getModels,
    stream: streamChat,
    webSocket: webSocketChat
  };
}
