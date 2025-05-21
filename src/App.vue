<template>
  <div id="detailChart">
    <el-card class="content">
      <el-form :model="setting_content" label-width="150">
        <el-form-item label="记录json对象数组">
          <el-input v-model="setting_content.jsonRecordsList" placeholder="请粘贴记录json对象数组，例如：[{...},{...}]"
            type="textarea" :autosize="{ minRows: 4, maxRows: 10 }" />
          <el-alert v-if="parseError" :title="parseError" type="error" show-icon class="mt-2" />
        </el-form-item>
        <el-form-item label="工具">
          <a href="http://www.bejson.com/explore/index_new/" target="_blank"
            style="margin-right: 20px;">工具链接:json格式规范化在线工具</a>
          <a href="https://github.com/Dream-Dihuan/HyflexDataCollector" target="_blank">github仓库:HyflexDataCollector</a>
        </el-form-item>
        <el-form-item label="展示图像类型">
          <el-radio-group v-model="radio_value" size="large">
            <el-radio-button label="算法中问题的实例详细分析" value="detail" />
            <el-radio-button label="算法下的问题的单个实例调用次数分析" value="instance" />
            <el-radio-button label="问题的方法信息统计" value="ProblemDomain" />
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 详情图表组件 -->
      <DetailChartComponent v-if="radio_value == 'detail'" v-for="(item, index) in detailChartData"
        :key="`detail-${index}-${item.heuristic}-${item.problemDomain}`" :recordsList="item.instances"
        :heuristic="item.heuristic" :problemDomain="item.problemDomain" :totalScore="item.totalScore" />
      <!-- 实例图表组件 -->
      <InstanceChartComponent v-if="radio_value == 'instance'" v-for="(item, index) in instanceChartData"
        :key="`instance-${index}-${item.heuristic}-${item.problemDomain}`" :recordsItem="item" />

      <ProblemDomainChartComponent v-for="index in 4" v-if="classData.length != 0 && radio_value == 'ProblemDomain'"
        :data="convertToProblemGroupItem(classData, problemDomainList[index - 1])" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import DetailChartComponent from '@/components/DetailChartComponent.vue';
import InstanceChartComponent from '@/components/InstanceChartComponent.vue';
import ProblemDomainChartComponent from "@/components/ProblemDomainChartComponent.vue"
import type { HeuristicDomainAnalysis } from '@/types/DetailAnalyseInfo';
import { analyzeHeuristicCallTimesByDomain, groupRecordsByHeuristicDomainAndInstance } from '@/utils/DataCalculator';
import type { instanceGroupItem, instanceRecords } from '@/types/InstanceRecords';
import type { ProblemGroupItem, ProblemJsonInfo } from './types/QuestionAnalyseInfo';
import { convertToProblemGroupItem } from './utils/ProblemCalculator';

const radio_value = ref('detail')

const setting_content = reactive({
  jsonRecordsList: ''
})

// 使用ref使数组成为响应式
const detailChartData = ref<HeuristicDomainAnalysis[]>([])
const instanceChartData = ref<instanceGroupItem[]>([])
const classData = ref<ProblemJsonInfo[]>([])
const parseError = ref<string>('')
const problemDomainList = ['SAT', 'FSP', 'TSP', 'QAP']

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

    if (radio_value.value == "ProblemDomain") {
      return data as instanceRecords[]
    } else {
      return data as ProblemJsonInfo[]
    }

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
</style>