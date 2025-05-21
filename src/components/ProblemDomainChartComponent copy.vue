<template>
  <h3 style="text-align: center;">{{ props.data?.problemDomain }} 问题的
    实例分析
  </h3>
  <div id="main" ref="chartDom" style="width: 100%; height: 500px;"></div>
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

// 注册所需模块
echarts.use([
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
])

// DOM 引用
const chartDom = ref<HTMLDivElement | null>(null)
let myChart: echarts.ECharts | null = null

interface HeuristicItem {
  heuristic: string
  heuristicCallTimes: number
  totalScore: number
}

const props = defineProps<{
  data: {
    problemDomain?: string
    instanceInfo?: HeuristicItem[]
  }
}>()
// console.log(props.data);


// 配置参数类型
interface LabelConfig {
  rotate: number
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  position:
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'inside'
  | 'insideTop'
  | 'insideLeft'
  | 'insideRight'
  | 'insideBottom'
  | 'insideTopLeft'
  | 'insideTopRight'
  | 'insideBottomLeft'
  | 'insideBottomRight'
  distance: number
}

// 配置项
const config = ref<LabelConfig>({
  rotate: 90,
  align: 'left',
  verticalAlign: 'middle',
  position: 'insideBottom',
  distance: 15
})

// 初始化图表
const initChart = () => {
  if (!chartDom.value || !props.data?.instanceInfo) return

  const labelOption = {
    show: true,
    position: config.value.position,
    distance: config.value.distance,
    align: config.value.align,
    verticalAlign: config.value.verticalAlign,
    rotate: config.value.rotate,
    fontSize: 12
  }

  const heuristics = props.data.instanceInfo.map(i => i.heuristic)
  const callTimes = props.data.instanceInfo.map(i => i.heuristicCallTimes)
  const scores = props.data.instanceInfo.map(i => i.totalScore)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['平均调用次数', '实例分数']
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
    xAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        data: heuristics
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '调用次数',
        min: 0
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
        barGap: 0,
        label: labelOption,
        emphasis: {
          focus: 'self'
        },
        data: callTimes
      },
      {
        name: '实例分数',
        type: 'bar',
        label: labelOption,
        emphasis: {
          focus: 'self'
        },
        data: scores,
        yAxisIndex: 1 // 使用第二个 Y 轴
      }
    ]
  }

  myChart = echarts.init(chartDom.value)
  myChart.setOption(option)
}

// 监听窗口变化以调整图表大小
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
