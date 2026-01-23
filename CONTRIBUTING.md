# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Run setup: `./scripts/setup.sh`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Workflow

### 1. Make Your Changes

- Follow the existing code style
- Use TypeScript for type safety
- Write clear, descriptive variable names
- Keep functions small and focused

### 2. Test Your Changes

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Check types
pnpm typecheck

# Lint code
pnpm lint
```

### 3. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

**Examples:**
```bash
git commit -m "feat: add user profile page"
git commit -m "fix(backend): resolve MongoDB connection timeout"
git commit -m "docs: update installation instructions"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature
```

Then create a pull request on GitHub.

## Pull Request Guidelines

### PR Title

Use the same format as commit messages:
```
feat: add user authentication
fix(frontend): resolve button alignment issue
```

### PR Description

Include:
- **What**: What changes were made
- **Why**: Why these changes were necessary
- **How**: How the changes were implemented
- **Testing**: How you tested the changes

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated for changes
- [ ] All tests pass locally
- [ ] TypeScript types are correct (no `any`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] PR title follows conventions
- [ ] No console.log statements
- [ ] No hardcoded values (use env variables)

## Code Style

### TypeScript

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

function createUser(props: UserProps): User {
  return new User(props);
}

// ❌ Bad
function createUser(props: any) {
  return new User(props);
}
```

### React Components

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### NestJS Services

```typescript
// ✅ Good
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}

// ❌ Bad
@Injectable()
export class UsersService {
  async findAll() {
    return this.userModel.find().exec();
  }
}
```

## Testing Guidelines

### Unit Tests

```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('should create a user', async () => {
    const user = await service.create({ name: 'John' });
    expect(user).toBeDefined();
    expect(user.name).toBe('John');
  });
});
```

### E2E Tests

```typescript
test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Using AI Agents

Use specialized agents for development tasks. See [AGENTS.md](./AGENTS.md) for details.

Examples:
```
As the frontend developer agent, create a user settings page.
As the code review agent, review this pull request.
```

## Common Tasks

### Adding a New Feature

1. Use the Architect Agent to design the feature
2. Use Frontend/Backend Developer Agents to implement
3. Use QA Agent to write unit tests
4. Use E2E Agent to write end-to-end tests
5. Use Code Review Agent to review code

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Add additional tests if needed

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Test everything still works
pnpm test && pnpm test:e2e
```

## Project Structure

### Adding a New Frontend Component

```
apps/frontend/src/components/
└── YourComponent/
    ├── YourComponent.tsx
    └── YourComponent.test.tsx
```

### Adding a New Backend Module

```bash
cd apps/backend
nest generate module your-module
nest generate controller your-module
nest generate service your-module
```

### Adding a New E2E Test

```
tests/e2e/tests/
└── your-feature.spec.ts
```

## Documentation

### When to Update Documentation

- Adding new features
- Changing configuration
- Adding new scripts
- Changing project structure
- Adding dependencies with setup requirements

### Where to Document

- `README.md`: Main project documentation
- `AGENTS.md`: AI agent usage
- Code comments: Complex logic only
- JSDoc: Public APIs

## Getting Help

- Check existing issues and PRs
- Ask in discussions
- Use AI agents for guidance
- Read the documentation

## Review Process

1. Automated checks run (CI/CD)
2. Code review by maintainers
3. Address feedback
4. Approval and merge

## Recognition

Contributors will be recognized in:
- Git commit history
- Release notes
- Contributors list

Thank you for contributing! 🎉
