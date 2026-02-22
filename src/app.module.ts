import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowModule } from './workflow/workflow.module';
import { EmployeeModule } from './employee/employee.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkFlowSchema } from './workflow/core/document-db.schema';

@Module({
  imports: [
    WorkflowModule,
    EmployeeModule,
    MongooseModule.forRoot('mongodb://localhost:27017'),
    MongooseModule.forFeature([{ name: 'WorkFlow', schema: WorkFlowSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
