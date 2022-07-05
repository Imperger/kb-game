import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, id: true })
export class Player extends Document {
  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true , min: 1, max: 999 })
  discriminator: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);

PlayerSchema.index({ nickname: 1, discriminator: 1 }, { unique: true });
