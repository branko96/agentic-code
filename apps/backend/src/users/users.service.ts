import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, toUserResponse } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }) {
    return this.userModel.create({
      ...data,
      email: data.email.toLowerCase(),
    });
  }

  async findByIdOrThrow(id: string) {
    const user = await this.userModel.findById(id).lean().exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponse(user);
  }
}
