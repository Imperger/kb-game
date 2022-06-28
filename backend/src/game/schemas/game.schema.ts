import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ required: true, unique: true })
  instanceUrl: string;

  @Prop({ required: true })
  instanceId: string;

  @Prop({ required: true })
  spawnerUrl: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
