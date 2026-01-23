#!/bin/bash

# Boilerplate Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Next.js + NestJS Boilerplate..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm is installed"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js version 20 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version is compatible ($(node -v))"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment files
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp apps/backend/.env.example apps/backend/.env
    echo "⚠️  Please update apps/backend/.env with your MongoDB connection string"
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
cd tests/e2e
pnpm exec playwright install
cd ../..

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Next.js + NestJS boilerplate"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Update apps/backend/.env with your MongoDB URI"
echo "   2. Run 'pnpm dev' to start development servers"
echo "   3. Frontend will be at http://localhost:3000"
echo "   4. Backend will be at http://localhost:3001"
echo "   5. Run 'pnpm test:e2e' to run E2E tests"
echo ""
echo "📖 See README.md for more information"
echo "🤖 See AGENTS.md for AI agent usage"
