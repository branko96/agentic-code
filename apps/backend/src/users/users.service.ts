import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.userModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash,
    });
  }

  findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }>,
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    delete updateData.password;
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async toggleBan(id: string): Promise<UserDocument | null> {
    const user = await this.findById(id);
    if (!user) return null;

    return this.userModel
      .findByIdAndUpdate(id, [{ $set: { isBanned: { $not: '$isBanned' } } }], {
        new: true,
      })
      .exec();
  }
}
