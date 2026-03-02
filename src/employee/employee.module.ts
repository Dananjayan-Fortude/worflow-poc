import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeCreateWorkflow } from './workflow/employe-create.worflow';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkFlowSchema } from '../workflow/core/document-db.schema';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: 'WorkFlow', schema: WorkFlowSchema }]),
  ],
  providers: [EmployeeService,EmployeeCreateWorkflow],
  exports: [EmployeeService],
})
export class EmployeeModule {}
