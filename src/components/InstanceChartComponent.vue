<template>
  <h3 style="text-align: center;">{{props.recordsItem.heuristic}} 算法下的 {{props.recordsItem.problemDomain}} 问题的 {{props.recordsItem.instance}} 实例分析</h3>
  <div ref="chartDom" class="chart-container"></div>
</template>

<script setup lang="ts">
import type { instanceGroupItem } from '@/types/InstanceRecords';
import { CountHeuristicCallTimesAverage } from '@/utils/DataCalculator';
import * as echarts from 'echarts';
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps<{
  recordsItem: instanceGroupItem
}>();

// DOM 引用
const chartDom = ref(null);
let myChart = null;

// 创建图表配置
const createOption = () => {
  // 准备x轴数据 (实例名称)
  const xAxisData = props.recordsItem.instanceInfo.map(item => item.run);
  
  // 准备y轴数据 (每个实例的平均启发式调用次数)
  const seriesData = props.recordsItem.instanceInfo.map(item => item.heuristicCallTimes);

  return {
    xAxis: {
      type: 'category',
      data: [...xAxisData, '平均值']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [...seriesData, CountHeuristicCallTimesAverage(props.recordsItem.instanceInfo)],
      type: 'bar',
      label: {
        show: true,
        position: 'top'
      }
    }]
  };
};

// 初始化图表
const initChart = () => {
  if (chartDom.value) {
    myChart = echarts.init(chartDom.value);
    updateChart();
  }
};

// 更新图表数据
const updateChart = () => {
  if (myChart) {
    myChart.setOption(createOption());
  }
};

// 响应窗口大小变化
const resizeHandler = () => {
  myChart?.resize();
};

// 监听props变化
watch(() => props.recordsItem.instanceInfo, (newVal) => {
  if (newVal && newVal.length > 0) {
    nextTick(() => {
      if (!myChart) {
        initChart();
      } else {
        updateChart();
      }
    });
  }
}, { deep: true });

// 生命周期钩子
onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler);
  myChart?.dispose();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>