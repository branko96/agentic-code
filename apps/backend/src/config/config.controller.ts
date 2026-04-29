import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getConfig() {
    return this.configService.getConfig();
  }
}
