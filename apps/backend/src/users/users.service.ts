import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument, toUserResponse } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll() {
    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return users.map((user) => toUserResponse(user));
  }

  async createFromDashboard(dto: CreateUserDto) {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
    });

    return user.toJSON();
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existingUser = await this.findByEmail(dto.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }

      user.email = dto.email.toLowerCase();
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await user.save();

    return user.toJSON();
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).lean().exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponse(user);
  }
}
