import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ required: true })
  description: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);

GameSchema.index({ nickname: 1, discriminator: 1 }, { unique: true });
