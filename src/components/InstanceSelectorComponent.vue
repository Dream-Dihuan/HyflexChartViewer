<template>
  <div id="InstanceSelectorComponent">
    <h4>题目实例设定：</h4>
    <el-tree style="max-width: 600px" :data="data" show-checkbox node-key="value" :props="defaultProps"
      ref="instanceTreeRef" :check-strictly="false" @check="handleCheckChange" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const emit = defineEmits(['selection-change']);

const instanceTreeRef = ref();

const defaultProps = {
  children: 'children',
  label: 'label',
}

const data = reactive([
  {
    value: "SAT",
    label: "SAT 问题",
    children: [
      {
        value: "pg-525-2276-hyflex-3",
        label: "pg-525-2276-hyflex-3",
      },
      {
        value: "pg-696-3122-hyflex-5",
        label: "pg-696-3122-hyflex-5",
      },
      {
        value: "pg-525-2336-hyflex-4",
        label: "pg-525-2336-hyflex-4",
      },
      {
        value: "jarv-684-2300-hyflex-10",
        label: "jarv-684-2300-hyflex-10",
      },
      {
        value: "hg4-300-1200-hyflex-11",
        label: "hg4-300-1200-hyflex-11",
      },
    ],
  },
  {
    value: "TSP",
    label: "TSP 问题",
    children: [
      {
        value: "pr299-hyflex-0",
        label: "pr299-hyflex-0",
      },
      {
        value: "usa13509-hyflex-8",
        label: "usa13509-hyflex-8",
      },
      {
        value: "rat575-hyflex-2",
        label: "rat575-hyflex-2",
      },
      {
        value: "u2152-hyflex-7",
        label: "u2152-hyflex-7",
      },
      {
        value: "d1291-hyflex-6",
        label: "d1291-hyflex-6",
      },
    ],
  },
  {
    value: "FSP",
    label: "FSP 问题",
    children: [
      {
        value: "tai100_20_02",
        label: "tai100_20_02",
      },
      {
        value: "tai500_20_02",
        label: "tai500_20_02",
      },
      {
        value: "tai100_20_04",
        label: "tai100_20_04",
      },
      {
        value: "tai200_20_01",
        label: "tai200_20_01",
      },
      {
        value: "tai500_20_03",
        label: "tai500_20_03",
      },
    ],
  },
  {
    value: "QAP",
    label: "QAP 问题",
    children: [
      {
        value: "sko100a",
        label: "sko100a",
      },
      {
        value: "tai100a",
        label: "tai100a",
      },
      {
        value: "tai256c",
        label: "tai256c",
      },
      {
        value: "tho150",
        label: "tho150",
      },
      {
        value: "wil100",
        label: "wil100",
      },
    ],
  },
])

// 查找父节点
const findParent = (childValue) => {
  for (const problem of data) {
    if (problem.children) {
      const found = problem.children.some(child => child.value === childValue);
      if (found) return problem;
    }
  }
  return null;
}

// 获取当前选中的节点数据
const getSelectedData = () => {
  const checkedKeys = instanceTreeRef.value!.getCheckedKeys(false);

  // 过滤掉父节点的key
  const leafKeys = checkedKeys.filter(key => {
    return !data.some(item => item.value === key);
  });

  // 构建包含父节点信息的对象数组
  return leafKeys.map(key => {
    const parent = findParent(key);
    return {
      problem: parent?.value || '',
      instance: key
    };
  });
}

// 处理勾选变化
const handleCheckChange = () => {
  const selectedData = getSelectedData();
  emit('selection-change', selectedData);
}
</script>

<style scoped lang=scss></style>