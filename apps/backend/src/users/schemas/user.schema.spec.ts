import { UserSchema, toUserResponse } from './user.schema';

describe('User schema role field', () => {
  it('defaults to "user"', () => {
    const rolePath = UserSchema.path('role') as unknown as {
      options: { default?: unknown };
    };

    expect(rolePath.options.default).toBe('user');
  });

  it('restricts the role enum to user | admin', () => {
    const rolePath = UserSchema.path('role') as unknown as {
      options: { enum?: unknown[] };
    };

    expect(rolePath.options.enum).toEqual(['user', 'admin']);
  });

  it('defaults a missing role to "user" in the public response', () => {
    expect(
      toUserResponse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      }).role,
    ).toBe('user');
  });

  it('passes an explicit role through the public response', () => {
    expect(
      toUserResponse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        role: 'admin',
      }).role,
    ).toBe('admin');
  });
});
