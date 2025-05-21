export type ProblemGroupItem = {
  problemDomain: string;
  instanceInfo: ProblemInfo[]
}

export type ProblemInfo = {
  heuristic: string
  instance: string
  heuristicCallTimesAverage: number
  heuristicCallTimesVariance: number
  heuristicCallTimesStdDev: number
  instanceScore:number
  totalScore:number
}

export type ProblemJsonInfo = {
  problemDomain: string;
  heuristic: string
  instance: string
  heuristicCallTimesAverage: number
  heuristicCallTimesVariance: number
  heuristicCallTimesStdDev: number
  instanceScore:number
  totalScore:number
}