<template v-if="props.data.length!=0">
  <div>
    <!-- <h3 style="text-align: center;">{{ props.data[0]?.problemDomain }} 问题下的 {{ props.data[0]?.instance }} 实例分析</h3> -->
    <h3 style="text-align: center;"> Analysis of the {{ props.data[0]?.instance }} instance under the {{
      props.data[0]?.problemDomain }} problemDomain</h3>
    <!-- 图表 -->
    <div id="main" ref="chartDom" style="width: 100%; height: 500px;"></div>

    <!-- 表格 -->
    <div style="margin-top: 30px;">
      <table border="1" style="width: 100%; text-align: center; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Hyper-Heuristics (Instance)</th>
            <th> Average call count</th>
            <!-- <th>调用次数方差</th> -->
            <th>Call count standard deviation</th>
            <th>Instance score</th>
            <th>Unit metric score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in props.data" :key="index">
            <td>{{ item.heuristic }} ({{ item.instance }})</td>
            <td>{{ CountHeuristicCallTimesAverage(item.instanceInfo) }}</td>
            <!-- <td>{{ item.heuristicCallTimesVariance }}</td> -->
            <td>{{ CalculateHeuristicCallTimesStdDev(item.instanceInfo) }}</td>
            <td>{{ CountInstanceScoreAverage(item.instanceInfo) }}</td>
            <td>{{ item.instanceInfo[0].totalScore }}</td>
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
import type { instanceGroupItem } from '@/types/InstanceRecords'
import { CalculateHeuristicCallTimesStdDev, CountHeuristicCallTimesAverage, CountInstanceScoreAverage } from '@/utils/DataCalculator'

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

// export type ProblemInfo = {
//   heuristic: string
//   instance: string
//   heuristicCallTimesAverage: number
//   // heuristicCallTimesVariance: number
//   heuristicCallTimesStdDev: number
//   instanceScore: number
//   totalScore: number
// }

// export type ProblemGroupItem = {
//   problemDomain: string
//   instanceInfo: ProblemInfo[]
// }

const props = defineProps<{
  data: instanceGroupItem[]
}>()

// 初始化图表
const initChart = () => {
  if (!chartDom.value || !props.data) return

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
  const xAxisData = props.data.map(
    // item => `${item.heuristic} (${item.instance})`
    item => item.heuristic
  )

  // 数据提取
  // const average = props.data.instanceInfo.map(item => item.heuristicCallTimesAverage)
  // const variance = props.data.instanceInfo.map(item => item.heuristicCallTimesVariance)
  // const stdDev = props.data.instanceInfo.map(item => item.heuristicCallTimesStdDev)
  // const instanceScore = props.data.instanceInfo.map(item => item.instanceScore)


  const average = props.data.map(item => CountHeuristicCallTimesAverage(item.instanceInfo))
  const stdDev = props.data.map(item => CalculateHeuristicCallTimesStdDev(item.instanceInfo))
  const instanceScore = props.data.map(item => CountInstanceScoreAverage(item.instanceInfo))
  const totalScore = props.data.map(item => item.instanceInfo[0].totalScore)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [
        'Average call count',
        // '调用次数方差',
        'Call count standard deviation',
        'Instance score',
        'Unit metric score'
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
        name: 'Call times'
      },
      {
        type: 'value',
        name: 'Score',
        min: 0,
        max: 1
      }
    ],
    series: [
      {
        name: 'Average call count',
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
        name: 'Call count standard deviation',
        type: 'bar',
        label: labelOption,
        data: stdDev
      },
      {
        name: 'Instance score',
        type: 'bar',
        label: labelOption,
        data: instanceScore,
        yAxisIndex: 1
      },
      {
        name: 'Unit metric score',
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