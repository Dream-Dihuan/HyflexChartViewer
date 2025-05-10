export type instanceRecords = {
  heuristic: string;
  problemDomain: string;
  instance: string;
  run: string;
  bestValue: number;
  timeout: number;
  timeMillis: number;
  heuristicCallTimes: number;
  instanceScore: number;
  totalScore: number;
}

export type instanceGroupItem = {
  heuristic: string;
  problemDomain: string;
  instance: string;
  instanceInfo: instanceInfo[]
}

export type instanceInfo = {
  run:string
  heuristicCallTimes: number;
  instanceScore:number,
  totalScore:number
}