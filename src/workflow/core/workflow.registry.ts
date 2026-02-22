import { Injectable } from '@nestjs/common';
import { WorkFlowGenerator } from './base-workflow';

@Injectable()
export class WorkflowRegistry {
  private readonly map = new Map<string, WorkFlowGenerator<any>>();

  register(workflow: WorkFlowGenerator) {
    this.map.set(workflow.workflowName, workflow);
  }

  get(workflowName: string): WorkFlowGenerator {
    const wf = this.map.get(workflowName);
    if (!wf) throw new Error(`Workflow not registered: ${workflowName}`);
    return wf;
  }
}