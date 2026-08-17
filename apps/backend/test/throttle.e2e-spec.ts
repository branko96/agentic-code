import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ThrottlerStorage } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth rate limiting (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let mongoServer: MongoMemoryServer;
  let throttlerStorage: { storage: Map<string, unknown> };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    connection = moduleRef.get<Connection>(getConnectionToken());
    // Throttle counters live in the in-memory storage for the lifetime of the
    // app instance; reset them so tests do not leak hit counts into each other.
    throttlerStorage = moduleRef.get(ThrottlerStorage) as unknown as {
      storage: Map<string, unknown>;
    };
  });

  beforeEach(async () => {
    await connection.db.dropDatabase();
    throttlerStorage.storage.clear();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  const registerPayload = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: 'password123',
  };

  it('allows requests under the limit and returns 429 once it is exceeded', async () => {
    // Limit is 5 req/min per IP per endpoint (AuthController @Throttle).
    for (let i = 0; i < 5; i += 1) {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerPayload, email: `ada${i}@example.com` });
      // First succeeds, duplicates rejected as conflict -- either way the
      // throttle limit is what we are asserting here, not the business rule.
      expect([201, 409]).toContain(res.status);
    }

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...registerPayload, email: 'overflow@example.com' })
      .expect(429);
  });

  it('returns 429 on /auth/login once the limit is exceeded', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    const { accessToken } = registerResponse.body as { accessToken: string };
    expect(accessToken).toEqual(expect.any(String));

    const credentials = {
      email: 'ada@example.com',
      password: 'password123',
    };

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
      expect([201, 401]).toContain(res.status);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(429);
  });
});
