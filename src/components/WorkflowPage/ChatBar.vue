<template>
  <div class="chatbar-container">
    <!-- 消息展示区域 -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p>开始你的对话</p>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'message-item',
          message.role === 'user' ? 'user-message' : 'ai-message',
        ]"
      >
        <div class="message-avatar">
          <svg v-if="message.role === 'user'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
        </div>

        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>

      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="message-item ai-message">
        <div class="message-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
        </div>
        <div class="typing-indicator"></div>
      </div>

    </div>

    <!-- 底部输入区域 -->
    <div class="input-container">
      
      <div class="model-selector">
        <select v-model="selectedModel" class="model-select">
          <option
            v-for="model in availableModels"
            :key="model.value"
            :value="model.value"
          >
            {{ model.label }}
          </option>
        </select>
      </div>


      <!-- 输入框和发送按钮 -->
      <div class="input-wrapper">
        
        <textarea
          v-model="inputMessage"
          @keydown.enter.prevent="handleEnterKey"
          @input="adjustTextareaHeight"
          placeholder="输入消息..."
          class="message-input"
          ref="messageInput"
          rows="1"
        ></textarea>

        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="send-button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>

      </div>

    </div>

  </div>
</template>

<script>
import { chatAPI } from '../../services/api.js';

export default {
  name: "SideChatDialog",
  data() {
    return {
      messages: [],
      inputMessage: "",
      selectedModel: "gpt-3.5-turbo",
      isLoading: false,
      wsConnection: null, // WebSocket连接
      availableModels: [
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        { value: "gpt-4", label: "GPT-4" },
        { value: "claude-3", label: "Claude 3" },
        { value: "gemini-pro", label: "Gemini Pro" },
      ],
    };
  },
  async mounted() {
    this.scrollToBottom();
    await this.loadAvailableModels();
    this.initWebSocket();
  },
  beforeUnmount() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  },
  updated() {
    this.scrollToBottom(); // 每次数据更新后聊天框滚动到底部
  },
  methods: {
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return;

      // 添加用户消息
      const userMessage = {
        role: "user",
        content: this.inputMessage.trim(),
        timestamp: new Date(),
      };
      this.messages.push(userMessage);

      // 清空输入框
      const message = this.inputMessage;
      this.inputMessage = "";
      this.adjustTextareaHeight();

      // 通过WebSocket发送消息
      this.sendViaWebSocket(message);
    },

    sendViaWebSocket(message) {
      this.isLoading = true;
      
      // 如果连接已关闭，重新连接
      if (this.wsConnection.readyState === WebSocket.CLOSED) {
        this.initWebSocket();
      }
      
      chatAPI.sendMessage(
        this.wsConnection,
        message,
        (data) => {
          // 接收消息回调
          const aiMessage = {
            role: "assistant",
            content: data,
            timestamp: new Date(),
          };
          this.messages.push(aiMessage);
          this.isLoading = false;
        },
        (error) => {
          // 错误回调
          console.error('[!] WebSocket出错:', error);
          this.isLoading = false;
          const errorMessage = {
            role: "assistant",
            content: "WebSocket连接出错，请检查网络连接。",
            timestamp: new Date(),
          };
          this.messages.push(errorMessage);
        },
        () => {
          // 关闭回调
          console.log('[*] WebSocket连接已断开');
          this.isLoading = false;
        }
      );
    },

    handleEnterKey(event) {
      // 如果按了 Shift + Enter，允许换行
      if (event.shiftKey) {
        return;
      } else {
        this.sendMessage(); // 如果只按了 Enter，发送消息
      }
    },

    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        container.scrollTop = container.scrollHeight;
      });
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getModelLabel(value) {
      const model = this.availableModels.find((m) => m.value === value);
      return model ? model.label : value;
    },

    /**
     * 加载可用的AI模型列表
     */
    async loadAvailableModels() {
      // 使用默认模型列表
      console.log('使用默认模型列表');
    },

    /**
     * 初始化WebSocket连接
     */
    initWebSocket() {
      try {
        console.log('[Info] 初始化WebSocket连接...');
        this.wsConnection = chatAPI.createWebSocket();
        
        this.wsConnection.onopen = () => {
          console.log('[Info] WebSocket已连接后端');
        };

        this.wsConnection.onclose = () => {
          console.log('[Info] WebSocket连接已断开');
          this.isLoading = false;
        };

        this.wsConnection.onerror = (error) => {
          console.error('[Error] WebSocket出错:', error);
          this.isLoading = false;
        };
      } catch (error) {
        console.error('[Error] 初始化WebSocket失败:', error);
        const errorMessage = {
          role: "assistant",
          content: "WebSocket连接初始化失败，请检查网络连接。",
          timestamp: new Date(),
        };
        this.messages.push(errorMessage);
      }
    },

  },
};
</script>

<style scoped>
.chatbar-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 300px;
  top: 66px;
  right: 10px;
  bottom: 0px;
  background: #ffffff;
  border-radius: 12px 12px 0px 0px; 
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden; 
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.user-message .message-avatar {
  background: #3b82f6;
  color: white;
  margin-left: 12px;
}

.ai-message .message-avatar {
  background: #f3f4f6;
  color: #6b7280;
  margin-right: 12px;
}

.message-content {
  max-width: 70%;
}

.user-message .message-content {
  text-align: right;
}

.message-text {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 16px;
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 14px;
  color: #1f2937;
}

.user-message .message-text {
  background: #3b82f6;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 16px;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.input-container {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: white;
}

.model-selector {
  margin-bottom: 12px;
}

.model-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.model-select:hover {
  border-color: #d1d5db;
}

.model-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  transition: all 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input::placeholder {
  color: #9ca3af;
}

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  background: #e5e7eb;
  cursor: not-allowed;
  color: #9ca3af;
}

.send-button svg {
  width: 20px;
  height: 20px;
}
</style>