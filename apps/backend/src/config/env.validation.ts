/**
 * Validates required environment configuration at bootstrap.
 *
 * JWT_SECRET is the one value that must never have a default: signing and
 * verifying tokens with a hardcoded, publicly-visible secret would let anyone
 * forge valid sessions. Fail fast here, naming the missing variable, instead
 * of letting a silent fallback (or an opaque passport-jwt crash) obscure it.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const jwtSecret = config.JWT_SECRET;

  if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
    throw new Error(
      'JWT_SECRET is required but missing or empty. Set it in apps/backend/.env (or the environment) before starting the app. Refusing to start with a missing or empty JWT secret: a hardcoded fallback would let anyone forge valid tokens.',
    );
  }

  return config;
}
