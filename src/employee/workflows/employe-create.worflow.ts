import { Injectable, OnModuleInit } from '@nestjs/common';
import { WorkflowRegistry } from '../../workflow/core/workflow.registry';
import { InitializeWorkFlow } from '../../workflow/core/base-workflow';
import { JobData } from '../../workflow/core/workflow.types';

type ProcessOrderBody = { orderId: string; paymentRetried?: boolean };

@Injectable()
export class EmployeeCreateWorkflow
  extends InitializeWorkFlow<JobData<ProcessOrderBody>>
  implements OnModuleInit
{
  readonly workflowName = 'orders.process';
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
          if (!job.payload.orderId) throw new Error('orderId missing');
        },
      },
      {
        name: 'charge-payment',
        run: async (job) => {
          // fail first time, succeed next retry
          if (!job.payload.paymentRetried) {
            job.payload.paymentRetried = true;
            throw new Error('Payment gateway timeout');
          }
        },
      },
      {
        name: 'send-confirmation',
        run: async () => {
          // send email / event
        },
      },
    ];
  }
}
