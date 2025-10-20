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
                class="execute-btn"
                :class="{ 'execute-btn-disabled': isExecuting }"
                :disabled="isExecuting"
                @click.stop="handleExecute(workflow)"
              >
                <svg class="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
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
            'instance-card-running': task.status === 'running',
            'instance-card-completed': task.status === 'completed'
          }"
        >
          <div class="instance-card-header">
            <h4 class="instance-name">{{ task.name }}</h4>
            <div class="status-icon">
              <svg v-if="task.status === 'running'" class="icon-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12a9 9 0 11-6.219-8.56"></path>
              </svg>
              <svg v-else-if="task.status === 'completed'" class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <svg v-else class="icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          
          <div class="status-badge" :class="`status-${task.status}`">
            {{ getStatusText(task.status) }}
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
import { ref, computed } from 'vue';

// 模拟数据
const workflowData = [
  {
    id: 1,
    name: '收集病史',
    subTasks: [
      { id: '1-1', name: '基础信息核查', status: 'pending' },
      { id: '1-2', name: '主诉精准问询', status: 'pending' },
      { id: '1-3', name: '现病史详细追溯', status: 'pending' },
      { id: '1-4', name: '既往史与家族史收集', status: 'pending' }
    ]
  },
  {
    id: 2,
    name: '口腔检查',
    subTasks: [
      { id: '2-1', name: '常规口腔视诊与触诊', status: 'pending' },
      { id: '2-2', name: '专项器械检查', status: 'pending' },
      { id: '2-3', name: '辅助检查安排', status: 'pending' }
    ]
  },
  {
    id: 3,
    name: '初步诊断',
    subTasks: [
      { id: '3-1', name: '信息整合分析', status: 'pending' },
      { id: '3-2', name: '鉴别诊断排除', status: 'pending' },
      { id: '3-3', name: '初步诊断结论形成', status: 'pending' }
    ]
  },
  {
    id: 4,
    name: '制定处理方案',
    subTasks: [
      { id: '4-1', name: '治疗目标确立', status: 'pending' },
      { id: '4-2', name: '具体治疗方案制定', status: 'pending' },
      { id: '4-3', name: '治疗风险与注意事项告知', status: 'pending' }
    ]
  },
  {
    id: 5,
    name: '安排随访',
    subTasks: [
      { id: '5-1', name: '随访时间规划', status: 'pending' },
      { id: '5-2', name: '随访方式与内容明确', status: 'pending' },
      { id: '5-3', name: '随访记录与档案管理', status: 'pending' }
    ]
  }
];

const selectedWorkflow = ref(null);
const workflows = ref(JSON.parse(JSON.stringify(workflowData)));
const isExecuting = ref(false);

// 获取当前选中工作流的子任务
const currentSubTasks = computed(() => {
  if (!selectedWorkflow.value) return [];
  const workflow = workflows.value.find(wf => wf.id === selectedWorkflow.value.id);
  return workflow ? workflow.subTasks : [];
});

// 处理工作流选择
const handleWorkflowClick = (workflow) => {
  if (!isExecuting.value) {
    selectedWorkflow.value = workflow;
  }
};

// 处理执行按钮点击
const handleExecute = (workflow) => {
  if (isExecuting.value) return;
  
  selectedWorkflow.value = workflow;
  isExecuting.value = true;
  
  // 重置所有子任务状态
  workflows.value = workflows.value.map(wf => {
    if (wf.id === workflow.id) {
      return {
        ...wf,
        subTasks: wf.subTasks.map(task => ({ ...task, status: 'pending' }))
      };
    }
    return wf;
  });
  
  // 模拟依次执行子任务
  workflow.subTasks.forEach((task, index) => {
    setTimeout(() => {
      workflows.value = workflows.value.map(wf => {
        if (wf.id === workflow.id) {
          return {
            ...wf,
            subTasks: wf.subTasks.map(t => {
              if (t.id === task.id) {
                return { ...t, status: 'running' };
              }
              return t;
            })
          };
        }
        return wf;
      });
      
      // 1秒后完成当前任务
      setTimeout(() => {
        workflows.value = workflows.value.map(wf => {
          if (wf.id === workflow.id) {
            return {
              ...wf,
              subTasks: wf.subTasks.map(t => {
                if (t.id === task.id) {
                  return { ...t, status: 'completed' };
                }
                return t;
              })
            };
          }
          return wf;
        });
        
        // 如果是最后一个任务，结束执行状态
        if (index === workflow.subTasks.length - 1) {
          setTimeout(() => {
            isExecuting.value = false;
          }, 500);
        }
      }, 1000);
    }, index * 1500);
  });
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'running':
      return '执行中';
    case 'completed':
      return '已完成';
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

.execute-btn {
  padding: 8px;
  background-color: #fbbf24;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.execute-btn:hover:not(:disabled) {
  background-color: #f59e0b;
}

.execute-btn-disabled {
  background-color: #e5e7eb;
  cursor: not-allowed;
}

.play-icon {
  width: 16px;
  height: 16px;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.instance-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.instance-card-running {
  ring: 2px solid #3b82f6;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
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

.icon-spinner {
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.icon-check {
  color: #10b981;
}

.icon-clock {
  color: #9ca3af;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 9999px;
}

.status-running {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-pending {
  background-color: #f3f4f6;
  color: #4b5563;
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
</style>