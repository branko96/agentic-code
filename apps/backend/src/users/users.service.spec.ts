import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

type CreatedUser = Record<string, unknown>;

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: {
    create: jest.Mock<Promise<CreatedUser>, [CreatedUser]>;
    findByIdAndUpdate: jest.Mock;
  };

  beforeEach(() => {
    userModel = {
      create: jest.fn().mockImplementation(async (doc: CreatedUser) => doc),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    usersService = new UsersService(
      userModel as unknown as Model<UserDocument>,
    );
  });

  describe('create', () => {
    it('hashes the password and never persists the plaintext', async () => {
      await usersService.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      });

      const [persisted] = userModel.create.mock.calls[0];

      expect(persisted).not.toHaveProperty('password');
      expect(persisted.passwordHash).toEqual(expect.any(String));
      expect(persisted.passwordHash).not.toBe('password123');
      await expect(
        bcrypt.compare('password123', persisted.passwordHash as string),
      ).resolves.toBe(true);
    });

    it('normalises the email to lowercase', async () => {
      await usersService.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'Ada@Example.COM',
        password: 'password123',
      });

      const [persisted] = userModel.create.mock.calls[0];
      expect(persisted.email).toBe('ada@example.com');
    });
  });

  describe('update', () => {
    it('hashes a new password and strips the plaintext field', async () => {
      await usersService.update('user-id', { password: 'newpassword456' });

      const [, updateData] = userModel.findByIdAndUpdate.mock.calls[0];

      expect(updateData).not.toHaveProperty('password');
      expect(updateData.passwordHash).toEqual(expect.any(String));
      await expect(
        bcrypt.compare('newpassword456', updateData.passwordHash),
      ).resolves.toBe(true);
    });

    it('leaves the stored hash untouched when no password is supplied', async () => {
      await usersService.update('user-id', { firstName: 'Grace' });

      const [, updateData] = userModel.findByIdAndUpdate.mock.calls[0];

      expect(updateData).toEqual({ firstName: 'Grace' });
      expect(updateData).not.toHaveProperty('passwordHash');
    });
  });
});
