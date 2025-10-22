<template>
  <div class="workflow-node-container">
    <div class="node-header">
      <h3 class="node-title">{{ title }}</h3>
    </div>
    
    <div class="node-content">
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="item-row"
      >
        <button 
          class="delete-btn" 
          @click="deleteItem(index)"
          title="删除此项"
        >
          ×
        </button>
        
        <input 
          v-model="items[index]" 
          class="item-input"
          @blur="updateItem(index, $event.target.value)"
        />
        
        <button 
          class="edit-btn" 
          @click="editItem(index)"
          title="编辑此项"
        >
          ✏️
        </button>
      </div>
      
      <div class="add-item-row">
        <input 
          v-model="newItem" 
          class="new-item-input"
          placeholder="添加新项..."
          @keyup.enter="addItem"
        />
        <button 
          class="add-btn" 
          @click="addItem"
          title="添加新项"
        >
          +
        </button>
      </div>
    </div>
    
    <div class="node-footer">
      <button class="action-btn detail-btn" @click="showDetails">
        详情
      </button>
      <button class="action-btn reject-btn" @click="reject">
        否决
      </button>
      <button class="action-btn confirm-btn" @click="confirm">
        确定
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

// 定义组件名称
defineOptions({
  name: 'WorkflowNode'
});

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  initialItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update', 'details', 'reject', 'confirm']);

const items = ref([...props.initialItems]);
const newItem = ref('');

const deleteItem = (index) => {
  items.value.splice(index, 1);
  emit('update', items.value);
};

const updateItem = (index, value) => {
  items.value[index] = value;
  emit('update', items.value);
};

const editItem = (index) => {
  // 聚焦到对应的输入框
  const input = document.querySelectorAll('.item-input')[index];
  if (input) {
    input.focus();
    input.select();
  }
};

const addItem = () => {
  if (newItem.value.trim()) {
    items.value.push(newItem.value.trim());
    newItem.value = '';
    emit('update', items.value);
  }
};

const showDetails = () => {
  emit('details', { title: props.title, items: items.value });
};

const reject = () => {
  emit('reject', { title: props.title, items: items.value });
};

const confirm = () => {
  emit('confirm', { title: props.title, items: items.value });
};
</script>

<style scoped>
.workflow-node-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 16px;
  min-width: 300px;
  max-width: 400px;
  overflow: hidden;
}

.node-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  color: white;
}

.node-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.node-content {
  padding: 20px;
}

.item-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background: #dc2626;
}

.item-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.item-input:focus {
  outline: none;
  border-color: #667eea;
}

.edit-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background: #e5e7eb;
}

.add-item-row {
  display: flex;
  align-items: center;
  margin-top: 16px;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.new-item-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #f9fafb;
  transition: border-color 0.2s;
}

.new-item-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.add-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #059669;
}

.node-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn {
  background: #6b7280;
  color: white;
}

.detail-btn:hover {
  background: #4b5563;
}

.reject-btn {
  background: #ef4444;
  color: white;
}

.reject-btn:hover {
  background: #dc2626;
}

.confirm-btn {
  background: #10b981;
  color: white;
}

.confirm-btn:hover {
  background: #059669;
}
</style>
