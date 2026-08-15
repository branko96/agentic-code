import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

type MockUser = {
  id: string;
  email: string;
  passwordHash: string;
  toJSON: () => {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    findByEmail: jest.Mock<Promise<MockUser | null>, [string]>;
    create: jest.Mock<
      Promise<MockUser>,
      [
        {
          firstName: string;
          lastName: string;
          email: string;
          password: string;
        },
      ]
    >;
  };
  let jwtService: {
    signAsync: jest.Mock<Promise<string>, [{ sub: string; email: string }]>;
  };
  let userModel: Pick<Model<UserDocument>, 'findById'>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    };

    userModel = {
      findById: jest.fn(),
    } as unknown as Pick<Model<UserDocument>, 'findById'>;

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      userModel as Model<UserDocument>,
    );
  });

  // Hashing lives in UsersService.create, not here. This test owns the
  // delegation contract; users.service.spec.ts owns the hashing guarantee.
  it('registers a new user by delegating credential storage', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(async (data) => ({
      id: 'user-id',
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      toJSON: () => ({
        id: 'user-id',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      }),
    }));

    const result = await authService.register({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        password: 'password123',
      }),
    );

    // AuthService must not pre-hash: doing so would double-hash in UsersService
    // and silently break every subsequent login.
    const [createArgs] = usersService.create.mock.calls[0];
    expect(createArgs).not.toHaveProperty('passwordHash');
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: {
        id: 'user-id',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      },
    });
  });

  it('rejects duplicate registrations', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      passwordHash: 'hash',
      toJSON: () => ({ id: 'user-id', email: 'ada@example.com' }),
    });

    await expect(
      authService.register({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      passwordHash,
      toJSON: () => ({
        id: 'user-id',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      }),
    });

    const result = await authService.login({
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'ada@example.com',
    });
    expect(result.accessToken).toBe('signed-token');
  });

  it('rejects invalid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      passwordHash,
      toJSON: () => ({ id: 'user-id', email: 'ada@example.com' }),
    });

    await expect(
      authService.login({
        email: 'ada@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the authenticated profile when it exists', async () => {
    const lean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: { toString: () => 'user-id' },
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      }),
    });

    (userModel.findById as jest.Mock).mockReturnValue({ lean });

    await expect(authService.getProfile('user-id')).resolves.toEqual({
      id: 'user-id',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      createdAt: undefined,
      updatedAt: undefined,
    });
  });
});
