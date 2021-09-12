import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class UserSecret {
    @Prop()
    salt: string;

    @Prop()
    hash: string;
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ unique: true })
    username: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    confirmed: boolean;

    @Prop({ type: UserSecret })
    secret: UserSecret;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);