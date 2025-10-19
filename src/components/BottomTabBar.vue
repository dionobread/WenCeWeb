<template>
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
</template>

<script setup>
import { ref } from 'vue';

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

const handleTabClick = (tab) => {
  activeTab.value = tab;
  emit('tab-change', tab);
};
</script>

<style scoped>
.bottom-tabbar {
  position: fixed;
  bottom: 0;
  left: 80px;
  right: 0;
  height: 48px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  z-index: 99;
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
</style>