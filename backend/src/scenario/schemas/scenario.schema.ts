import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Scenario extends Document {
  @Prop({ required: true, index: 'text' })
  title: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, index: true })
  length: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);
