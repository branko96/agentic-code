import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ForbiddenException } from '@nestjs/common';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    usersService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    controller = new UsersController(usersService as unknown as UsersService);
  });

  it('requires JWT authentication for the controller', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, UsersController)).toContain(
      JwtAuthGuard,
    );
  });

  it.each(['findAll', 'create', 'remove'] as const)(
    'restricts %s to administrators',
    (method) => {
      expect(
        Reflect.getMetadata(GUARDS_METADATA, controller[method]),
      ).toContain(RolesGuard);
      expect(Reflect.getMetadata(ROLES_KEY, controller[method])).toEqual([
        'admin',
      ]);
    },
  );

  it('returns a sanitised user list', async () => {
    usersService.findAll.mockResolvedValue([
      {
        id: 'user-id',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        passwordHash: 'secret-hash',
      },
    ]);

    await expect(controller.findAll()).resolves.toEqual([
      expect.not.objectContaining({ passwordHash: expect.anything() }),
    ]);
  });

  it.each([
    [{ id: 'user-id', role: 'user' }, 'user-id'],
    [{ id: 'admin-id', role: 'admin' }, 'user-id'],
  ])('allows self or admin to get a user', async (authUser, id) => {
    usersService.findById.mockResolvedValue({
      id,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });

    await expect(
      controller.findOne({ user: authUser } as never, id),
    ).resolves.toEqual(expect.objectContaining({ id }));
    expect(usersService.findById).toHaveBeenCalledWith(id);
  });

  it('rejects another user from getting a user', async () => {
    await expect(
      controller.findOne(
        { user: { id: 'other-id', role: 'user' } } as never,
        'user-id',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });

  it.each([
    [{ id: 'user-id', role: 'user' }, 'user-id'],
    [{ id: 'admin-id', role: 'admin' }, 'user-id'],
  ])('allows self or admin to update a user', async (authUser, id) => {
    const dto = { firstName: 'Grace' };
    usersService.update.mockResolvedValue({ id, ...dto });

    await expect(
      controller.update({ user: authUser } as never, id, dto),
    ).resolves.toEqual({ id, ...dto });
    expect(usersService.update).toHaveBeenCalledWith(id, dto);
  });

  it('rejects another user from updating a user', () => {
    expect(() =>
      controller.update(
        { user: { id: 'other-id', role: 'user' } } as never,
        'user-id',
        { firstName: 'Grace' },
      ),
    ).toThrow(ForbiddenException);
    expect(usersService.update).not.toHaveBeenCalled();
  });

  it('delegates create and delete operations', async () => {
    const dto = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    };
    usersService.create.mockResolvedValue({ id: 'user-id' });
    usersService.delete.mockResolvedValue({ id: 'user-id' });

    await expect(controller.create(dto)).resolves.toEqual({ id: 'user-id' });
    await expect(controller.remove('user-id')).resolves.toEqual({
      id: 'user-id',
    });
    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(usersService.delete).toHaveBeenCalledWith('user-id');
  });
});
