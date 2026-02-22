import { Global, Module } from '@nestjs/common';
import { WorkflowEngine } from './core/workflow-engine.service';
import { WorkflowRegistry } from './core/workflow.registry';
import { WorkFlowGenerator } from './core/base-workflow';

@Global()
@Module({
  providers: [WorkflowRegistry, WorkflowEngine],
  exports: [WorkflowRegistry, WorkflowEngine],
})
export class WorkflowModule {}
