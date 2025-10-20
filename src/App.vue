<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <TopBar />
    
    <!-- 左侧边栏 -->
    <LeftSidebar @item-change="handleSidebarChange" />
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 根据当前标签页显示不同内容 -->
      <WorkflowInstance v-if="currentTab === 'Workflow'" />
      
      <!-- 其他标签页的占位内容 -->
      <div v-else class="content-area">
        <h1>WenCe Platform</h1>
        <p>当前左边栏项: {{ currentSidebarItem || '未选择' }}</p>
        <p>当前标签页: {{ currentTab }}</p>
        
        <div class="placeholder-content">
          <h2>{{ currentTab }} 内容区域</h2>
          <p>此标签页的内容正在开发中...</p>
        </div>
      </div>
    </div>
    
    <!-- 右侧聊天栏 -->
    <ChatBar />
    
    <!-- 底部标签栏 -->
    <BottomPanel @tab-change="handleBottomTabChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TopBar from './components/TopBar.vue';
import LeftSidebar from './components/LeftSidebar.vue';
import ChatBar from './components/WorkflowPage/ChatBar.vue';
import BottomPanel from './components/WorkflowPage/BottomPanel.vue';
import WorkflowInstance from './components/WorkflowPage/WorkflowInstance.vue';

const currentSidebarItem = ref(null);
const currentTab = ref('Workflow');

const handleSidebarChange = (id) => {
  currentSidebarItem.value = id;
  console.log('切换到左边栏项:', id);
};

const handleBottomTabChange = (tab) => {
  console.log('切换到底部标签页:', tab);
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
</style>