<template>
  <div id="AlgorithmSelectorComponent">
    <h4>Hyper-Heuristics Setting：</h4>
    <el-tree style="max-width: 600px" :data="data" show-checkbox node-key="value" :props="defaultProps"
      ref="AlgorithmTreeRef" :check-strictly="false" @check="handleCheckChange" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const emit = defineEmits(['selection-change']);

const AlgorithmTreeRef = ref();

const defaultProps = {
  children: 'children',
  label: 'label',
}

const data = reactive([
  {
    value: "AdapHH-GIHH",
    label: "AdapHH-GIHH",
  },
  {
    value: "LeanGIHH",
    label: "LeanGIHH",
  },
  {
    value: "NAHH",
    label: "NAHH",
  },
  {
    value: "VNS-TW",
    label: "VNS-TW",
  },
  {
    value: "HAEA",
    label: "HAEA",
  },
  {
    value: "ML",
    label: "ML",
  },
  {
    value: "HAHA",
    label: "HAHA",
  },
  {
    value: "ISEA",
    label: "ISEA",
  },
  {
    value: "EPH",
    label: "EPH",
  },
  {
    value: "XCJ",
    label: "XCJ",
  },
  {
    value: "MCHH-S",
    label: "MCHH-S",
  },
  {
    value: "KSATS-HH",
    label: "KSATS-HH",
  },
  {
    value: "GenHive",
    label: "GenHive",
  },
  {
    value: "SA-ILS",
    label: "SA-ILS",
  },
  {
    value: "Ant-Q",
    label: "Ant-Q",
  },
  {
    value: "Clean",
    label: "Clean",
  },
  {
    value: "GISS",
    label: "GISS",
  },
  {
    value: "BiasILS",
    label: "BiasILS",
  },
  {
    value: "DynILS",
    label: "DynILS",
  },
])

// 处理勾选变化
const handleCheckChange = () => {
  const selectedData = AlgorithmTreeRef.value!.getCheckedKeys(false);;
  emit('selection-change', selectedData);
}
</script>

<style scoped lang=scss></style>