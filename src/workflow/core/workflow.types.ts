export type JobStepStatus = 'PENDING' | 'DONE' | 'FAILED' | 'SKIPPED';

export interface JobStepState {
  name: string;
  status: JobStepStatus;
  shouldRun: boolean;
  errorMessage?: string;
  updatedAt?: string;
}

export interface JobMeta {
  jobName: string;
  version: number;
  runId: string;
  attempt: number;
  maxAttempts?: number;
  steps: JobStepState[];
}
export interface JobData<TBody = any> {
  correlationId: string;   // trace across retries
  payload: TBody;
  meta: JobMeta;
}