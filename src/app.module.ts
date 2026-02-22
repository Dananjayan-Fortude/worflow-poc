import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowModule } from './workflow/workflow.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [WorkflowModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
