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
            title="用户意图"
            :initial-items="intentExtractorItems"
            @update="updateIntentExtractor"
            @details="showNodeDetails"
            @reject="rejectNode"
            @confirm="confirmNode"
          />

          <Node
            title="任务分解"
            :initial-items="taskDecompositionItems"
            @update="updateTaskDecomposition"
            @details="showNodeDetails"
            @reject="rejectNode"
            @confirm="confirmNode"
          />
        </div>

        <!-- 右侧：Workflow 和 Instance 垂直放置 -->
        <div class="workflow-instance-section">
          <WorkflowInstance
            ref="workflowInstanceRef"
            :workflow-data="workflowInstanceData"
          />
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
      :bottom-panel-data="bottomPanelData"
      @tab-change="handleBottomTabChange"
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

const workflowInstanceRef = ref(null);
const currentSidebarItem = ref(null);
const currentTab = ref("Workflow");

// 节点数据
const intentExtractorItems = ref([]);
const taskDecompositionItems = ref([]);
const workflowInstanceData = ref(null);
const bottomPanelData = ref({
  Overview: [],
  Intent: [],
  Decomposer: [],
  Planner: [],
  Executor: [],
  Synthesizer: [],
  "User Proxy": [],
});

const handleSidebarChange = (id) => {
  currentSidebarItem.value = id;
  console.log("切换到左边栏项:", id);
};

const handleBottomTabChange = (tab) => {
  console.log("切换到底部标签页:", tab);
};

// 拖动相关状态
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });

// 拖动功能
const startDrag = (e) => {
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

// 解析 intent_understand 的输出
const parseIntentOutput = (output) => {
  if (output.startsWith("```json")) {
    output = output.substring(7).trim();
  }
  if (output.endsWith("```")) {
    output = output.substring(0, output.length - 3).trim();
  }

  const items = [];
  const parsed = JSON.parse(output);
  for (var i in parsed){
    items.push(`意图: ${parsed[i].intent_type} \n\n描述: ${parsed[i].description} \n\n关键点: ${parsed[i].key_points}`);
  }

  console.log("[parseIntentOutput] 解析结果:", items);
  return items;
};

// 解析 task_decomposition 的输出
const parseTaskDecomposition = (output) => {
  try {
    let jsonStr = output.trim();

    // 提取 ```json 和 ``` 之间的内容（非贪婪模式，只匹配第一个JSON块）
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
    const match = jsonStr.match(jsonBlockRegex);

    if (match && match[1]) {
      jsonStr = match[1].trim();
    } else {
      // 如果没有找到json代码块，尝试普通代码块
      const codeBlockRegex = /```\s*([\s\S]*?)\s*```/;
      const codeMatch = jsonStr.match(codeBlockRegex);
      if (codeMatch && codeMatch[1]) {
        jsonStr = codeMatch[1].trim();
      }
    }

    // 移除JSON中的单行注释（// 开头的注释）
    // 注意：这个正则会移除 // 到行尾的所有内容
    jsonStr = jsonStr.replace(/\/\/.*$/gm, '');

    // 移除多余的逗号（JSON最后一个属性后不能有逗号）
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    // 验证是否是有效的JSON开头
    if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
      console.warn("[parseTaskDecomposition] 提取的内容可能不是JSON:", jsonStr.substring(0, 100));
    }

    const parsed = JSON.parse(jsonStr);
    console.log("[parseTaskDecomposition] 解析成功:", parsed);
    return parsed;
  } catch (error) {
    console.error("[parseTaskDecomposition] 解析失败:", error);
    console.error("[parseTaskDecomposition] 原始数据:", output);
    
    // 尝试提取所有JSON块，看是否有多个
    const allJsonBlocks = output.match(/```json\s*([\s\S]*?)\s*```/gi);
    if (allJsonBlocks && allJsonBlocks.length > 1) {
      console.warn("[parseTaskDecomposition] 检测到多个JSON代码块，尝试解析第一个");
    }
    
    return null;
  }
};

// // 提取反馈分析部分
// const extractFeedbackAnalysis = (output) => {
//   const match = output.match(/### 反馈分析([\s\S]*?)(?=### 调整后的任务列表|###[\s]*调整后|$)/);
//   return match ? match[0].trim() : '';
// };

// 提取更新后的执行路径
const extractExecutionPath = (output) => {
  const match = output.match(/### 更新后的执行路径([\s\S]*?)$/);
  return match ? match[0].trim() : "";
};

// 处理新消息
const handleNewMessage = (message) => {
  console.log("收到新消息:", message);

  if (message.role === "assistant" && message.toolInfo) {
    const toolName = message.toolInfo.tool_name;
    const toolOutput = message.toolInfo.tool_output;
    const fullData = message.metadata || {};

    // 所有数据都添加到 Overview
    bottomPanelData.value.Overview.push({
      tool_name: toolName,
      tool_output: toolOutput,
      timestamp: message.timestamp,
      metadata: fullData,
    });

    // 根据 tool_name 分发数据
    switch (toolName) {
      case "intent_understand": {
        // 更新 Intent Extractor Node
        const intentItems = parseIntentOutput(toolOutput);
        intentExtractorItems.value = intentItems;

        // 添加到 BottomPanel 的 Intent 标签
        bottomPanelData.value.Intent.push({
          tool_output: toolOutput,
          timestamp: message.timestamp,
          parsed_items: intentItems,
        });
        break;
      }

      case "task_decomposition": {
        const taskData = parseTaskDecomposition(toolOutput);

        if (taskData && taskData.tasks) {
          // 更新 Task Decomposition Node (仅显示一级任务名称)
          const taskNames = taskData.tasks.map((task) => task.task_name);
          taskDecompositionItems.value = taskNames;

          // 更新 WorkflowInstance (包含完整任务数据)
          workflowInstanceData.value = taskData;

          // 添加到 BottomPanel 的 Decomposer
          bottomPanelData.value.Decomposer.push({
            tool_output: toolOutput,
            timestamp: message.timestamp,
            parsed_data: taskData,
          });
        }
        break;
      }

      case "planning": {
        // 添加到 BottomPanel 的 Planner (完全替换原有逻辑)
        bottomPanelData.value.Planner.push({
          tool_output: toolOutput,
          timestamp: message.timestamp,
          tool_name: toolName,
        });
        break;
      }

      case "query_exam_result":
      case "task_result_saved":  {
        bottomPanelData.value.Executor.push({
          tool_output: toolOutput,
          timestamp: message.timestamp,
          tool_name: toolName,
        });
        break;
      }

      case "request_task_result": {
        // request_task_result 直接显示在 ChatBar，不需要特殊处理
        // ChatBar 会自动显示这类消息
        break;
      }

      case "feedback": {
        console.log("[handleNewMessage] 处理 feedback");
        console.log("[handleNewMessage] toolOutput:", toolOutput);

        // 提取调整后的任务列表
        const updatedTasks = parseTaskDecomposition(toolOutput);
        console.log("[handleNewMessage] 解析后的任务:", updatedTasks);

        if (updatedTasks && updatedTasks.tasks) {
          // 完全替换 WorkflowInstance 数据
          workflowInstanceData.value = updatedTasks;
          console.log("[handleNewMessage] workflowInstanceData 已更新");

          // 更新 Task Decomposition Node
          const taskNames = updatedTasks.tasks.map((task) => task.task_name);
          taskDecompositionItems.value = taskNames;
        } else {
          console.error("[handleNewMessage] 未能解析任务数据");
        }

        // 提取更新后的执行路径 (Mermaid 图表和说明)
        const executionPath = extractExecutionPath(toolOutput);

        // 追加到 BottomPanel 的 Planner
        if (executionPath) {
          bottomPanelData.value.Planner.push({
            tool_output: executionPath,
            timestamp: message.timestamp,
            tool_name: "feedback_path",
          });
        }

        // 反馈分析部分会在 ChatBar 中显示 (ChatBar 会自动处理)
        break;
      }

      case "finish": {
        console.log("[handleNewMessage] 收到 finish，标记所有任务为已完成");

        // 调用 WorkflowInstance 的方法标记所有任务为已完成
        if (workflowInstanceRef.value) {
          workflowInstanceRef.value.markAllAsCompleted();
        }

        // finish 消息也可能需要在其他地方显示
        // 根据需要添加到相应的面板
        break;
      }
      case "system":
      case "info_inquire":
        // 这些消息已经在 ChatBar 中显示
        break;

      default:
        console.log("未处理的 tool_name:", toolName);
    }
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
};

const rejectNode = (nodeData) => {
  console.log("否决节点:", nodeData);
};

const confirmNode = (nodeData) => {
  console.log("确认节点:", nodeData);
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
  min-height: calc(100vh - 144px);
}

.nodes-section {
  display: flex;
  flex-direction: row;
  gap: 20px;
  min-width: 50px;
  max-width: 800px;
  flex-shrink: 0;
}

.workflow-instance-section {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>