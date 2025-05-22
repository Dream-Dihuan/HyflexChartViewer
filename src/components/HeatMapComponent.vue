<template>
  <div id="HeatMapComponent">
    <!-- File upload section -->
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

    <!-- Or separator -->
    <div class="or-separator">或</div>

    <!-- Textarea input -->
    <el-input v-model="jsonHeatMapResult" placeholder="请粘贴记录json对象数组，例如：[{...},{...}]" type="textarea"
      :autosize="{ minRows: 4, maxRows: 10 }" />

    <el-alert v-if="parseError" :title="parseError" type="error" show-icon class="mt-2" @close="parseError = ''" />
    <el-table :data="heatMapData" :cell-style="cellStyle" border>
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="算法名称" prop="algorithmName" width="180" align="center"></el-table-column>
      <el-table-column label="SAT分数" align="center">
        <template #default="{ row }">
          {{ row.scorePerProblem?.SAT?.toFixed(5) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="TSP分数" align="center">
        <template #default="{ row }">
          {{ row.scorePerProblem?.TSP?.toFixed(5) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="FSP分数" align="center">
        <template #default="{ row }">
          {{ row.scorePerProblem?.FSP?.toFixed(5) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="QAP分数" align="center">
        <template #default="{ row }">
          {{ row.scorePerProblem?.QAP?.toFixed(5) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="算法总分" prop="totalScore" align="center" sortable>
        <template #default="{ row }">
          {{ row.totalScore?.toFixed(5) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { HeatMapInfo } from '@/types/HeatMapInfo';
import { ref, watch } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';

const jsonHeatMapResult = ref<string>("");
const heatMapData = ref<HeatMapInfo[]>([]);
const parseError = ref<string>("");

// 定义颜色渐变区间
const gradColors = [
  [{ r: 140, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }],
  [{ r: 255, g: 0, b: 0 }, { r: 255, g: 250, b: 0 }],
  [{ r: 255, g: 250, b: 0 }, { r: 1, g: 150, b: 32 }],
  [{ r: 1, g: 150, b: 32 }, { r: 1, g: 120, b: 32 }]
];
const gradBorders = [0.5, 0.75, 0.98, 1.0];

// 根据位置获取颜色
const getColorByPosition = (pos: number): string => {
  let colPos = 0;
  while (colPos < gradBorders.length && !(pos <= gradBorders[colPos])) {
    ++colPos;
  }
  const fromPos = colPos === 0 ? 0 : gradBorders[colPos - 1];
  const toPos = gradBorders[colPos];
  const newPos = (pos - fromPos) / (toPos - fromPos);

  // 获取当前区间的颜色
  const currentGradient = gradColors[colPos];
  const r = Math.floor(currentGradient[0].r + (currentGradient[1].r - currentGradient[0].r) * newPos);
  const g = Math.floor(currentGradient[0].g + (currentGradient[1].g - currentGradient[0].g) * newPos);
  const b = Math.floor(currentGradient[0].b + (currentGradient[1].b - currentGradient[0].b) * newPos);

  return `rgb(${r},${g},${b})`;
};

// 更新后的单元格背景色计算函数
const getCellColor = (value: number) => {
  if (value === null || value === undefined) return '';
  // 假设分数范围为0到1之间，根据实际需求调整
  const normalizedValue = Math.min(Math.max(value, 0), 1);
  return getColorByPosition(normalizedValue);
};

// 单元格样式函数
const cellStyle = ({ row, column, rowIndex, columnIndex }: any) => {
  // 排除序号和算法名称列
  if (columnIndex <= 1) return {};
  // 获取单元格值
  let value: number | null = null;
  if (column.property === 'totalScore') {
    value = row.totalScore;
  } else if (column.property === undefined) {
    // 处理自定义列
    const propMap: Record<number, string> = {
      2: 'SAT',
      3: 'TSP',
      4: 'FSP',
      5: 'QAP'
    };
    value = row.scorePerProblem?.[propMap[columnIndex]] ?? null;
  }
  if (value !== null) {
    return {
      backgroundColor: getCellColor(value),
      color: '#333', // 深色背景用白色文字
      fontWeight: 'bold',
      textAlign: 'center'
    };
  }
  return {};
};

// 处理文件上传
const handleFileChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      jsonHeatMapResult.value = content;
      handleInputChange();
    } catch (error) {
      parseError.value = "文件读取错误: " + (error as Error).message;
    }
  };
  reader.onerror = () => {
    parseError.value = "文件读取失败";
  };
  reader.readAsText(file.raw);
};

watch(() => jsonHeatMapResult.value, () => {
  handleInputChange();
});

const handleInputChange = () => {
  try {
    parseError.value = "";
    if (!jsonHeatMapResult.value.trim()) {
      heatMapData.value = [];
      return;
    }
    const data: HeatMapInfo[] = JSON.parse(jsonHeatMapResult.value);
    console.log("解析成功:", data);
    heatMapData.value = data;
    if (!Array.isArray(data)) {
      throw new Error("输入必须是JSON数组格式");
    }
    data.forEach(item => {
      if (!item.algorithmName || typeof item.totalScore !== 'number') {
        throw new Error("每个数组元素必须包含 algorithmName 和 totalScore 字段");
      }
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      parseError.value = "JSON格式错误: " + error.message;
    } else if (error instanceof Error) {
      parseError.value = "数据验证错误: " + error.message;
    } else {
      parseError.value = "未知错误: " + String(error);
    }
    console.error("解析失败:", error);
  }
};
</script>

<style scoped lang="scss">
.mt-2 {
  margin-top: 0.5rem;
}

#HeatMapComponent {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 优化表格样式 */
.el-table {
  font-size: 14px;

  th {
    background-color: #f5f7fa;
    font-weight: bold;
    text-align: center;
  }

  td {
    padding: 8px 0;
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
</style>