<template>
  <div class="app-container">
    <LeftSidebar @item-change="handleSidebarChange" />
    
    <div class="main-content">
      <h1>WenCe Platform</h1>
      <p>当前左边栏项: {{ currentSidebarItem || '未选择' }}</p>
      <p>当前标签页: {{ currentTab }}</p>
      
      <div class="content-area">
        <h2>主要内容区域</h2>
        <p>根据当前选中的标签页显示不同内容</p>
      </div>
    </div>
    
    <BottomTabBar @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LeftSidebar from './components/LeftSidebar.vue';
import BottomTabBar from './components/BottomTabBar.vue';

const currentSidebarItem = ref(null);
const currentTab = ref('Overview');

const handleSidebarChange = (id) => {
  currentSidebarItem.value = id;
  console.log('切换到左边栏项:', id);
};

const handleTabChange = (tab) => {
  currentTab.value = tab;
  console.log('切换到标签页:', tab);
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  margin-left: 80px;
  margin-bottom: 48px;
  padding: 32px;
}

.content-area {
  margin-top: 24px;
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  min-height: 400px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>