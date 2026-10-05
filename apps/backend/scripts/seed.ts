/**
 * Minimal, idempotent seed: one deterministic demo user that e2e specs (and
 * humans) can log in with. Run it with `pnpm seed` from the repo root.
 *
 * Safety: it WRITES to the database, so it refuses to run unless the database
 * name in MONGODB_URI contains "dev", "e2e" or "test".
 *
 * Idempotent: the user is created only if the email does not exist yet
 * (`$setOnInsert`), so re-running never changes or duplicates it.
 */
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { User, UserSchema } from '../src/users/schemas/user.schema';

// Same default as AppModule; it deliberately fails the safety check below, so
// seeding without an explicit MONGODB_URI is refused.
const DEFAULT_URI = 'mongodb://localhost:27017/boilerplate';
const SAFE_DB_NAME = /dev|e2e|test/i;

const DEMO_USER = {
  firstName: 'Demo',
  lastName: 'User',
  email: (process.env.E2E_DEMO_EMAIL || 'demo@example.com').toLowerCase(),
  password: process.env.E2E_DEMO_PASSWORD || 'demo-password-123',
};

function loadDotEnv() {
  // Node >= 20.12. Does not override variables that are already set.
  try {
    (process as any).loadEnvFile?.('.env');
  } catch {
    // No .env file: rely on the process environment.
  }
}

function databaseName(uri: string): string {
  const rest = uri.slice(uri.indexOf('://') + 3);
  const slash = rest.indexOf('/');
  if (slash === -1) return '';
  return rest.slice(slash + 1).split('?')[0];
}

async function main() {
  loadDotEnv();
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  const dbName = databaseName(uri);

  if (!SAFE_DB_NAME.test(dbName)) {
    throw new Error(
      `Refusing to seed database "${dbName}": its name must contain "dev", "e2e" or "test".`,
    );
  }

  await mongoose.connect(uri);
  try {
    const UserModel = mongoose.model(User.name, UserSchema);
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    const result = await UserModel.updateOne(
      { email: DEMO_USER.email },
      {
        $setOnInsert: {
          firstName: DEMO_USER.firstName,
          lastName: DEMO_USER.lastName,
          email: DEMO_USER.email,
          passwordHash,
          role: 'user',
        },
      },
      { upsert: true },
    );
    console.log(
      result.upsertedCount
        ? `Seeded demo user ${DEMO_USER.email} in "${dbName}".`
        : `Demo user ${DEMO_USER.email} already present in "${dbName}"; nothing to do.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
