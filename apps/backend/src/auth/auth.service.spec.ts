import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
          passwordHash: string;
        },
      ]
    >;
  };
  let jwtService: {
    signAsync: jest.Mock<Promise<string>, [{ sub: string; email: string }]>;
  };

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a new user with a hashed password', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(async (data) => ({
      id: 'user-id',
      email: data.email,
      passwordHash: data.passwordHash,
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
        passwordHash: expect.any(String),
      }),
    );

    const [{ passwordHash }] = usersService.create.mock.calls[0];
    expect(passwordHash).not.toBe('password123');
    await expect(bcrypt.compare('password123', passwordHash)).resolves.toBe(
      true,
    );
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
});
