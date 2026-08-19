import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('accepts a config with a JWT_SECRET set', () => {
    const config = { JWT_SECRET: 'test-secret', PORT: '3001' };

    expect(validateEnv(config)).toEqual(config);
  });

  it('throws naming JWT_SECRET when it is missing', () => {
    expect(() => validateEnv({ PORT: '3001' })).toThrow(/JWT_SECRET/);
  });

  it('throws naming JWT_SECRET when it is empty', () => {
    expect(() => validateEnv({ JWT_SECRET: '', PORT: '3001' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('throws naming JWT_SECRET when it is only whitespace', () => {
    expect(() => validateEnv({ JWT_SECRET: '   ', PORT: '3001' })).toThrow(
      /JWT_SECRET/,
    );
  });
});
