<template>
  <div 
    class="bottom-panel-container" 
    :class="{ collapsed: isCollapsed }"
    :style="{ height: containerHeight }"
  >
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="panel-title">控制台面板</div>
      <div class="panel-controls">
        <!-- 伸缩手柄 -->
        <div 
          v-if="!isCollapsed" 
          class="resize-handle"
          @mousedown="startResize"
          title="拖动调整高度"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7,15H9V9H7M11,15H13V9H11M15,15H17V9H15M7,19H17V21H7V19Z" />
          </svg>
        </div>
        <!-- 折叠按钮 -->
        <button 
          class="collapse-btn"
          @click="toggleCollapse"
          :title="isCollapsed ? '展开面板' : '折叠面板'"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            :style="{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }"
          >
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 底部标签栏 -->
    <div class="bottom-tabbar">
      <div
        v-for="tab in tabs"
        :key="tab"
        :class="['tab-item', { active: activeTab === tab }]"
        @click="handleTabClick(tab)"
      >
        <span class="tab-label">{{ tab }}</span>
        <div v-if="activeTab === tab" class="active-underline"></div>
      </div>
    </div>

    <!-- 底部内容面板 -->
    <div 
      class="content-panel" 
      :style="{ height: panelHeight + 'px' }"
    >
      <div v-if="currentData && currentData.length > 0" class="json-display">
        <div
          v-for="(item, index) in currentData"
          :key="index"
          class="data-entry"
        >
          <div class="entry-header">
            <span class="tool-name">{{ item.tool_name || 'Data' }}</span>
            <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
          </div>
          <div
            v-for="(line, lineIndex) in formatDataOutput(item)"
            :key="lineIndex"
            class="json-line"
            v-html="line"
          ></div>
          <div v-if="index < currentData.length - 1" class="entry-divider"></div>
        </div>
      </div>
      <div v-else class="empty-state">
        {{ activeTab }} 数据暂无内容
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  bottomPanelData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['tab-change']);

const activeTab = ref('总览');
const isCollapsed = ref(false);
const panelHeight = ref(200);
const isResizing = ref(false);

const tabs = [
  '总览',
  '意图理解',
  '任务分解',
  '任务规划',
  '任务执行',
  '总结',
  '用户输入'
];

const currentData = computed(() => {
  return props.bottomPanelData[activeTab.value] || [];
});

const containerHeight = computed(() => {
  if (isCollapsed.value) {
    return '40px'; // 只显示标签栏的高度
  }
  return (40 + panelHeight.value) + 'px'; // 标签栏高度 + 内容面板高度
});

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatJson = (obj) => {
  return JSON.stringify(obj, null, 2);
};

const highlightJson = (jsonString) => {
  let result = jsonString;
  
  // 键名高亮 (深紫色)
  result = result.replace(
    /"([^"]+)":/g,
    '<span style="color: #6b46c1; font-weight: 600;">"$1"</span>:'
  );
  
  // 字符串值高亮 (深绿色)
  result = result.replace(
    /: "([^"]*)"/g,
    ': <span style="color: #047857;">"$1"</span>'
  );
  
  // 数字高亮 (深橙色)
  result = result.replace(
    /: (\d+\.?\d*)/g,
    ': <span style="color: #c2410c;">$1</span>'
  );
  
  // 布尔值和null高亮 (深蓝色)
  result = result.replace(
    /: (true|false|null)/g,
    ': <span style="color: #1e40af;">$1</span>'
  );
  
  return result;
};

const formatDataOutput = (item) => {
  let output = '';
  
  if (item.tool_output) {
    output = item.tool_output;
  } else if (item.parsed_data) {
    output = formatJson(item.parsed_data);
  } else if (item.parsed_items) {
    output = formatJson(item.parsed_items);
  } else {
    output = formatJson(item);
  }
  
  return output.split('\n').map(line => highlightJson(line));
};

const handleTabClick = (tab) => {
  activeTab.value = tab;
  emit('tab-change', tab);
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const startResize = (e) => {
  isResizing.value = true;
  const startY = e.clientY;
  const startHeight = panelHeight.value;
  
  const doResize = (moveEvent) => {
    if (!isResizing.value) return;
    
    const deltaY = startY - moveEvent.clientY;
    let newHeight = startHeight + deltaY;
    
    // 限制高度范围
    newHeight = Math.max(100, Math.min(500, newHeight));
    panelHeight.value = newHeight;
  };
  
  const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
  };
  
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
};
</script>

<style scoped>
.bottom-panel-container {
  position: fixed;
  bottom: 0;
  left: 60px;
  right: 310px;
  display: flex;
  flex-direction: column;
  z-index: 99;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  transition: height 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.panel-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resize-handle {
  width: 16px;
  height: 16px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

.bottom-tabbar {
  height: 40px;
  background-color: #ffffff;
  display: flex;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: color 0.3s ease;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.tab-item:hover .tab-label {
  color: #303133;
}

.tab-item.active .tab-label {
  color: #409eff;
}

.active-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #409eff;
}

.content-panel {
  background-color: #f3f0ff;
  color: #1a1a1a;
  overflow: auto;
  padding: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 20px;
  transition: height 0.3s ease;
}

.json-display {
  white-space: pre;
}

.data-entry {
  margin-bottom: 16px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #d8b4fe;
}

.tool-name {
  font-weight: 600;
  color: #6b46c1;
  font-size: 14px;
}

.timestamp {
  font-size: 12px;
  color: #9ca3af;
}

.json-line {
  min-height: 20px;
}

.entry-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #d8b4fe, transparent);
  margin: 16px 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 自定义滚动条 */
.content-panel::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.content-panel::-webkit-scrollbar-track {
  background: #e9e5f5;
}

.content-panel::-webkit-scrollbar-thumb {
  background: #c4b5fd;
  border-radius: 5px;
}

.content-panel::-webkit-scrollbar-thumb:hover {
  background: #a78bfa;
}

/* 折叠状态 */
.bottom-panel-container.collapsed .content-panel {
  height: 0 !important;
  padding: 0;
  overflow: hidden;
}

.collapsed .resize-handle {
  display: none;
}
</style>