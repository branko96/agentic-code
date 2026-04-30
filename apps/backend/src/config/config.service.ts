import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export type AppConfigResponse = {
  appName: string;
  environment: string;
  supportEmail: string;
};

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  getConfig(): AppConfigResponse {
    return {
      appName:
        this.nestConfigService.get<string>('APP_NAME') ||
        'Next.js + NestJS Boilerplate',
      environment:
        this.nestConfigService.get<string>('NODE_ENV') || 'development',
      supportEmail:
        this.nestConfigService.get<string>('SUPPORT_EMAIL') ||
        'support@example.com',
    };
  }
}
