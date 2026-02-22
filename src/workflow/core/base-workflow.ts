import { JobData } from "./workflow.types";
import { WorkflowStep } from "./steps.interface";

export abstract class InitializeWorkFlow<TJob extends JobData> {
  abstract readonly workflowName: string;
  abstract readonly version: number;
  protected abstract steps(): WorkflowStep<TJob>[];

  private init(job: TJob): TJob {
    const defs = this.steps();

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

    const existing = new Map(job.meta.steps.map(s => [s.name, s]));

    job.meta.steps = defs.map(def => {
      const prev = existing.get(def.name);
      const shouldRun = def.shouldRun ? def.shouldRun(job) : true;

      return prev ?? {
        name: def.name,
        status: 'PENDING',
        shouldRun,
        updatedAt: new Date().toISOString(),
      };
    });

    return job;
  }

  async execute(job: TJob): Promise<TJob> {
    job = this.init(job);

    for (const def of this.steps()) {
      const state = job.meta.steps.find(s => s.name === def.name)!;

      if (state.status === 'DONE' || state.status === 'SKIPPED') continue;

      if (!state.shouldRun) {
        state.status = 'SKIPPED';
        continue;
      }

      try {
        await def.run(job);
        state.status = 'DONE';
        state.errorMessage = undefined;
      } catch (err: any) {
        state.status = 'FAILED';
        state.errorMessage = err?.message ?? String(err);
        job.meta.attempt += 1;
        return job; // stop and return for retry
      }
    }

    return job;
  }

  isFailed(job: TJob) {
    return job.meta.steps.some(s => s.status === 'FAILED');
  }

  isCompleted(job: TJob) {
    return job.meta.steps.every(s => s.status === 'DONE' || s.status === 'SKIPPED');
  }
}