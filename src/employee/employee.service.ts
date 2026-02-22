import { Injectable, Logger } from '@nestjs/common';
import { WorkflowEngine } from '../workflow/core/workflow-engine.service';
import { JobData } from '../workflow/core/workflow.types';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly engine: WorkflowEngine) {}

  async runOnce(job: JobData<{ orderId: string; paymentRetried?: boolean }>) {
    const updated = await this.engine.run(job);

    console.dir(updated, { depth: null });

    const failed = updated.meta.steps.find((s) => s.status === 'FAILED');
    if (failed) {
      this.logger.error(
        `Failed at step = ${failed.name} attempt = ${updated.meta.attempt}: ${failed.errorMessage}`,
      );

      // Here is where YOU decide transport action:
      // - Kafka: re-produce message
      // - Bull: throw (so Bull retries)
      // - Cron: save in DB and retry later
      return updated;
    }

    this.logger.log(`Completed correlationId=${updated.correlationId}`);
    return updated;
  }
}
