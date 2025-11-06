<template>
  <div class="workflow-instance-container">
    <!-- Workflow 区域 -->
    <div class="workflow-section">
      <div class="section-header">
        <h2 class="section-title">任务向导</h2>
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
        <h2 class="section-title">{{ selectedWorkflow?.name || '请选择工作流' }}状态</h2>
      </div>
      
      <div v-if="selectedWorkflow" class="instance-grid">
        <!-- 替换原来的 instance-card 内容 -->
        <div
          v-for="task in currentSubTasks"
          :key="task.id"
          class="instance-card"
          :class="{
            'instance-card-completed': task.status === 'yes',
            'instance-card-two-column': task.result
          }"
        >
          <!-- 左列：基本信息和执行流程 -->
          <div class="card-left-column">
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

            <div class="status-badge" :class="`status-${task.status === 'yes' ? 'completed' : 'pending'}`">
              {{ getQueryableText(task.auto_queryable) }}
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

          <!-- 右列：result 数据展示 -->
          <div v-if="task.result" class="card-right-column">
            <!-- 文本类型 result -->
            <div v-if="typeof task.result === 'string'" class="task-result-box">
              <div class="result-header">
                <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="result-label">执行结果</span>
                <span class="result-status-badge">{{ getResultStatusText(task.result) }}</span>
              </div>
              <div class="result-content">
                {{ task.result }}
              </div>
            </div>

            <!-- 结构化 result -->
            <div v-else-if="isStructuredResult(task.result)" class="structured-result-box">
              <div class="result-header">
                <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="result-label">执行结果</span>
                <span class="result-status-badge" :class="task.result.status === 'success' ? 'status-success' : 'status-error'">
                  {{ getResultStatusText(task.result) }}
                </span>
              </div>

              <!-- 基本信息 -->
              <div class="result-meta">
                <div v-if="task.result.source" class="meta-item">
                  <span class="meta-label">来源:</span>
                  <span class="meta-value">{{ task.result.source }}</span>
                </div>
                <div v-if="task.result.exam_type" class="meta-item">
                  <span class="meta-label">检查类型:</span>
                  <span class="meta-value">{{ task.result.exam_type }}</span>
                </div>
                <div v-if="task.result.exam_date" class="meta-item">
                  <span class="meta-label">检查日期:</span>
                  <span class="meta-value">{{ task.result.exam_date }} {{ task.result.exam_time || '' }}</span>
                </div>
                <div v-if="task.result.report_id" class="meta-item">
                  <span class="meta-label">报告ID:</span>
                  <span class="meta-value">{{ task.result.report_id }}</span>
                </div>
              </div>

              <!-- 检查结果表格 -->
              <div v-if="task.result.results" class="results-table-container">
                <table class="results-table">
                  <thead>
                    <tr>
                      <th>检查项目</th>
                      <th>结果</th>
                      <th>单位</th>
                      <th>参考范围</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, key) in task.result.results" :key="key">
                      <td class="item-name">{{ key }}</td>
                      <td class="item-value">{{ item.value }}</td>
                      <td class="item-unit">{{ item.unit || '-' }}</td>
                      <td class="item-reference">{{ item.reference }}</td>
                      <td>
                        <span class="item-status" :class="`status-${item.status === '正常' ? 'normal' : 'abnormal'}`">
                          {{ item.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 结论 -->
              <div v-if="task.result.conclusion" class="result-conclusion">
                <div class="conclusion-label">结论:</div>
                <div class="conclusion-content">{{ task.result.conclusion }}</div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  workflowData: {
    type: Object,
    default: null
  }
});

const selectedWorkflow = ref(null);
const workflows = ref([]);
const autoSwitchTimer = ref(null); // 动切换定时器

// 检查当前workflow是否所有子任务都有result
const isCurrentWorkflowComplete = () => {
  if (!selectedWorkflow.value) return false;
  const workflow = workflows.value.find(wf => wf.id === selectedWorkflow.value.id);
  if (!workflow) return false;
  
  // 所有子任务都有result才算完成
  return workflow.subTasks.every(task => task.result);
};

// 查找下一个没有result的任务
const findNextIncompleteWorkflow = () => {
  if (workflows.value.length === 0) return null;
  
  const currentIndex = selectedWorkflow.value 
    ? workflows.value.findIndex(wf => wf.id === selectedWorkflow.value.id)
    : -1;
  
  // 从当前任务的下一个开始查找
  for (let i = 1; i <= workflows.value.length; i++) {
    const index = (currentIndex + i) % workflows.value.length;
    const workflow = workflows.value[index];
    
    // 检查是否有子任务没有result
    const hasIncompleteTask = workflow.subTasks.some(task => !task.result);
    if (hasIncompleteTask) {
      return workflow;
    }
  }
  
  return null; // 所有任务都有result了
};

// 启动自动切换
const startAutoSwitch = () => {
  stopAutoSwitch(); // 先清除existing timer
  
  autoSwitchTimer.value = setInterval(() => {
    // 检查当前任务是否完成
    if (!isCurrentWorkflowComplete()) {
      console.log('[WorkflowInstance] 当前任务未完成，不切换');
      return;
    }
    
    const nextWorkflow = findNextIncompleteWorkflow();
    if (nextWorkflow) {
      selectedWorkflow.value = nextWorkflow;
      console.log('[WorkflowInstance] 自动切换到:', nextWorkflow.name);
    } else {
      console.log('[WorkflowInstance] 所有任务都已完成，停止自动切换');
      stopAutoSwitch();
    }
  }, 5000);
};

// 新增：停止自动切换
const stopAutoSwitch = () => {
  if (autoSwitchTimer.value) {
    clearInterval(autoSwitchTimer.value);
    autoSwitchTimer.value = null;
  }
};

// 监听 workflowData 的变化，转换为内部格式
watch(() => props.workflowData, (newData) => {
  console.log('[WorkflowInstance] workflowData 变化:', newData);
  
  if (newData && newData.tasks) {
    // 如果 workflows 为空，直接初始化
    if (workflows.value.length === 0) {
      workflows.value = newData.tasks.map((task, index) => ({
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
          auto_queryable: subtask.auto_queryable,
          execution_procedure: subtask.execution_procedure || null,
          result: subtask.result || null
        }))
      }));
    } else {
      // 智能合并数据
      const updatedWorkflows = workflows.value.map(oldWorkflow => {
        // 查找匹配的新 task
        const matchingNewTask = newData.tasks.find(
          newTask => newTask.task_name === oldWorkflow.name
        );
        
        if (!matchingNewTask) {
          // 前端存在但后端没传，检查是否有 result
          const hasResult = oldWorkflow.subTasks.some(st => st.result);
          return hasResult ? oldWorkflow : null; // 有 result 保留，否则标记删除
        }
        
        // 合并 subtasks
        const mergedSubTasks = oldWorkflow.subTasks.map(oldSubTask => {
          const matchingNewSubTask = (matchingNewTask.subtasks || []).find(
            newSt => newSt.subtask_name === oldSubTask.name
          );
          
          if (!matchingNewSubTask) {
            // 前端存在但后端没传，检查是否有 result
            return oldSubTask.result ? oldSubTask : null;
          }
          
          // 匹配成功，只更新 result 和 status
          return {
            ...oldSubTask,
            status: matchingNewSubTask.status === 'yes' ? 'yes' : matchingNewSubTask.status === 'no' ? 'no' : 'pending',
            result: matchingNewSubTask.result || oldSubTask.result
          };
        }).filter(st => st !== null);
        
        // 添加新增的 subtasks
        const newSubTasks = (matchingNewTask.subtasks || [])
          .filter(newSt => !oldWorkflow.subTasks.some(
            oldSt => oldSt.name === newSt.subtask_name
          ))
          .map(subtask => ({
            id: subtask.subtask_id,
            name: subtask.subtask_name,
            description: subtask.subtask_description,
            expected_result_type: subtask.expected_result_type,
            status: subtask.status === 'yes' ? 'yes' : subtask.status === 'no' ? 'no' : 'pending',
            auto_queryable: subtask.auto_queryable || false,
            execution_procedure: subtask.execution_procedure || null,
            result: subtask.result || null
          }));
        
        return {
          ...oldWorkflow,
          subTasks: [...mergedSubTasks, ...newSubTasks]
        };
      }).filter(wf => wf !== null);
      
      // 添加新增的 workflows
      const newWorkflows = newData.tasks
        .filter(newTask => !workflows.value.some(
          oldWf => oldWf.id === newTask.task_id && oldWf.name === newTask.task_name
        ))
        .map((task, index) => ({
          id: task.task_id || (workflows.value.length + index + 1),
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
            auto_queryable: subtask.auto_queryable || false,
            execution_procedure: subtask.execution_procedure || null,
            result: subtask.result || null
          }))
        }));
      
      workflows.value = [...updatedWorkflows, ...newWorkflows];
    }
    
    console.log('[WorkflowInstance] workflows 已更新:', workflows.value);
    
    // 更新 selectedWorkflow
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
    
    // 新增：数据更新后启动自动切换
    startAutoSwitch();
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
  // 新增：手动切换时重启定时器
  startAutoSwitch();
};

// 处理显示按钮点击
const handleDisplay = (workflow) => {
  selectedWorkflow.value = workflow;
  // 新增：手动切换时重启定时器
  startAutoSwitch();
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

// 新增：组件挂载时启动自动切换
onMounted(() => {
  if (workflows.value.length > 0) {
    startAutoSwitch();
  }
});

// 新增：组件卸载时清理定时器
onUnmounted(() => {
  stopAutoSwitch();
});

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

const getQueryableText = (status) => {
  switch (status) {
    case true:  
      return '从工具调用结果';
    case false: 
      return '用户输入结果';
    default:
      return '用户输入结果';
  }
};

const isStructuredResult = (result) => {
  console.log('检查结构化结果:', result);
  return result && typeof result === 'object' && !Array.isArray(result);
};

const getResultStatusText = (result) => {
  if (typeof result === 'string') {
    return '从用户获取数据成功';
  }
  if (isStructuredResult(result)) {
    return result.status === 'success' ? '从工具获取数据成功' : '从工具获取数据失败';
  }
  return '';
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
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
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
/* 在 style 标签末尾添加以下样式 */

/* 两列布局 */
.instance-card-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card-left-column {
  min-width: 0; /* 防止内容溢出 */
}

.card-right-column {
  min-width: 0;
  border-left: 2px solid #e5e7eb;
  padding-left: 20px;
}

/* Result 状态标签 */
.result-status-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: #dbeafe;
  color: #1e40af;
  font-weight: 500;
  margin-left: auto;
}

.result-status-badge.status-success {
  background-color: #d1fae5;
  color: #065f46;
}

.result-status-badge.status-error {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 结构化结果样式 */
.structured-result-box {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.structured-result-box .result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

/* 基本信息 */
.result-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  font-size: 12px;
  display: flex;
  gap: 6px;
}

.meta-label {
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.meta-value {
  color: #64748b;
}

/* 表格样式 */
.results-table-container {
  overflow-x: auto;
  margin-bottom: 16px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-table thead {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.results-table th {
  padding: 10px 8px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.results-table tbody tr:last-child {
  border-bottom: none;
}

.results-table tbody tr:hover {
  background-color: #f8fafc;
}

.results-table td {
  padding: 10px 8px;
  color: #475569;
}

.item-name {
  font-weight: 600;
  color: #1e293b;
}

.item-value {
  font-weight: 600;
  color: #0f172a;
}

.item-unit {
  color: #64748b;
  font-size: 11px;
}

.item-reference {
  color: #64748b;
  font-size: 11px;
}

.item-status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.item-status.status-normal {
  background-color: #d1fae5;
  color: #065f46;
}

.item-status.status-abnormal {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 结论 */
.result-conclusion {
  background-color: #fff7ed;
  border-left: 3px solid #f59e0b;
  padding: 12px;
  border-radius: 6px;
}

.conclusion-label {
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.conclusion-content {
  font-size: 13px;
  color: #78350f;
  line-height: 1.6;
  font-weight: 500;
}

/* 响应式：小屏幕时改为单列 */
@media (max-width: 768px) {
  .instance-card-two-column {
    grid-template-columns: 1fr;
  }
  
  .card-right-column {
    border-left: none;
    border-top: 2px solid #e5e7eb;
    padding-left: 0;
    padding-top: 20px;
  }
  
  .result-meta {
    grid-template-columns: 1fr;
  }
}
</style>