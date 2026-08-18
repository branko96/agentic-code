import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

describe('ConfigController', () => {
  let app: INestApplication;
  let configService: { getConfig: jest.Mock };
  const mockGuard = { canActivate: jest.fn() };

  beforeAll(async () => {
    configService = { getConfig: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [{ provide: ConfigService, useValue: configService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the app config for an authenticated request', async () => {
    const payload = {
      appName: 'Next.js + NestJS Boilerplate',
      environment: 'development',
      supportEmail: 'support@example.com',
    };
    mockGuard.canActivate.mockResolvedValue(true);
    configService.getConfig.mockReturnValue(payload);

    const response = await request(app.getHttpServer())
      .get('/config')
      .expect(200);

    expect(response.body).toEqual(payload);
    expect(configService.getConfig).toHaveBeenCalledTimes(1);
  });

  it('rejects unauthenticated requests via JwtAuthGuard', async () => {
    mockGuard.canActivate.mockRejectedValue(new UnauthorizedException());

    await request(app.getHttpServer()).get('/config').expect(401);

    expect(configService.getConfig).not.toHaveBeenCalled();
  });
});
