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
        shouldRun: (job) => true, // can be dynamic based on job.payload or external factors
        run: async (job) => {
          if (!job.payload.userId) throw new Error('userId missing');
          if (!job.payload.userName) throw new Error('userName missing');
        },
      },
      {
        name: 'check-eligibility',
        shouldRun: (job) => (job.meta.attempt === 0), // skip this step for now
        run: async (job) => {
          // call external service to check if user is eligible for employee creation
          if (job.meta.attempt === 0) {
            throw new Error('Simulated failure at check-eligibility step');
          }
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
