import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: false, updatedAt: true } })
export class CurrentGame {
  @Prop({ required: true, index: true })
  instanceUrl: string;

  @Prop()
  updatedAt?: Date;
}

@Schema({ timestamps: true, id: true })
export class Player extends Document {
  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true, min: 1, max: 999 })
  discriminator: number;

  @Prop({ type: CurrentGame, default: null })
  game: CurrentGame | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);

PlayerSchema.index({ nickname: 1, discriminator: 1 }, { unique: true });
