import { Injectable } from '@nestjs/common';
import { InitializeWorkFlow } from './base-workflow';

@Injectable()
export class WorkflowRegistry {
  private readonly map = new Map<string, InitializeWorkFlow<any>>();

  register(workflow: InitializeWorkFlow<any>) {
    this.map.set(workflow.workflowName, workflow);
  }

  get(workflowName: string): InitializeWorkFlow<any> {
    const wf = this.map.get(workflowName);
    if (!wf) throw new Error(`Workflow not registered: ${workflowName}`);
    return wf;
  }
}