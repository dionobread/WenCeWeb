<template>
  <div class="bottom-panel-container">
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
    <div class="content-panel">
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

const activeTab = ref('Overview');

const tabs = [
  'Overview',
  'Intent',
  'Decomposer',
  'Planner',
  'Executor',
  'Synthesizer',
  'User Proxy'
];

const currentData = computed(() => {
  return props.bottomPanelData[activeTab.value] || [];
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
}

.bottom-tabbar {
  height: 40px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
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
  height: 200px;
  background-color: #f3f0ff;
  color: #1a1a1a;
  overflow: auto;
  padding: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 20px;
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
</style>