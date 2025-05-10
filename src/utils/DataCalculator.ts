import type { DetailAnalyseInfo, HeuristicDomainAnalysis } from "@/types/DetailAnalyseInfo";
import type { instanceGroupItem, instanceInfo, instanceRecords } from "@/types/InstanceRecords"


// 平均数
export const CountHeuristicCallTimesAverage = (reocrdsList:instanceInfo[]):number =>{
  let size = reocrdsList.length;
  let sum = 0;
  reocrdsList.forEach(item=>{
    sum+=item.heuristicCallTimes
  })
  return sum/size;
}

// 方差
export const CalculateHeuristicCallTimesVariance = (recordsList: instanceRecords[]): number => {
  const size = recordsList.length;
  if (size === 0) return 0;

  const avg = CountHeuristicCallTimesAverage(recordsList);
  let sumOfSquares = 0;

  recordsList.forEach(item => {
    sumOfSquares += Math.pow(item.heuristicCallTimes - avg, 2);
  });

  return sumOfSquares / size;
};

// 标准差
export const CalculateHeuristicCallTimesStdDev = (recordsList: instanceRecords[]): number => {
  const variance = CalculateHeuristicCallTimesVariance(recordsList);
  return Math.sqrt(variance);
};

export const analyzeHeuristicCallTimesByDomain=(data: instanceRecords[]): HeuristicDomainAnalysis[]=> {
  console.log(data);
  
  const groupedData: Record<string, Record<string, {
    records: instanceRecords[],
    totalScore: number
  }>> = {};

  data.forEach(item => {
    if (!groupedData[item.heuristic]) {
      groupedData[item.heuristic] = {};
    }
    if (!groupedData[item.heuristic][item.problemDomain]) {
      groupedData[item.heuristic][item.problemDomain] = {
        records: [],
        totalScore: item.totalScore
      };
    }
    groupedData[item.heuristic][item.problemDomain].records.push(item);
  });
  const result: HeuristicDomainAnalysis[] = [];

  for (const heuristic in groupedData) {
    for (const domain in groupedData[heuristic]) {
      const { records, totalScore } = groupedData[heuristic][domain];
      const instanceGroups: Record<string, instanceRecords[]> = {};
      
      records.forEach(item => {
        if (!instanceGroups[item.instance]) {
          instanceGroups[item.instance] = [];
        }
        instanceGroups[item.instance].push(item);
      });
      const instanceAnalyses: DetailAnalyseInfo[] = [];
      
      for (const instance in instanceGroups) {
        const instanceRecords = instanceGroups[instance];
        const avg = CountHeuristicCallTimesAverage(instanceRecords);
        const variance = CalculateHeuristicCallTimesVariance(instanceRecords);
        const stdDev = CalculateHeuristicCallTimesStdDev(instanceRecords);

        const instanceScore = instanceRecords[0].instanceScore;
        
        instanceAnalyses.push({
          instance,
          heuristicCallTimesAverage: avg,
          heuristicCallTimesVariance: variance,
          heuristicCallTimesStdDev: stdDev,
          instanceScore
        });
      }

      result.push({
        heuristic,
        problemDomain: domain,
        totalScore,
        instances: instanceAnalyses
      });
    }
  }

  return result;
}

export const groupRecordsByHeuristicDomainAndInstance = (
  data: instanceRecords[]
): instanceGroupItem[] =>{
  // 使用Map来存储分组结果，键为heuristic+problemDomain+instance组合
  const groupMap = new Map<string, instanceGroupItem>();

  data.forEach((record) => {
    // 创建组合键
    const key = `${record.heuristic}|${record.problemDomain}|${record.instance}`;
    
    // 如果不存在该分组，则创建新分组
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        heuristic: record.heuristic,
        problemDomain: record.problemDomain,
        instance: record.instance,
        instanceInfo: []
      });
    }
    
    // 获取当前分组
    const group = groupMap.get(key)!;
    
    // 添加当前记录到分组的instanceInfo中
    group.instanceInfo.push({
      run: record.run,
      heuristicCallTimes: record.heuristicCallTimes,
      instanceScore: record.instanceScore,
      totalScore: record.totalScore
    });
  });

  // 将Map转换为数组
  return Array.from(groupMap.values());
}