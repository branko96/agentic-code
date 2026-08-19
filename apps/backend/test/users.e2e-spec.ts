import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController authorization (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let mongoServer: MongoMemoryServer;

  const register = (email: string) =>
    request(app.getHttpServer()).post('/auth/register').send({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email,
      password: 'password123',
    });
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
  });

  beforeEach(async () => {
    await connection.db.dropDatabase();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  const promoteToAdmin = async (email: string) => {
    await connection
      .collection('users')
      .updateOne({ email }, { $set: { role: 'admin' } });
  };

  it('never exposes passwordHash in GET /users', async () => {
    const registerResponse = await register('ada@example.com').expect(201);
    const token = registerResponse.body.accessToken as string;
    await promoteToAdmin('ada@example.com');

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
    expect(response.body[0]).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('never exposes passwordHash in GET /users/:id', async () => {
    const registerResponse = await register('ada@example.com').expect(201);
    const token = registerResponse.body.accessToken as string;
    const userId = registerResponse.body.user.id as string;

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: userId,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('denies a non-admin user list and delete with 403', async () => {
    const registerResponse = await register('ada@example.com').expect(201);
    const token = registerResponse.body.accessToken as string;

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete('/users/some-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('allows an admin user to list and delete', async () => {
    const adminRegister = await register('admin@example.com').expect(201);
    const adminToken = adminRegister.body.accessToken as string;
    await promoteToAdmin('admin@example.com');

    const victim = await register('victim@example.com').expect(201);
    const victimId = victim.body.user.id as string;

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/users/${victimId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('still allows any authenticated user to read a single user', async () => {
    const registerResponse = await register('ada@example.com').expect(201);
    const token = registerResponse.body.accessToken as string;
    const userId = registerResponse.body.user.id as string;

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('allows a user to update their own profile', async () => {
    const registerResponse = await register('ada@example.com').expect(201);
    const token = registerResponse.body.accessToken as string;
    const userId = registerResponse.body.user.id as string;

    await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Ada Updated' })
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toBe('Ada Updated');
      });
  });

  it('forbids a non-admin user from updating another user profile', async () => {
    const registerResponse = await register('ada@example.com').expect(201);
    const token = registerResponse.body.accessToken as string;

    const victim = await register('victim@example.com').expect(201);
    const victimId = victim.body.user.id as string;

    await request(app.getHttpServer())
      .patch(`/users/${victimId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Hacked' })
      .expect(403);
  });

  it('allows an admin user to update another user profile', async () => {
    const adminRegister = await register('admin@example.com').expect(201);
    const adminToken = adminRegister.body.accessToken as string;
    await promoteToAdmin('admin@example.com');

    const victim = await register('victim@example.com').expect(201);
    const victimId = victim.body.user.id as string;

    await request(app.getHttpServer())
      .patch(`/users/${victimId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Admin Edited' })
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toBe('Admin Edited');
      });
  });
});
