/**
 * 简化的API服务模块
 */

import { apiConfig } from '../config/api.js';

/**
 * 聊天API服务
 */
export const chatAPI = {
  /**
   * 创建WebSocket连接
   * @param {string} [url] - WebSocket地址，默认使用配置中的地址
   * @returns {WebSocket} WebSocket实例
   */
  createWebSocket(url = null) {
    const wsUrl = url || apiConfig.wsURL;
    return new WebSocket(wsUrl);
  },

  /**
   * 发送WebSocket消息
   * @param {WebSocket} ws - WebSocket连接
   * @param {string} message - 消息内容
   * @param {Function} onMessage - 消息回调函数
   * @param {Function} onError - 错误回调函数
   * @param {Function} onClose - 关闭回调函数
   */
  sendMessage(ws, message, onMessage, onError, onClose) {
    // 连接打开时发送消息
    ws.onopen = () => {
      console.log('[Info] 已连接后端，发送消息');
      ws.send(message);
    };

    // 接收消息
    ws.onmessage = (event) => {
      console.log('[Info] 消息返回：', event.data);
      if (onMessage) {
        onMessage(event.data);
      }
    };

    // 连接关闭
    ws.onclose = () => {
      console.log('[Info] 连接已断开');
      if (onClose) {
        onClose();
      }
    };

    // 连接错误
    ws.onerror = (error) => {
      console.error('[Error] 出错:', error);
      if (onError) {
        onError(error);
      }
    };
  }
};

// 默认导出
export default chatAPI;
