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

  @Prop({ default: 0 })
  hoursInGame: number;

  @Prop({ default: 1000 })
  elo: number;

  @Prop({ default: 0 })
  totalPlayed: number;

  @Prop({ default: 0 })
  totalWins: number;

  @Prop({ default: 0 })
  averageCpm: number;

  @Prop({ default: 0 })
  maxCpm: number;

  @Prop({ type: Date, default: null })
  quickGameQueue: Date | null;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);

PlayerSchema.index(
  { nickname: 1, discriminator: 1 },
  { unique: true, collation: { locale: 'en', strength: 1 } }
);
PlayerSchema.index({ quickGameQueue: 1 }, { sparse: true });
