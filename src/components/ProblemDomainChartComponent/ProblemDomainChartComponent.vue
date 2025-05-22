<template>
  <div>
    <h3 style="text-align: center;">{{ props.data?.problemDomain }} 问题的实例分析</h3>

    <!-- 图表 -->
    <div id="main" ref="chartDom" style="width: 100%; height: 500px;"></div>

    <!-- 表格 -->
    <div style="margin-top: 30px;">
      <table border="1" style="width: 100%; text-align: center; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Heuristic (Instance)</th>
            <th>平均调用次数</th>
            <!-- <th>调用次数方差</th> -->
            <th>调用次数标准差</th>
            <th>实例分数</th>
            <th>总得分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in props.data?.instanceInfo" :key="index">
            <td>{{ item.heuristic }} ({{ item.instance }})</td>
            <td>{{ item.heuristicCallTimesAverage }}</td>
            <!-- <td>{{ item.heuristicCallTimesVariance }}</td> -->
            <td>{{ item.heuristicCallTimesStdDev }}</td>
            <td>{{ item.instanceScore }}</td>
            <td>{{ item.totalScore }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import {
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import InstanceSelectorComponent from '../InstanceSelectorComponent.vue'

// 注册模块
echarts.use([
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
])

const chartDom = ref<HTMLDivElement | null>(null)
let myChart: echarts.ECharts | null = null

export type ProblemInfo = {
  heuristic: string
  instance: string
  heuristicCallTimesAverage: number
  // heuristicCallTimesVariance: number
  heuristicCallTimesStdDev: number
  instanceScore: number
  totalScore: number
}

export type ProblemGroupItem = {
  problemDomain: string
  instanceInfo: ProblemInfo[]
}

const props = defineProps<{
  data: ProblemGroupItem
}>()

// 初始化图表
const initChart = () => {
  if (!chartDom.value || !props.data?.instanceInfo) return

  const labelOption = {
    show: true,
    position: 'insideBottom',
    distance: 10,
    align: 'left',
    verticalAlign: 'middle',
    rotate: 90,
    fontSize: 12
  }

  // 横坐标名称：heuristic(instance)
  const xAxisData = props.data.instanceInfo.map(
    // item => `${item.heuristic} (${item.instance})`
    item => item.heuristic
  )

  // 数据提取
  const average = props.data.instanceInfo.map(item => item.heuristicCallTimesAverage)
  // const variance = props.data.instanceInfo.map(item => item.heuristicCallTimesVariance)
  const stdDev = props.data.instanceInfo.map(item => item.heuristicCallTimesStdDev)
  const instanceScore = props.data.instanceInfo.map(item => item.instanceScore)
  const totalScore = props.data.instanceInfo.map(item => item.totalScore)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [
        '平均调用次数',
        // '调用次数方差',
        '调用次数标准差',
        '实例分数',
        '总得分'
      ]
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '次数统计'
      },
      {
        type: 'value',
        name: '得分',
        min: 0,
        max: 1
      }
    ],
    series: [
      {
        name: '平均调用次数',
        type: 'bar',
        label: labelOption,
        data: average
      },
      // {
      //   name: '调用次数方差',
      //   type: 'bar',
      //   label: labelOption,
      //   data: variance
      // },
      {
        name: '调用次数标准差',
        type: 'bar',
        label: labelOption,
        data: stdDev
      },
      {
        name: '实例分数',
        type: 'bar',
        label: labelOption,
        data: instanceScore,
        yAxisIndex: 1
      },
      {
        name: '总得分',
        type: 'bar',
        label: labelOption,
        data: totalScore,
        yAxisIndex: 1
      }
    ]
  }

  myChart = echarts.init(chartDom.value)
  myChart.setOption(option)
}

// 窗口大小变化时重绘
const resizeHandler = () => {
  myChart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  myChart?.dispose()
})

watch(
  () => props.data,
  () => {
    if (myChart) {
      myChart.dispose()
      myChart = null
    }
    initChart()
  }
)
</script>

<style scoped>
table th,
table td {
  padding: 8px;
  border: 1px solid #ccc;
}
</style>