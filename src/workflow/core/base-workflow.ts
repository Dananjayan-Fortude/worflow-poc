import { JobData, JobStepState } from "./workflow.types";
import { WorkflowStep } from "./steps.interface";

export abstract class InitializeWorkFlow<TJob extends JobData = JobData> {
  abstract readonly workflowName: string;
  abstract readonly version: number;
  protected abstract steps(): WorkflowStep<TJob>[];

  protected init(job: TJob): void {
    // init meta if first time
    if (!job.meta) {
      job.meta = {
        jobName: this.workflowName,
        version: this.version,
        runId: crypto.randomUUID(),
        attempt: 0,
        maxAttempts: 5,
        steps: [],
      };
    }

    // keep jobName/version consistent
    job.meta.jobName = this.workflowName;
    job.meta.version = this.version;
    job.meta.maxAttempts ??= 5;

    // initialize steps if empty
    if (!job.meta.steps || job.meta.steps.length === 0) {
      job.meta.steps = this.steps().map((s) => ({
        name: s.name,
        status: 'PENDING',
        shouldRun: true,
        updatedAt: new Date().toISOString(),
      }));
    }

    // refresh shouldRun (optional)
    for (const def of this.steps()) {
      const st = job.meta.steps.find((x) => x.name === def.name);
      if (!st) continue;
      st.shouldRun = def.shouldRun ? !!def.shouldRun(job) : true;
    }
  }

  async execute(job: TJob): Promise<TJob> {
    this.init(job);

    for (const def of this.steps()) {
      const state = job.meta.steps.find((s) => s.name === def.name)!;

      if (state.status === 'DONE' || state.status === 'SKIPPED') continue;

      if (!state.shouldRun) {
        state.status = 'SKIPPED';
        continue;
      }

      try {
        await def.run(job);
        state.status = 'DONE';
        state.errorMessage = undefined;
        state.updatedAt = new Date().toISOString();
      } catch (err: any) {
        state.status = 'FAILED';
        state.errorMessage = err?.message ?? String(err);
        state.updatedAt = new Date().toISOString();
        job.meta.attempt += 1;
        return job; // stop and return for retry
      }
    }

    return job;
  }

  failedStep(job: TJob): JobStepState | undefined {
    return job.meta.steps.find(s => s.status === 'FAILED');
  }

  completed(job: TJob): boolean {
    return job.meta.steps.every(s => s.status === 'DONE' || s.status === 'SKIPPED');
  }

  exceededMaxAttempts(job: TJob): boolean {
    return job.meta.attempt >= (job.meta.maxAttempts ?? 5);
  }
}