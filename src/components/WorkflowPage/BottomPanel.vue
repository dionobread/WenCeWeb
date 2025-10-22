<template>
  <div class="bottom-panel-container">
    <!-- 底部标签栏 -->
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

    <!-- 底部内容面板 -->
    <div class="content-panel">
      <div v-if="currentData" class="json-display">
        <div
          v-for="(line, index) in formattedJson"
          :key="index"
          class="json-line"
          v-html="line"
        ></div>
      </div>
      <div v-else class="empty-state">
        {{ activeTab }} 数据暂无内容
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

// 模拟数据
const mockData = {
  Intent: {
    query: "口腔伴有异味",
    user_intent: "症状查询：用户描述了口腔伴有异味的症状，想了解可能的原因、严重性或应对措施。",
    task_type: "Information-seeking intent",
    intents_list: [
      "寻求病因解释",
      "查询治疗方法",
      "了解是否需要就医"
    ],
    confidence_score: 0.92
  },
  
  Decomposer: {
    main_task: "口腔异味诊断与处理",
    subtasks: [
      {
        id: 1,
        name: "评估口腔异味症状",
        description: "记录详细病史和进行口腔检查",
        subtasks: [
          {
            id: "1.1",
            name: "记录详细病史",
            content: "询问患者口腔卫生习惯、是否有服用药物、是否有食用特殊食物等",
            expected_result: "完整的口腔卫生和生活习惯记录"
          },
          {
            id: "1.2",
            name: "口腔检查",
            content: "进行口腔内部检查，观察牙龈、舌头、口腔黏膜的状态",
            expected_result: "记录检查结果，包括牙齿状况、舌苔、口腔黏膜有无病理改变"
          }
        ]
      },
      {
        id: 2,
        name: "初步诊断和处理建议",
        description: "评估可能的病因并制定处理方案",
        subtasks: [
          {
            id: "2.1",
            name: "评估可能的病因",
            content: "根据记录的病史和检查结果，综合考虑如口腔卫生不良、牙周病、消化系统问题等",
            expected_result: "确定潜在病因的优先级，提出可能的临床诊断"
          },
          {
            id: "2.2",
            name: "制定处理方案",
            content: "根据评估结果，建议患者改进口腔卫生习惯，并考虑是否需要就医",
            expected_result: "患者理解改进口腔卫生的措施，并能采取行动"
          }
        ]
      },
      {
        id: 3,
        name: "随访评估",
        description: "安排后续随访，评估口腔异味是否改善",
        subtasks: [
          {
            id: "3.1",
            name: "安排后续随访",
            content: "建议患者一周后回访，评估口腔异味是否改善",
            expected_result: "确定具体的随访时间，查看效果"
          }
        ]
      }
    ]
  },
  
  Planner: {
    execution_path: {
      steps: [
        { id: "A", name: "收集病史", status: "completed" },
        { id: "B", name: "口腔检查", status: "in_progress" },
        { id: "C", name: "初步诊断", status: "pending" },
        { id: "D", name: "制定处理方案", status: "pending" },
        { id: "E", name: "安排随访", status: "pending" }
      ],
      dependencies: {
        "B": ["A"],
        "C": ["B"],
        "D": ["C"],
        "E": ["D"]
      }
    },
    risk_assessment: {
      high_risk_tasks: [
        {
          task_id: "B",
          task_name: "口腔检查",
          risk_description: "口腔相关问题如严重牙周病可能导致系统性健康问题。因此在嘴味早期需要及时处理，避免病情加重，尽早接触牙科专业人士进行评估。",
          mitigation: "及时转诊至专业牙科医生"
        }
      ]
    },
    estimated_duration: "1-2周",
    priority_level: "medium"
  },
  
  Executor: {
    current_execution: {
      task_id: "B",
      task_name: "口腔检查",
      status: "executing",
      start_time: "2023-08-27 19:03:30",
      tools_used: ["info_inquire"],
      results: [
        {
          question: "口腔异味的性质是怎样的？",
          answer: "臭味",
          timestamp: "2023-08-27 19:05:12"
        },
        {
          question: "是否伴随口腔其他症状，如疼痛或出血？",
          answer: "否",
          timestamp: "2023-08-27 19:05:45"
        },
        {
          question: "请描述异味开始的具体时间和变化过程。",
          answer: "一周前，无变化",
          timestamp: "2023-08-27 19:06:18"
        }
      ]
    },
    execution_history: [
      {
        task_id: "A",
        task_name: "收集病史",
        status: "completed",
        duration: "5分钟",
        tools_used: ["intent_understand", "info_inquire"],
        summary: "成功收集患者基本信息和症状描述"
      }
    ]
  },
  
  Synthesizer: {
    diagnosis_summary: {
      patient_info: {
        age_group: "18岁以下",
        chief_complaint: "口腔伴有异味",
        duration: "一周",
        characteristics: "臭味，早晨起床时最明显"
      },
      findings: {
        symptoms: ["口腔异味（臭味）"],
        no_symptoms: ["无疼痛", "无出血", "无其他相关症状"],
        oral_hygiene: "每天刷牙",
        medication: "无"
      },
      preliminary_diagnosis: [
        {
          condition: "口腔卫生不良导致的口臭",
          probability: "high",
          reasoning: "患者虽然每天刷牙，但可能刷牙方法不当或未使用牙线，导致食物残渣残留"
        },
        {
          condition: "舌苔过厚",
          probability: "medium",
          reasoning: "早晨起床时异味最明显，提示可能与夜间口腔细菌繁殖有关"
        }
      ],
      recommendations: [
        "改进口腔卫生习惯，建议使用牙线和抗菌漱口水",
        "注意饮食，避免刺激性食物",
        "如症状持续不改善，建议就医进行口腔科检查",
        "一周后随访评估"
      ],
      confidence_level: 0.78
    }
  },
  
  Overview: {
    workflow_status: {
      workflow_id: "WF-20230827-001",
      patient_query: "口腔伴有异味",
      start_time: "2023-08-27 19:03:30",
      current_stage: "Executor",
      progress: 0.6,
      stages_completed: ["Intent", "Decomposer", "Planner"],
      stages_in_progress: ["Executor"],
      stages_pending: ["Synthesizer", "User Proxy"]
    },
    key_metrics: {
      total_questions_asked: 6,
      tools_invoked: 5,
      avg_response_time: "2.3秒",
      user_satisfaction: null
    },
    timeline: [
      { stage: "Intent", time: "19:03:30", duration: "15秒" },
      { stage: "Decomposer", time: "19:03:45", duration: "8秒" },
      { stage: "Planner", time: "19:03:53", duration: "12秒" },
      { stage: "Executor", time: "19:04:05", duration: "进行中..." }
    ]
  }
};

const currentData = computed(() => {
  return mockData[activeTab.value] || null;
});

const formatJson = (obj) => {
  return JSON.stringify(obj, null, 2);
};

const highlightJson = (jsonString) => {
  let result = jsonString;
  
  // 键名高亮 (深紫色)
  result = result.replace(
    /"([^"]+)":/g,
    '<span style="color: #6b46c1; font-weight: 600;">"$1"</span>:'
  );
  
  // 字符串值高亮 (深绿色)
  result = result.replace(
    /: "([^"]*)"/g,
    ': <span style="color: #047857;">"$1"</span>'
  );
  
  // 数字高亮 (深橙色)
  result = result.replace(
    /: (\d+\.?\d*)/g,
    ': <span style="color: #c2410c;">$1</span>'
  );
  
  // 布尔值和null高亮 (深蓝色)
  result = result.replace(
    /: (true|false|null)/g,
    ': <span style="color: #1e40af;">$1</span>'
  );
  
  return result;
};

const formattedJson = computed(() => {
  if (!currentData.value) return [];
  
  const jsonString = formatJson(currentData.value);
  return jsonString.split('\n').map(line => highlightJson(line));
});

const handleTabClick = (tab) => {
  activeTab.value = tab;
  emit('tab-change', tab);
};
</script>

<style scoped>
.bottom-panel-container {
  position: fixed;
  bottom: 0;
  left: 60px;
  right: 310px;
  display: flex;
  flex-direction: column;
  z-index: 99;
}

.bottom-tabbar {
  height: 40px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  display: flex;
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

.content-panel {
  height: 150px;
  background-color: #f3f0ff;
  color: #1a1a1a;
  overflow: auto;
  padding: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 20px;
}

.json-display {
  white-space: pre;
}

.json-line {
  min-height: 20px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 自定义滚动条 */
.content-panel::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.content-panel::-webkit-scrollbar-track {
  background: #e9e5f5;
}

.content-panel::-webkit-scrollbar-thumb {
  background: #c4b5fd;
  border-radius: 5px;
}

.content-panel::-webkit-scrollbar-thumb:hover {
  background: #a78bfa;
}
</style>