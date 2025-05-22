<template>
  <div id="detailChart">
    <el-card class="content">
      <el-form :model="setting_content" label-width="150">
        <el-form-item label="展示图像类型">
          <el-radio-group v-model="radio_value" size="large">
            <el-radio-button label="算法中问题的实例详细分析" value="detail" />
            <el-radio-button label="算法下的问题的单个实例调用次数分析" value="instance" />
            <el-radio-button label="问题的方法信息统计" value="ProblemDomain" />
            <el-radio-button label="热力图绘制" value="HeatMap" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="工具">
          <a href="http://www.bejson.com/explore/index_new/" target="_blank"
            style="margin-right: 20px;">工具链接:json格式规范化在线工具</a>
          <a href="https://github.com/Dream-Dihuan/HyflexDataCollector" target="_blank"
            style="margin-right: 20px;">github仓库:HyflexDataCollector</a>
          <a href="https://github.com/Dream-Dihuan/HyflexChartViewer" target="_blank"
            style="margin-right: 20px;">github仓库:HyflexChartViewer</a>
          <a href="https://github.com/Dream-Dihuan/HyflexScoreCalculatorJavaVersion" target="_blank"
            style="margin-right: 20px;">github仓库:HyflexScoreCalculatorJavaVersion</a>
          <a href="https://github.com/Dream-Dihuan/HyflexScoreCalculatorPythonVersion" target="_blank"
            style="margin-right: 20px;">github仓库:HyflexScoreCalculatorPythonVersion</a>
        </el-form-item>
      </el-form>


      <div v-show="radio_value != 'HeatMap'">
        <el-upload class="upload-demo" drag action="" :auto-upload="false" :on-change="handleFileChange"
          :show-file-list="false" accept=".json,.txt">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或<em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传JSON文件（.json或.txt）
            </div>
          </template>
        </el-upload>
        <div class="or-separator">或</div>
        <el-input v-model="setting_content.jsonRecordsList" placeholder="请粘贴记录json对象数组，例如：[{...},{...}]" type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }" />
        <el-alert v-if="parseError" :title="parseError" type="error" show-icon class="mt-2" />
      </div>


      <!-- 详情图表组件 -->
      <DetailChartComponent v-if="radio_value == 'detail'" v-for="(item, index) in detailChartData"
        :key="`detail-${index}-${item.heuristic}-${item.problemDomain}`" :recordsList="item.instances"
        :heuristic="item.heuristic" :problemDomain="item.problemDomain" :totalScore="item.totalScore" />
      <!-- 实例图表组件 -->
      <InstanceChartComponent v-if="radio_value == 'instance'" v-for="(item, index) in instanceChartData"
        :key="`instance-${index}-${item.heuristic}-${item.problemDomain}`" :recordsItem="item" />

      <!-- 问题图标分析-->
      <el-card v-show="radio_value == 'ProblemDomain'">
        <template #header>
          设置
        </template>
        <el-row>
          <el-col :span="12">
            <InstanceSelectorComponent @selection-change="handleInstanceSelectionChange" />
          </el-col>
          <el-col :span="12">
            <AlgorithmSelectorComponent @selection-change="handleAlgorithmSelectionChange" />
          </el-col>
        </el-row>
      </el-card>
      <ProblemDomainChartComponent v-for="(item, $index) in instanceSelectedList"
        v-if="radio_value == 'ProblemDomain' && algorithmSelectedList.length != 0"
        :data="convertToGroupItem(instanceChartData, algorithmSelectedList, item.problem, item.instance)" />

      <!--热力图-->
      <HeatMapComponent v-if="radio_value == 'HeatMap'" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import DetailChartComponent from '@/components/DetailChartComponent.vue';
import InstanceChartComponent from '@/components/InstanceChartComponent.vue';
import ProblemDomainChartComponent from "@/components/ProblemDomainChartComponent/ProblemDomainChartComponentRefactor.vue"
import type { HeuristicDomainAnalysis } from '@/types/DetailAnalyseInfo';
import { analyzeHeuristicCallTimesByDomain, groupRecordsByHeuristicDomainAndInstance } from '@/utils/DataCalculator';
import type { instanceGroupItem, instanceRecords } from '@/types/InstanceRecords';
import type { ProblemGroupItem, ProblemJsonInfo } from './types/QuestionAnalyseInfo';
import { convertToGroupItem } from "@/utils/ProblemCalculator"
import InstanceSelectorComponent from './components/InstanceSelectorComponent.vue';
import AlgorithmSelectorComponent from './components/AlgorithmSelectorComponent.vue';
import { UploadFilled } from '@element-plus/icons-vue';
import HeatMapComponent from './components/HeatMapComponent.vue';

const radio_value = ref('detail')

const setting_content = reactive({
  jsonRecordsList: ''
})

// 使用ref使数组成为响应式
const detailChartData = ref<HeuristicDomainAnalysis[]>([])
const instanceChartData = ref<instanceGroupItem[]>([])
const classData = ref<ProblemJsonInfo[]>([])
const parseError = ref<string>('')
const instanceSelectedList = ref<{ problem: string, instance: string }[]>([])
const algorithmSelectedList = ref<String[]>([])

// 改进的JSON解析函数
const parseJsonToRecords = (): any[] => {
  parseError.value = ''

  if (!setting_content.jsonRecordsList.trim()) {
    return []
  }

  try {
    const data = JSON.parse(setting_content.jsonRecordsList)

    if (!Array.isArray(data)) {
      parseError.value = '输入不是一个数组'
      return []
    }

    // 简单验证数据格式
    if (data.length > 0 && !('instance' in data[0])) {
      parseError.value = '数据格式不正确，缺少instance字段'
      return []
    }
    return data as instanceRecords[]

  } catch (error) {
    parseError.value = `JSON解析失败: ${error instanceof Error ? error.message : String(error)}`
    return []
  }
}

// 使用防抖的watch监听
let debounceTimer: number | null = null
watch(() => setting_content.jsonRecordsList, () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    const records = parseJsonToRecords()

    if (records.length > 0) {
      classData.value = records
      detailChartData.value = analyzeHeuristicCallTimesByDomain(records)
      instanceChartData.value = groupRecordsByHeuristicDomainAndInstance(records)

    } else {
      detailChartData.value = []
      instanceChartData.value = []
    }

    debounceTimer = null
  }, 500) // 500ms防抖
}, { immediate: true })

const handleInstanceSelectionChange = (selectedItems: any[]) => {
  instanceSelectedList.value = selectedItems;
  console.log(selectedItems);
}

const handleAlgorithmSelectionChange = (selectedItems: any[]) => {
  algorithmSelectedList.value = selectedItems;
  console.log(selectedItems);
}

// 处理文件上传
const handleFileChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      setting_content.jsonRecordsList = content;
      parseJsonToRecords();
    } catch (error) {
      parseError.value = "文件读取错误: " + (error as Error).message;
    }
  };
  reader.onerror = () => {
    parseError.value = "文件读取失败";
  };
  reader.readAsText(file.raw);
};
</script>

<style scoped lang="scss">
#detailChart {
  width: 100vw;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;

  .content {
    margin: 0 auto;
    width: 95%;
    // max-width: 1200px;

    :deep(.el-textarea__inner) {
      font-family: monospace;
      white-space: pre;
    }

    .mt-2 {
      margin-top: 8px;
    }
  }

}

.or-separator {
  text-align: center;
  margin: 15px 0;
  position: relative;
  color: #999;

  &:before,
  &:after {
    content: "";
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #dcdfe6;
  }

  &:before {
    left: 0;
  }

  &:after {
    right: 0;
  }
}

.upload-demo {
  margin-bottom: 20px;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 20px;
  }
}
</style>