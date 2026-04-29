import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request & { user?: { id?: string } }) {
    const authUser = req.user;

    if (!authUser?.id) {
      throw new UnauthorizedException();
    }

    return this.usersService.findByIdOrThrow(authUser.id);
  }
}
