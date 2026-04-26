import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export function toUserResponse(user: {
  _id?: Types.ObjectId;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: user.id ?? user._id?.toString() ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse;
}

UserSchema.set('toJSON', {
  transform: (_doc, ret) => toUserResponse(ret),
});
