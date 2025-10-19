<template>
  <div class="left-sidebar">
    <div
      v-for="item in sidebarItems"
      :key="item.id"
      :class="['sidebar-item', { active: activeItem === item.id }]"
      @click="handleItemClick(item.id)"
      :title="item.label"
    >
      <el-icon :size="24">
        <component :is="item.icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Monitor, Clock, Box, Share } from '@element-plus/icons-vue';

const emit = defineEmits(['item-change']);

const activeItem = ref(null);

const sidebarItems = [
  { id: 1, icon: Monitor, label: '电脑素材' },
  { id: 2, icon: Clock, label: '时钟' },
  { id: 3, icon: Box, label: '箱子' },
  { id: 4, icon: Share, label: '分子结构/网络节点' }
];

const handleItemClick = (id) => {
  activeItem.value = id;
  emit('item-change', id);
};
</script>

<style scoped>
.left-sidebar {
  width: 80px;
  height: 100vh;
  background-color: #2c3e50;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 24px;
  z-index: 100;
}

.sidebar-item {
  width: 56px;
  height: 56px;
  background-color: #34495e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #ecf0f1;
}

.sidebar-item:hover {
  background-color: #445566;
}

.sidebar-item.active {
  background-color: #4a5f7f;
}
</style>