# Next.js + NestJS Boilerplate

A production-ready full-stack monorepo boilerplate with Next.js, NestJS, MongoDB, and AI agent automation.

## Features

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript, and Tailwind CSS
- **Backend**: NestJS with MongoDB, Mongoose, and TypeScript
- **Testing**: Playwright for E2E testing, Jest for unit tests
- **Automation**: Complete CI/CD pipeline with GitHub Actions
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **AI Agents**: Specialized agent definitions for development workflow
- **Monorepo**: pnpm workspaces for efficient dependency management

## Project Structure

```
.
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/# React components
│   │   │   └── lib/       # Utilities
│   │   ├── public/        # Static assets
│   │   └── package.json
│   │
│   └── backend/           # NestJS application
│       ├── src/
│       │   ├── main.ts    # Entry point
│       │   ├── app.module.ts
│       │   └── ...
│       └── package.json
│
├── tests/
│   └── e2e/               # Playwright E2E tests
│       ├── tests/
│       ├── playwright.config.ts
│       └── package.json
│
├── packages/              # Shared packages (optional)
├── scripts/               # Utility scripts
├── .github/workflows/     # CI/CD workflows
├── AGENTS.md             # AI agent definitions
└── package.json          # Root workspace config
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MongoDB (local or cloud)

## Quick Start

### 1. Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Clone the repository
git clone <your-repo-url>
cd nextjs-nestjs-boilerplate

# Run setup script
./scripts/setup.sh
```

The setup script will:

- Install all dependencies
- Create environment files
- Install Playwright browsers
- Initialize git repository

### 2. Configuration

Update the backend environment variables:

```bash
# Edit apps/backend/.env
MONGODB_URI=mongodb://localhost:27017/your-database
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPPORT_EMAIL=support@example.com
```

### 3. Development

Start both frontend and backend in development mode:

```bash
pnpm dev
```

Or start them individually:

```bash
# Frontend only (http://localhost:3000)
pnpm dev:frontend

# Backend only (http://localhost:3001)
pnpm dev:backend
```

## Available Scripts

### Root Level

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests
pnpm lint             # Lint all code
pnpm format           # Format all code
pnpm format:check     # Check formatting
pnpm typecheck        # Type check all apps
pnpm clean            # Clean all build artifacts
```

### Frontend

```bash
pnpm dev:frontend     # Start Next.js dev server
pnpm build:frontend   # Build for production
```

### Backend

```bash
pnpm dev:backend      # Start NestJS dev server
pnpm build:backend    # Build for production
```

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
cd tests/e2e && pnpm test:ui

# Run E2E tests in headed mode
cd tests/e2e && pnpm test:headed

# Debug E2E tests
cd tests/e2e && pnpm test:debug
```

## AI Agents

This boilerplate includes specialized AI agent definitions to assist with development. See [AGENTS.md](./AGENTS.md) for detailed documentation.

### Available Agents

- **Architect Agent**: System design and architectural decisions
- **Frontend Developer Agent**: React/Next.js development
- **Backend Developer Agent**: NestJS/MongoDB development
- **QA Testing Agent**: Unit and integration testing
- **E2E Testing Agent**: Playwright end-to-end testing
- **Code Review Agent**: Code quality and best practices

### Using Agents

Example prompts:

```
As the frontend developer agent, create a user profile page with editable fields.

As the backend developer agent, implement a CRUD API for managing products.

As the E2E testing agent, write tests for the complete checkout flow.
```

See [AGENTS.md](./AGENTS.md) for complete usage instructions and guidelines.

## CI/CD

GitHub Actions workflows are configured for continuous integration:

### Workflows

- **CI** (`.github/workflows/ci.yml`): Lint, type check, test, and build
- **E2E** (`.github/workflows/e2e.yml`): End-to-end testing
- **PR Checks** (`.github/workflows/pr-check.yml`): Pull request validation

### Workflow Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## Code Quality

### Pre-commit Hooks

Husky and lint-staged run automatically before each commit:

- ESLint checks and fixes
- Prettier formatting
- TypeScript type checking

### Commit Message Format

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

Examples:

```
feat: add user authentication
fix(backend): resolve database connection issue
docs: update README with setup instructions
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Formatting**: Prettier

### Backend

- **Framework**: NestJS
- **Database**: MongoDB
- **ODM**: Mongoose
- **Language**: TypeScript
- **Validation**: class-validator
- **Testing**: Jest

### Testing

- **E2E**: Playwright
- **Unit**: Jest
- **Coverage**: NYC

### DevOps

- **CI/CD**: GitHub Actions
- **Package Manager**: pnpm
- **Git Hooks**: Husky
- **Code Quality**: lint-staged

## Project Scripts

### Setup Script

```bash
./scripts/setup.sh
```

Initializes the project for development.

### Health Check

```bash
./scripts/check-health.sh
```

Verifies that all services are running correctly.

## Deployment

### Frontend (Next.js)

Deploy to Vercel, Netlify, or any platform supporting Next.js:

```bash
# Build for production
pnpm build:frontend

# Start production server
cd apps/frontend && pnpm start
```

### Backend (NestJS)

Deploy to any Node.js hosting platform:

```bash
# Build for production
pnpm build:backend

# Start production server
cd apps/backend && pnpm start:prod
```

### Environment Variables

**Frontend** (`apps/frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

**Backend** (`apps/backend/.env`):

```
MONGODB_URI=mongodb://your-mongodb-uri
PORT=3001
FRONTEND_URL=https://your-frontend-url.com
NODE_ENV=production
```

## Best Practices

### Code Organization

- Keep components small and focused
- Use TypeScript for type safety
- Follow the DRY principle
- Write meaningful commit messages

### Testing

- Write tests for critical functionality
- Aim for >80% code coverage
- Use Page Object Model for E2E tests
- Keep tests independent and isolated

### Performance

- Optimize images (use Next.js Image component)
- Implement code splitting
- Use React Server Components when possible
- Index database queries appropriately

### Security

- Never commit `.env` files
- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Keep dependencies updated

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### MongoDB Connection Issues

- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- Ensure network access if using cloud MongoDB

### Playwright Issues

```bash
# Reinstall browsers
cd tests/e2e
pnpm exec playwright install --with-deps
```

### Clean Install

```bash
# Remove all dependencies and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Commit with conventional commits: `git commit -m "feat: your feature"`
5. Push: `git push origin feature/your-feature`
6. Create a pull request

## License

MIT License - feel free to use this boilerplate for your projects.

## Support

For issues and questions:

- Open an issue on GitHub
- Check [AGENTS.md](./AGENTS.md) for AI agent assistance
- Review the troubleshooting section

## Roadmap

Future enhancements:

- [ ] Docker support
- [ ] GraphQL API option
- [ ] Authentication boilerplate (JWT, OAuth)
- [ ] Admin dashboard
- [ ] API documentation with Swagger
- [ ] Logging and monitoring setup
- [ ] Redis caching
- [ ] WebSocket support

## Acknowledgments

Built with modern web technologies and best practices for rapid full-stack development.

---

Made with ❤️ for developers
