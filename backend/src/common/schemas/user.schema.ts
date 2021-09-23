import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: false } })
class UserSecret {
    @Prop()
    salt: string;

    @Prop()
    hash: string;
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, index: { uniuqe: true, collation: { locale: 'en', strength: 1} }, unique: true})
    username: string;

    @Prop({ required: true, index: { uniuqe: true, collation: { locale: 'en', strength: 1} }, unique: true})
    email: string;

    @Prop({ default: false })
    confirmed: boolean;

    @Prop({ required: true, type: UserSecret })
    secret: UserSecret;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);