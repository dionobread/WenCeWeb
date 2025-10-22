/**
 * 统一的API服务模块
 * 用于ChatBar组件的消息收发功能
 */

import { apiConfig } from '../config/api.js';

class APIService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
    this.authToken = null;
  }

  /**
   * 设置认证token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * 移除认证token
   */
  removeAuthToken() {
    this.authToken = null;
  }

  /**
   * 发送HTTP请求
   * @param {string} endpoint - API端点
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 添加认证头
    if (this.authToken) {
      config.headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        success: false,
        error: error.message || '网络请求失败',
      };
    }
  }

  /**
   * 发送GET请求
   * @param {string} endpoint - API端点
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 响应数据
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * 发送POST请求
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} 响应数据
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// 创建API服务实例
const apiService = new APIService();

/**
 * 聊天API
 */
export const chatAPI = {
  /**
   * 发送消息
   * @param {Object} messageData - 消息数据
   * @param {string} messageData.message - 消息内容
   * @param {string} messageData.model - AI模型
   * @param {Array} messageData.history - 历史消息
   * @param {Object} messageData.context - 上下文信息
   * @returns {Promise<Object>} 响应数据
   */
  async sendMessage(messageData) {
    return apiService.post('/chat/send', messageData);
  },

  /**
   * 创建WebSocket连接
   * @param {string} url - WebSocket地址，默认使用配置中的地址
   * @returns {WebSocket} WebSocket实例
   */
  createWebSocket(url = null) {
    const wsUrl = url || apiService.baseURL.replace('http', 'ws') + '/ws';
    return new WebSocket(wsUrl);
  },

  /**
   * 通过WebSocket发送消息
   * @param {WebSocket} ws - WebSocket连接
   * @param {string} message - 消息内容
   * @param {Function} onMessage - 消息回调函数
   * @param {Function} onError - 错误回调函数
   * @param {Function} onClose - 关闭回调函数
   */
  sendWebSocketMessage(ws, message, onMessage, onError, onClose) {
    // 设置事件监听器
    ws.onopen = () => {
      console.log('[*] WebSocket已连接后端');
      ws.send(message);
    };

    ws.onmessage = (event) => {
      console.log('【后端】', event.data);
      onMessage && onMessage(event.data);
    };

    ws.onclose = () => {
      console.log('[*] WebSocket连接已断开');
      onClose && onClose();
    };

    ws.onerror = (error) => {
      console.error('[!] WebSocket出错:', error);
      onError && onError(error);
    };
  },

  /**
   * 获取可用的AI模型列表
   * @returns {Promise<Object>} 模型列表
   */
  async getAvailableModels() {
    return apiService.get('/chat/models');
  },

  /**
   * 流式发送消息（实时响应）
   * @param {Object} messageData - 消息数据
   * @param {Function} onMessage - 消息回调函数
   * @param {Function} onError - 错误回调函数
   * @param {Function} onComplete - 完成回调函数
   * @returns {Promise<void>}
   */
  async sendStreamMessage(messageData, onMessage, onError, onComplete) {
    try {
      const url = `${apiService.baseURL}/chat/stream`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiService.authToken && {
            Authorization: `Bearer ${apiService.authToken}`,
          }),
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete && onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              onMessage && onMessage(data);
            } catch {
              console.warn('解析流式数据失败:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('流式请求失败:', error);
      onError && onError(error);
    }
  },
};

/**
 * 工作流API
 */
export const workflowAPI = {
  /**
   * 获取工作流列表
   * @returns {Promise<Object>} 工作流列表
   */
  async getWorkflows() {
    return apiService.get('/workflows');
  },

  /**
   * 获取工作流详情
   * @param {string} workflowId - 工作流ID
   * @returns {Promise<Object>} 工作流详情
   */
  async getWorkflow(workflowId) {
    return apiService.get(`/workflows/${workflowId}`);
  },
};

// 导出API服务实例
export { apiService };

// 默认导出
export default {
  chatAPI,
  workflowAPI,
  apiService,
};
