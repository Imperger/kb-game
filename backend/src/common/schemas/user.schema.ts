import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: false } })
class UserSecret {
    @Prop()
    salt: string;

    @Prop()
    hash: string;

    @Prop()
    updatedAt?: Date;
}

@Schema()
class Scopes {
    @Prop({ default: false })
    assignScope: boolean;
    
    @Prop({ default: false })
    editScenario: boolean;
    
    @Prop({ default: false })
    moderateChat: boolean;

    @Prop({ default: '01/01/2000'})
    blockedUntil: Date;

    @Prop({ default: '01/01/2000'})
    mutedUntil: Date;
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

    @Prop({ required: true, type: Scopes })
    scopes: Scopes;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);