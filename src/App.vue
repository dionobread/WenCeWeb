<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <TopBar />

    <!-- 左侧边栏 -->
    <LeftSidebar @item-change="handleSidebarChange" />

    <!-- 主要内容区域 -->
    <div
      class="main-content"
      :style="{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <!-- 根据当前标签页显示不同内容 -->
      <div v-if="currentTab === 'Workflow'" class="workflow-layout">
        <!-- 左侧：两个 Node 水平放置 -->
        <div class="nodes-section">
          <Node
            title="Intent Extractor"
            :initial-items="intentExtractorItems"
            @update="updateIntentExtractor"
            @details="showNodeDetails"
            @reject="rejectNode"
            @confirm="confirmNode"
          />

          <Node
            title="Task Decomposition"
            :initial-items="taskDecompositionItems"
            @update="updateTaskDecomposition"
            @details="showNodeDetails"
            @reject="rejectNode"
            @confirm="confirmNode"
          />
        </div>
        
        <!-- 右侧：Workflow 和 Instance 垂直放置 -->
        <div class="workflow-instance-section">
          <WorkflowInstance />
        </div>
      </div>

      <!-- 其他标签页的占位内容 -->
      <div v-else class="content-area">
        <h1>WenCe Platform</h1>
        <p>当前左边栏项: {{ currentSidebarItem || "未选择" }}</p>
        <p>当前标签页: {{ currentTab }}</p>

        <div class="placeholder-content">
          <h2>{{ currentTab }} 内容区域</h2>
          <p>此标签页的内容正在开发中...</p>
        </div>
      </div>
    </div>

    <!-- 右侧聊天栏 -->
    <ChatBar @new-message="handleNewMessage" />

    <!-- 底部标签栏 -->
    <BottomPanel
      :height="bottomPanelHeight"
      @tab-change="handleBottomTabChange"
      @height-change="handleBottomPanelHeightChange"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import TopBar from "./components/TopBar.vue";
import LeftSidebar from "./components/LeftSidebar.vue";
import ChatBar from "./components/WorkflowPage/ChatBar.vue";
import BottomPanel from "./components/WorkflowPage/BottomPanel.vue";
import WorkflowInstance from "./components/WorkflowPage/WorkflowInstance.vue";
import Node from "./components/WorkflowPage/Node.vue";

const currentSidebarItem = ref(null);
const currentTab = ref("Workflow");

// 存储聊天消息
const latestChatMessage = ref(null);
const allChatMessages = ref([]);

// 处理新消息
const handleNewMessage = (message) => {
  console.log('收到新消息:', message);
  latestChatMessage.value = message;
  allChatMessages.value.push(message);
  
  // 根据消息内容更新节点或其他组件
  processChatMessage(message);
};

// 处理聊天消息的业务逻辑
const processChatMessage = (message) => {
  if (message.role === 'user') {
    // 处理用户消息
    console.log('用户说:', message.content);
  } else if (message.role === 'assistant') {
    // 处理 AI 回复
    console.log('AI 回复:', message.content);
    updateIntentExtractor(["1"]);
    updateTaskDecomposition(["2"]);
  }
};

// 拖动相关状态
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });

// 节点数据
const intentExtractorItems = ref([]);
const taskDecompositionItems = ref([]);

const handleSidebarChange = (id) => {
  currentSidebarItem.value = id;
  console.log("切换到左边栏项:", id);
};

const handleBottomTabChange = (tab) => {
  console.log("切换到底部标签页:", tab);
};

// 拖动功能
const startDrag = (e) => {
  // main-content 可以拖动
  isDragging.value = true;
  dragStart.value = { x: e.clientX, y: e.clientY };
  document.body.style.cursor = "grabbing";
  document.body.style.userSelect = "none";
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  const deltaX = e.clientX - dragStart.value.x;
  const deltaY = e.clientY - dragStart.value.y;

  dragOffset.value = {
    x: dragOffset.value.x + deltaX,
    y: dragOffset.value.y + deltaY,
  };

  dragStart.value = { x: e.clientX, y: e.clientY };
};

const endDrag = () => {
  if (isDragging.value) {
    isDragging.value = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
};

// 节点相关方法
const updateIntentExtractor = (items) => {
  intentExtractorItems.value = items;
  console.log("Intent Extractor 更新:", items);
};

const updateTaskDecomposition = (items) => {
  taskDecompositionItems.value = items;
  console.log("Task Decomposition 更新:", items);
};

const showNodeDetails = (nodeData) => {
  console.log("显示节点详情:", nodeData);
  // 这里可以添加显示详情的逻辑
};

const rejectNode = (nodeData) => {
  console.log("否决节点:", nodeData);
  // 这里可以添加否决节点的逻辑
};

const confirmNode = (nodeData) => {
  console.log("确认节点:", nodeData);
  // 这里可以添加确认节点的逻辑
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  margin-left: 80px;
  margin-top: 56px;
  margin-bottom: 48px;
  margin-right: 370px;
  padding: 0;
  min-height: calc(100vh - 104px);
  cursor: grab;
  transition: transform 0.1s ease-out;
}

.main-content:active {
  cursor: grabbing;
}

.content-area {
  padding: 32px;
  background-color: white;
  border-radius: 8px;
  margin: 24px;
  min-height: 400px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.placeholder-content {
  margin-top: 24px;
  padding: 48px;
  background-color: #f9fafb;
  border-radius: 8px;
  text-align: center;
}

.placeholder-content h2 {
  color: #374151;
  margin-bottom: 12px;
}

.placeholder-content p {
  color: #6b7280;
}

.workflow-layout {
  display: flex;
  height: 100%;
  gap: 20px;
  padding: 20px;
  min-height: calc(100vh - 144px); /* 确保有足够的高度 */
}

/* 左侧节点区域 - 两个 Node 水平放置 */
.nodes-section {
  display: flex;
  flex-direction: row;
  gap: 20px;
  min-width: 50px; /* 两个 node 的最小宽度 */
  max-width: 800px;
  flex-shrink: 0;
}

/* 右侧 Workflow 和 Instance 区域 - 垂直放置 */
.workflow-instance-section {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>