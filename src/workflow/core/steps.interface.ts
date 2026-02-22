import { JobData } from "./workflow.types";

export interface WorkflowStep<TJob extends JobData> {
  name: string;
  shouldRun?: (job: TJob) => boolean;
  run: (job: TJob) => Promise<void>;
}