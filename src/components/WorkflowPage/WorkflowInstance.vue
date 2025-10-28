<template>
  <div class="workflow-instance-container">
    <!-- Workflow 区域 -->
    <div class="workflow-section">
      <div class="section-header">
        <h2 class="section-title">WorkFlow</h2>
        <span class="section-subtitle">诊疗流程</span>
      </div>
      
      <div class="workflow-list">
        <template v-for="(workflow, index) in workflows" :key="workflow.id">
          <div
            class="workflow-card"
            :class="{ 'workflow-card-active': selectedWorkflow?.id === workflow.id }"
            @click="handleWorkflowClick(workflow)"
          >
            <div class="workflow-card-header">
              <h3 class="workflow-name">{{ workflow.name }}</h3>
              <button
                class="display-btn"
                @click.stop="handleDisplay(workflow)"
              >
                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div class="workflow-subtitle">
              {{ workflow.subTasks.length }} 个子任务
            </div>
          </div>
          
          <div v-if="index < workflows.length - 1" class="arrow-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </template>
      </div>
    </div>

    <!-- Instance 区域 -->
    <div class="instance-section">
      <div class="section-header">
        <h2 class="section-title">Instance</h2>
        <span v-if="selectedWorkflow" class="section-subtitle">
          当前执行: {{ selectedWorkflow.name }}
        </span>
      </div>
      
      <div v-if="selectedWorkflow" class="instance-grid">
        <div
          v-for="task in currentSubTasks"
          :key="task.id"
          class="instance-card"
          :class="{
            'instance-card-completed': task.status === 'yes'
          }"
        >
          <div class="instance-card-header">
            <h4 class="instance-name">{{ task.name }}</h4>
            <div class="status-icon">
              <svg v-if="task.status === 'yes'" class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <svg v-else class="icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          
          <div class="status-badge" :class="`status-${task.status === 'yes' ? 'completed' : 'pending'}`">
            {{ getStatusText(task.status) }}
          </div>
          
          <!-- 任务描述 -->
          <div v-if="task.description" class="task-description">
            {{ task.description }}
          </div>
          
          <!-- 期望结果类型 -->
          <div v-if="task.expected_result_type" class="task-info-item">
            <span class="info-label">结果类型:</span>
            <span class="info-value">{{ task.expected_result_type }}</span>
          </div>
          <div v-if="task.result" class="task-result-box">
            <div class="result-header">
              <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="result-label">执行结果</span>
            </div>
            <div class="result-content">
              {{ task.result }}
            </div>
          </div>
          <!-- 执行流程详细信息 -->
          <div v-if="task.execution_procedure" class="execution-procedure">
            <div class="procedure-title">执行流程</div>
            
            <div v-if="task.execution_procedure.就诊时间" class="procedure-item">
              <span class="procedure-label">就诊时间:</span>
              <span class="procedure-value">{{ task.execution_procedure.就诊时间 }}</span>
            </div>
            
            <div v-if="task.execution_procedure.就诊地点" class="procedure-item">
              <span class="procedure-label">就诊地点:</span>
              <span class="procedure-value">{{ task.execution_procedure.就诊地点 }}</span>
            </div>
            
            <div v-if="task.execution_procedure.执行步骤 && task.execution_procedure.执行步骤.length > 0" class="procedure-steps">
              <div class="procedure-label">执行步骤:</div>
              <div class="steps-list">
                <div v-for="(step, idx) in task.execution_procedure.执行步骤" :key="idx" class="step-item">
                  {{ step }}
                </div>
              </div>
            </div>
            
            <div v-if="task.execution_procedure.注意事项 && task.execution_procedure.注意事项.length > 0" class="procedure-notes">
              <div class="procedure-label">注意事项:</div>
              <div class="notes-list">
                <div v-for="(note, idx) in task.execution_procedure.注意事项" :key="idx" class="note-item">
                  • {{ note }}
                </div>
              </div>
            </div>
            
            <div class="procedure-footer">
              <div v-if="task.execution_procedure.预计耗时" class="procedure-item-inline">
                <span class="procedure-label">预计耗时:</span>
                <span class="procedure-value">{{ task.execution_procedure.预计耗时 }}</span>
              </div>
              <div v-if="task.execution_procedure.费用参考" class="procedure-item-inline">
                <span class="procedure-label">费用参考:</span>
                <span class="procedure-value">{{ task.execution_procedure.费用参考 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="instance-empty">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p>请选择一个工作流查看子任务详情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  workflowData: {
    type: Object,
    default: null
  }
});

const selectedWorkflow = ref(null);
const workflows = ref([]);

// 监听 workflowData 的变化，转换为内部格式
watch(() => props.workflowData, (newData) => {
  console.log('[WorkflowInstance] workflowData 变化:', newData);
  
  if (newData && newData.tasks) {
    const newWorkflows = newData.tasks.map((task, index) => ({
      id: task.task_id || (index + 1),
      name: task.task_name,
      description: task.task_description,
      priority: task.priority,
      hospital_name: task.hospital_name,
      subTasks: (task.subtasks || []).map(subtask => ({
        id: subtask.subtask_id,
        name: subtask.subtask_name,
        description: subtask.subtask_description,
        expected_result_type: subtask.expected_result_type,
        status: subtask.status === 'yes' ? 'yes' : subtask.status === 'no' ? 'no' : 'pending',
        execution_procedure: subtask.execution_procedure || null,
        result: subtask.result || null
      }))
    }));
    
    workflows.value = newWorkflows;
    console.log('[WorkflowInstance] workflows 已更新:', workflows.value);
    
    if (selectedWorkflow.value) {
      const stillExists = workflows.value.find(wf => wf.id === selectedWorkflow.value.id);
      if (stillExists) {
        selectedWorkflow.value = stillExists;
      } else if (workflows.value.length > 0) {
        selectedWorkflow.value = workflows.value[0];
      }
    } else if (workflows.value.length > 0) {
      selectedWorkflow.value = workflows.value[0];
    }
  }
}, { immediate: true, deep: true });

// 获取当前选中工作流的子任务
const currentSubTasks = computed(() => {
  if (!selectedWorkflow.value) return [];
  const workflow = workflows.value.find(wf => wf.id === selectedWorkflow.value.id);
  return workflow ? workflow.subTasks : [];
});

// 处理工作流选择
const handleWorkflowClick = (workflow) => {
  selectedWorkflow.value = workflow;
};

// 处理显示按钮点击
const handleDisplay = (workflow) => {
  selectedWorkflow.value = workflow;
};

// 暴露方法供父组件调用：将所有任务标记为已完成
const markAllAsCompleted = () => {
  console.log('[WorkflowInstance] 标记所有任务为已完成');
  workflows.value = workflows.value.map(wf => ({
    ...wf,
    subTasks: wf.subTasks.map(task => ({
      ...task,
      status: 'yes'
    }))
  }));
  
  // 更新当前选中的 workflow 引用
  if (selectedWorkflow.value) {
    const updated = workflows.value.find(wf => wf.id === selectedWorkflow.value.id);
    if (updated) {
      selectedWorkflow.value = updated;
    }
  }
};

// 暴露方法给父组件
defineExpose({
  markAllAsCompleted
});

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'yes':
      return '已完成';
    case 'no':
      return '待执行';
    default:
      return '待执行';
  }
};
</script>

<style scoped>
.workflow-instance-container {
  width: 100%;
  height: 100%;
  background-color: #f9fafb;
  padding: 24px;
}

/* Workflow 区域样式 */
.workflow-section {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #92400e;
  margin: 0;
}

.section-subtitle {
  font-size: 14px;
  color: #d97706;
}

.workflow-list {
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.workflow-card {
  flex-shrink: 0;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.workflow-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.workflow-card-active {
  ring: 2px solid #fbbf24;
  box-shadow: 0 8px 16px rgba(251, 191, 36, 0.3);
  transform: scale(1.05);
}

.workflow-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.workflow-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.display-btn {
  padding: 6px;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.display-btn:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.eye-icon {
  width: 18px;
  height: 18px;
  color: white;
  stroke-width: 2;
}

.workflow-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.arrow-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #d97706;
}

.arrow-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

/* Instance 区域样式 */
.instance-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.instance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.instance-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.instance-card-completed {
  background-color: #f0fdf4;
}

.instance-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.instance-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.status-icon {
  width: 20px;
  height: 20px;
}

.status-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 2;
}

.icon-check {
  color: #10b981;
}

.icon-clock {
  color: #9ca3af;
}

.status-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 9999px;
  margin-bottom: 12px;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-pending {
  background-color: #f3f4f6;
  color: #4b5563;
}

.task-description {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.5;
}

.task-info-item {
  font-size: 12px;
  margin-bottom: 8px;
}

.info-label {
  font-weight: 600;
  color: #4b5563;
}

.info-value {
  color: #6b7280;
  margin-left: 4px;
}

.execution-procedure {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.procedure-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.procedure-item {
  font-size: 12px;
  margin-bottom: 6px;
}

.procedure-label {
  font-weight: 600;
  color: #4b5563;
  display: inline-block;
  min-width: 70px;
}

.procedure-value {
  color: #6b7280;
}

.procedure-steps,
.procedure-notes {
  margin-bottom: 8px;
}

.procedure-steps .procedure-label,
.procedure-notes .procedure-label {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 4px;
}

.steps-list,
.notes-list {
  margin-top: 4px;
}

.step-item,
.note-item {
  font-size: 11px;
  color: #6b7280;
  padding: 3px 0;
  line-height: 1.4;
}

.procedure-footer {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.procedure-item-inline {
  font-size: 11px;
}

.procedure-item-inline .procedure-label {
  min-width: auto;
  margin-right: 4px;
}

.instance-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.5;
  margin-bottom: 16px;
  stroke-width: 1.5;
}

.instance-empty p {
  font-size: 18px;
  margin: 0;
}
.task-result-box {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.result-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
  stroke-width: 2;
}

.result-label {
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-content {
  font-size: 13px;
  color: #1e3a8a;
  line-height: 1.6;
  font-weight: 500;
  word-break: break-word;
}

/* 已完成任务的结果样式调整 */
.instance-card-completed .task-result-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-left-color: #10b981;
}

.instance-card-completed .result-icon {
  color: #10b981;
}

.instance-card-completed .result-label {
  color: #065f46;
}

.instance-card-completed .result-content {
  color: #064e3b;
}
</style>