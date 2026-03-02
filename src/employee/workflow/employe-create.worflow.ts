import { Injectable, OnModuleInit } from '@nestjs/common';
import { WorkflowRegistry } from '../../workflow/core/workflow.registry';
import { WorkFlowGenerator } from '../../workflow/core/base-workflow';
import { JobData } from '../../workflow/core/workflow.types';

type ProcessOrderBody = { userId: string; userName: string };

@Injectable()
export class EmployeeCreateWorkflow
  extends WorkFlowGenerator<JobData<ProcessOrderBody>>
  implements OnModuleInit
{
  readonly workflowName = 'employee.create';
  readonly version = 1;

  constructor(private readonly registry: WorkflowRegistry) {
    super();
  }

  onModuleInit() {
    this.registry.register(this);
  }

  protected steps() {
    return [
      {
        name: 'validate',
        run: async (job) => {
          if (!job.payload.userId) throw new Error('userId missing');
          if (!job.payload.userName) throw new Error('userName missing');

          // compute something step 2 needs
          job.meta.context ??= {};
          job.meta.context.normalizedUserName = {
            name: job.payload.userName.trim().toLowerCase(),
            timestamp: new Date().toISOString(),
          }
        },
      },
      {
        name: 'check-eligibility',
        shouldRun: (job) => true,
        run: async (job) => {
          const normalized = job.meta.context?.normalizedUserName;
          if (!normalized) {
            // This should not happen if step 1 was DONE, but guard anyway
            throw new Error('Missing normalizedUserName from validate step');
          }

          // use normalized in external call
          // const res = await eligibilityApi.check({ userId: job.payload.userId, name: normalized });
          // job.meta.context.eligibility = res;
        },
      },
      {
        name: 'create-employee',
        run: async () => {
          // send email / event
        },
      },
    ];
  }
}
