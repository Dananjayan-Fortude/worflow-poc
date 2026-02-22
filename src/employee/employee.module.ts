import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeCreateWorkflow } from './workflows/employe-create.worflow';

@Module({
  providers: [EmployeeService,EmployeeCreateWorkflow],
  exports: [EmployeeService],
})
export class EmployeeModule {}
