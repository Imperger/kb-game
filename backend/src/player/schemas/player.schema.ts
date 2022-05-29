import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer/decorators';
import mongoose, { Document } from 'mongoose';

import { Game } from 'src/game/schemas/game.schema';

@Schema({ timestamps: true, id: true })
export class Player extends Document {
  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true , min: 1, max: 999 })
  discriminator: number;

  /* @Prop({ type: mongoose.Types.ObjectId, ref: 'Game', default: null })
  @Type(() => Game)
  game: Game | null; */

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);

PlayerSchema.index({ nickname: 1, discriminator: 1 }, { unique: true });
