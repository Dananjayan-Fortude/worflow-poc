import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EmployeeService } from './employee/employee.service';
import { JobData } from './workflow/core/workflow.types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly employeeService: EmployeeService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test/workflow')
  async testWorkflow() {
    const job: JobData<{ orderId: string; paymentRetried?: boolean }> = {
      correlationId: 'corr-123',
      payload: { orderId: 'ORD-1' },
      meta: {
        jobName: 'orders.process',
        version: 1,
        runId: crypto.randomUUID(),
        attempt: 0,
        maxAttempts: 5,
        steps: [], // empty => will be initialized automatically
      },
    };
    await this.employeeService.runOnce(job);
    return { message: 'Workflow executed successfully' };
  }
}
