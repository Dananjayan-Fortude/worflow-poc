import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type WorkFlowDocument = WorkFlow & Document;

@Schema({ _id: false })
export class JobStepStateSchemaClass {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['PENDING', 'DONE', 'FAILED', 'SKIPPED'] })
  status: 'PENDING' | 'DONE' | 'FAILED' | 'SKIPPED';

  @Prop({ required: true })
  shouldRun: boolean;

  @Prop()
  errorMessage?: string;

  @Prop()
  updatedAt?: string;
}
export const JobStepStateSchema = SchemaFactory.createForClass(JobStepStateSchemaClass);

@Schema({ _id: false })
export class JobMetaSchemaClass {
  @Prop({ required: true })
  jobName: string;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  runId: string;

  @Prop({ required: true, default: 0 })
  attempt: number;

  @Prop({ default: 5 })
  maxAttempts?: number;

  @Prop({ type: [JobStepStateSchema], default: [] })
  steps: JobStepStateSchemaClass[];
}
export const JobMetaSchema = SchemaFactory.createForClass(JobMetaSchemaClass);

@Schema({ timestamps: true })
export class WorkFlow {
  @Prop({ required: true, index: true, unique: true })
  correlationId: string;

  @Prop({ required: true, enum: ['COMPLETED', 'FAILED', 'IN_PROGRESS'] })
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';

  // if payload can be anything, use Mixed
  @Prop({ type: SchemaTypes.Mixed, required: true })
  payload: any;

  // strongly type meta to enforce shape + defaults
  @Prop({ type: SchemaTypes.Mixed, required: true })
  meta: JobMetaSchemaClass;
}

export const WorkFlowSchema = SchemaFactory.createForClass(WorkFlow);