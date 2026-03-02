import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { WorkflowEngine } from '../workflow/core/workflow-engine.service';
import { JobData } from '../workflow/core/workflow.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkFlowDocument } from '../workflow/core/document-db.schema';
import { EmployeeCreateWorkflow } from './workflow/employe-create.worflow';

@Injectable()
export class EmployeeService implements OnApplicationShutdown {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly engine: WorkflowEngine,
    // @InjectModel('WorkFlow')
    // private readonly workflowModel: Model<WorkFlowDocument>,
    private readonly employeeWorkFlow: EmployeeCreateWorkflow,
  ) {}
  onApplicationShutdown(signal?: string) {
    this.logger.error(`Shutting down gracefully with signal: ${signal}`);
  }

  async runOnce(job: JobData<{ userId: string; userName: string }>) {
    let updated: any;
    // const existing = await this.workflowModel.findOne({
    //   correlationId: job.correlationId,
    // });
    // if (existing) {
    //   this.logger.warn(
    //     `Workflow with correlationId=${job.correlationId} has again received. Resuming from last failed step. Attempt=${existing.meta.attempt}`,
    //   );
    //   await this.workflowModel.updateOne(
    //     { correlationId: job.correlationId },
    //     {
    //       $set: { status: 'IN_PROGRESS', updatedAt: new Date().toISOString() },
    //     },
    //   );
    //   const resumeJob: JobData = {
    //     correlationId: existing.correlationId,
    //     payload: existing.payload,
    //     meta: existing.meta,
    //   };
    //   updated = await this.engine.run(resumeJob);
    // } else {
    // }

    updated = await this.engine.run(job);

    const failed = this.employeeWorkFlow.failedStep(updated);

    if (failed) {
      if (this.employeeWorkFlow.exceededMaxAttempts(updated)) {
        this.logger.error(
          `All attempts exhausted at step = ${failed.name} attempt = ${updated.meta.attempt}: ${failed.errorMessage}`,
        );
      }

      // if (existing) {
      //   // Update existing document with new attempt and error info
      //   await this.workflowModel.updateOne(
      //     { correlationId: job.correlationId },
      //     {
      //       $set: {
      //         status: 'FAILED',
      //         updatedAt: new Date().toISOString(),
      //         'meta.attempt': updated.meta.attempt,
      //         'meta.steps': updated.meta.steps,
      //       },
      //     },
      //   );
      //   return updated;
      // }

      // Update the workflow document in MongoDB with the failed job data
      // const doc = new this.workflowModel({ ...updated, status: 'FAILED' });
      // await doc.save();

      // Here is where YOU decide transport action:
      // - Kafka: re-produce message
      // - Bull: throw (so Bull retries)
      // - Cron: save in DB and retry later
      return updated;
    }

    if (this.employeeWorkFlow.completed(updated)) {
      // await this.workflowModel.updateOne(
      //   { correlationId: job.correlationId },
      //   { $set: { status: 'COMPLETED', updatedAt: new Date().toISOString() } },
      // );

      return updated;
    }

    this.logger.log(`Completed correlationId=${updated.correlationId}`);
    return updated;
  }
}
