import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

import { Seconds } from '@/common/duration';
import { Player } from '@/player/schemas/player.schema';

@Schema({ timestamps: false, _id: false })
export class InputEvent {
  @Prop({ required: true })
  char: string;

  @Prop({ required: true })
  correct: boolean;

  @Prop({ required: true })
  timestamp: number;
}

export const InputEventSchema = SchemaFactory.createForClass(InputEvent);

@Schema({ timestamps: false, _id: false })
export class Track {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Player.name,
    index: true
  })
  player: Player;

  @Prop({ required: true, type: Number })
  cpm: number;

  @Prop({ required: true, type: Number })
  accuracy: number;

  @Prop({ required: true, type: [InputEventSchema] })
  data: InputEvent[];
}

export const TrackSchema = SchemaFactory.createForClass(Track);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Replay extends Document {
  @Prop({ required: true, type: Number })
  duration: Seconds;

  @Prop({ required: true, type: [TrackSchema] })
  tracks: Track[];

  @Prop({ index: true })
  createdAt?: Date;
}

export const ReplaySchema = SchemaFactory.createForClass(Replay);
