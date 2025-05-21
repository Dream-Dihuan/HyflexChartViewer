import type { instanceRecords } from "@/types/InstanceRecords";
import type { ProblemGroupItem, ProblemInfo, ProblemJsonInfo } from "@/types/QuestionAnalyseInfo";

export const convertToProblemGroupItem = (
  records: ProblemJsonInfo[],
  targetProblemDomain: string
): ProblemGroupItem =>{
  const filtered = records.filter(record => record.problemDomain === targetProblemDomain);
  // console.log(filtered);
  

  const instanceInfo: ProblemGroupItem[] = filtered.map(record => ({
    heuristic: record.heuristic,
    instance: record.instance,
    heuristicCallTimesAverage: record.heuristicCallTimesAverage,
    heuristicCallTimesVariance: record.heuristicCallTimesVariance,
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