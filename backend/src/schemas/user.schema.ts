import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class UserSecret {
    @Prop()
    salt: string;

    @Prop()
    hash: string;
}

@Schema()
export class User extends Document {
    @Prop()
    username: string;

    @Prop()
    email: string;

    @Prop()
    createdAt: string;

    @Prop({ type: UserSecret })
    secret: UserSecret;
}

export const UserSchema = SchemaFactory.createForClass(User);