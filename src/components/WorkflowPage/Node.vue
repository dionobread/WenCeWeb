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
        
        <textarea 
          v-model="items[index]" 
          class="item-input"
          @blur="updateItem(index, $event.target.value)"
          @input="autoResize($event)"
          rows="1"
          ref="textareas"
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
        <textarea 
          v-model="newItem" 
          class="new-item-input"
          placeholder="添加新项..."
          @keyup.enter="addItem"
          @input="autoResizeNewItem($event)"
          rows="1"
          ref="newItemTextarea"
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
import { ref, watch, nextTick } from 'vue';

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
const textareas = ref([]);
const newItemTextarea = ref(null);

// 监听 props.initialItems 的变化
watch(() => props.initialItems, (newItems) => {
  console.log(`[Node ${props.title}] initialItems 更新:`, newItems);
  items.value = [...newItems];
  // 等待DOM更新后调整所有textarea的高度
  nextTick(() => {
    textareas.value.forEach(textarea => {
      if (textarea) {
        autoResize({ target: textarea });
      }
    });
  });
}, { deep: true });

// 自动调整现有项目textarea的高度
const autoResize = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

// 自动调整新项textarea的高度
const autoResizeNewItem = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

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
  const textarea = textareas.value[index];
  if (textarea) {
    textarea.focus();
    textarea.select();
  }
};

const addItem = () => {
  if (newItem.value.trim()) {
    items.value.push(newItem.value.trim());
    newItem.value = '';
    emit('update', items.value);
    
    // 重置新项目textarea的高度
    nextTick(() => {
      if (newItemTextarea.value) {
        newItemTextarea.value.style.height = 'auto';
      }
    });
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
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 10px;
  min-width: 240px;
  max-width: 320px;
  overflow: hidden;
  transform: scale(0.9);
  transform-origin: center;
}

.node-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 10px 12px;
  color: white;
}

.node-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.node-content {
  padding: 12px;
}

.item-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 6px;
}

.delete-btn {
  background: #a2a2a2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-top: 6px;
}

.delete-btn:hover {
  background: #dc2626;
}

.item-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
  transition: border-color 0.2s;
  min-width: 0;
  resize: none;
  overflow: hidden;
  font-family: inherit;
  line-height: 1.4;
}

.item-input:focus {
  outline: none;
  border-color: #667eea;
}

.edit-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 3px;
  padding: 3px 6px;
  cursor: pointer;
  font-size: 10px;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-top: 6px;
}

.edit-btn:hover {
  background: #e5e7eb;
}

.add-item-row {
  display: flex;
  align-items: flex-start;
  margin-top: 12px;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.new-item-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: #f9fafb;
  transition: border-color 0.2s;
  min-width: 0;
  resize: none;
  overflow: hidden;
  font-family: inherit;
  line-height: 1.4;
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
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-top: 6px;
}

.add-btn:hover {
  background: #059669;
}

.node-footer {
  display: flex;
  gap: 6px;
  padding: 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
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
  background: #dc6565;
  color: white;
}

.reject-btn:hover {
  background: #8e4949;
}

.confirm-btn {
  background: #10b981;
  color: white;
}

.confirm-btn:hover {
  background: #059669;
}
</style>