import { CalculateHeuristicCallTimesStdDev, CalculateHeuristicCallTimesVariance, CountHeuristicCallTimesAverage } from "@/utils/DataCalculator";
import type { instanceRecords } from "./InstanceRecords";

export type DetailAnalyseInfo = {
  instance:string,
  heuristicCallTimesAverage:number,
  heuristicCallTimesVariance:number,
  heuristicCallTimesStdDev:number
  instanceScore:number
}

export type HeuristicDomainAnalysis = { 
  heuristic: string,
  problemDomain: string,
  totalScore:number,
  instances: DetailAnalyseInfo[]
}