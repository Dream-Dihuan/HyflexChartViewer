<template>
  <h3 style="text-align: center;">Instance analysis of {{ props.problemDomain }} problem under {{ props.heuristic }}
    algorithm (Unit metric score: {{ props.totalScore }})
  </h3>
  <!-- <h3 style="text-align: center;">{{ props.heuristic }} 算法(总分:{{ props.totalScore }})下的 {{ props.problemDomain }} 问题的
    实例分析
  </h3> -->
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { type DetailAnalyseInfo } from '@/types/DetailAnalyseInfo'
let props = defineProps<{
  // instancePerQuestion: number,
  recordsList: DetailAnalyseInfo[],
  heuristic: String,
  problemDomain: string
  totalScore: number
}>()



// let data:HeuristicDomainAnalysis[] = analyzeHeuristicCallTimesByDomain(props.recordsList);

// console.log("转换结果");
// console.log(data);

// props.recordsList.map(item=>item.instance)



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
  onChange?: () => void
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
  if (!chartDom.value) return

  const labelOption = {
    show: true,
    position: config.value.position,
    distance: config.value.distance,
    align: config.value.align,
    verticalAlign: config.value.verticalAlign,
    rotate: config.value.rotate,
    formatter: '{c}  {name|{a}}',
    fontSize: 16,
    rich: {
      name: {}
    }
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Average call count', 'Call count variance', 'Call count standard deviation', 'Instance score']
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar', 'stack'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    xAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        // data: ['2012', '2013', '2014', '2015', '2016']
        data: props.recordsList.map(item => item.instance)
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Average call count',
        type: 'bar',
        barGap: 0,
        label: labelOption,
        emphasis: {
          focus: 'series'
        },
        data: props.recordsList.map(item => item.heuristicCallTimesAverage)
      },
      {
        name: 'Call count variance',
        type: 'bar',
        label: labelOption,
        emphasis: {
          focus: 'series'
        },
        data: props.recordsList.map(item => item.heuristicCallTimesVariance)
      },
      {
        name: 'Call count standard deviation',
        type: 'bar',
        label: labelOption,
        emphasis: {
          focus: 'series'
        },
        data: props.recordsList.map(item => item.heuristicCallTimesStdDev)
      },
      {
        name: 'Instance score',
        type: 'bar',
        label: labelOption,
        emphasis: {
          focus: 'series'
        },
        data: props.recordsList ? props.recordsList.map(item => item.instanceScore) : null
      }
    ]
  }

  myChart = echarts.init(chartDom.value)
  myChart.setOption(option)
}

// 响应配置变化
const updateLabel = () => {
  if (!myChart) return

  const labelOption = {
    rotate: config.value.rotate,
    align: config.value.align,
    verticalAlign: config.value.verticalAlign,
    position: config.value.position,
    distance: config.value.distance
  }

  myChart.setOption({
    series: [
      { label: labelOption },
      { label: labelOption },
      { label: labelOption },
      { label: labelOption }
    ]
  })
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
</script>
