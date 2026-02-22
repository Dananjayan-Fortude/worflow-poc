import { Injectable } from '@nestjs/common';
import { WorkflowRegistry } from './workflow.registry';
import { JobMeta } from './workflow.types';

@Injectable()
export class WorkflowEngine {
  constructor(private readonly registry: WorkflowRegistry) {}

  async run<T extends JobMeta>(job: T): Promise<T> {
    const wf = this.registry.get(job.jobName);
    return (await wf.execute(job)) as T;
  }
}