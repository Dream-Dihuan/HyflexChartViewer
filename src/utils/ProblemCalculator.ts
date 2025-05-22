import type { instanceGroupItem, instanceRecords } from "@/types/InstanceRecords";
import type { ProblemGroupItem, ProblemInfo, ProblemJsonInfo } from "@/types/QuestionAnalyseInfo";

export const convertToProblemGroupItem = (
  records: ProblemJsonInfo[],
  targetProblemDomain: string
): ProblemGroupItem =>{
  const filtered = records.filter(record => record.problemDomain === targetProblemDomain);
  // console.log(filtered);
  

  const instanceInfo: ProblemInfo[] = filtered.map(record => ({
    heuristic: record.heuristic,
    instance: record.instance,
    heuristicCallTimesAverage: record.heuristicCallTimesAverage,
    // heuristicCallTimesVariance: record.heuristicCallTimesVariance,
    heuristicCallTimesStdDev: record.heuristicCallTimesStdDev,
    instanceScore:record.instanceScore,
    totalScore:record.totalScore
  }));

  // console.log(instanceInfo);
  
  return {
    problemDomain: targetProblemDomain,
    instanceInfo
  };
}

/**
 * 获取指定的ProblemDomain下不同算法的Instance数据列表
 * @param records 原始数据列表
 * @param targetHeuristic 指定的算法名称
 * @param targetProblemDomain 指定的问题名称
 * @param targetInstance 指定的实例名称
 */

export const convertToGroupItem = (
  records: instanceGroupItem[],
  targetHeuristic:String[]|null,
  targetProblemDomain: string|null,
  targetInstance:string|null ) => {
  // const problemGroupItemList:ProblemGroupItem  = convertToProblemGroupItem(records,targetProblemDomain);
  const problemGroupItemList=records;
  let filtered = problemGroupItemList
  if(targetProblemDomain!=null){
    filtered = filtered.filter(item => item.problemDomain=== targetProblemDomain)
  }
    if(targetHeuristic!=null){
    filtered = filtered.filter(item => targetHeuristic.includes(item.heuristic));
  }
  if(targetInstance!=null){
    filtered = filtered.filter(item => item.instance === targetInstance);
  }

  return filtered;
}