import { UnauthorizedException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    getProfile: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates registration to AuthService', async () => {
    const dto = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    };
    authService.register.mockResolvedValue({ accessToken: 'token' });

    await expect(controller.register(dto)).resolves.toEqual({
      accessToken: 'token',
    });
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login to AuthService', async () => {
    const dto = { email: 'ada@example.com', password: 'password123' };
    authService.login.mockResolvedValue({ accessToken: 'token' });

    await expect(controller.login(dto)).resolves.toEqual({
      accessToken: 'token',
    });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('protects the me endpoint with JwtAuthGuard', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, controller.me)).toContain(
      JwtAuthGuard,
    );
  });

  it('returns the authenticated user profile', async () => {
    authService.getProfile.mockResolvedValue({ id: 'user-id' });

    await expect(
      controller.me({ user: { id: 'user-id' } } as never),
    ).resolves.toEqual({ id: 'user-id' });
    expect(authService.getProfile).toHaveBeenCalledWith('user-id');
  });

  it('rejects a request without an authenticated user id', async () => {
    await expect(controller.me({} as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authService.getProfile).not.toHaveBeenCalled();
  });
});
