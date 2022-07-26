import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Spawner extends Document {
  @Prop({ required: true, unique: true })
  url: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  secret: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SpawnerSchema = SchemaFactory.createForClass(Spawner);
