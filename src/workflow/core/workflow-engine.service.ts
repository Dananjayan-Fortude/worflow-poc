import { Injectable } from '@nestjs/common';
import { WorkflowRegistry } from './workflow.registry';
import { JobData } from './workflow.types';

@Injectable()
export class WorkflowEngine {
  constructor(private readonly registry: WorkflowRegistry) {}

  async run<T extends JobData>(job: T): Promise<T> {
    const jobImpl = this.registry.get(job.meta?.jobName ?? job['meta']?.jobName);
    return (await jobImpl.execute(job)) as T;
  }
}