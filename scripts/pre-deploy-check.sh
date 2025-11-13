#!/bin/bash

# Pre-Deployment Check Script
# This script ensures all best practices are followed before deployment
# Usage: ./scripts/pre-deploy-check.sh or npm run pre-deploy-check

set -e  # Exit on any error

echo "🚀 Pre-Deployment Check"
echo "======================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
  echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  error "Not in a git repository"
  exit 1
fi

# Check current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $BRANCH"
echo ""

# Step 1: Format check
echo "🎨 Step 1: Checking code formatting..."
if npm run format:check > /dev/null 2>&1; then
  success "Code formatting is correct"
else
  error "Code formatting issues found"
  echo "   Run 'npm run format' to fix"
  exit 1
fi

# Step 2: Lint check
echo ""
echo "🔍 Step 2: Checking code quality..."
if npm run lint > /dev/null 2>&1; then
  success "Code quality checks passed"
else
  error "Linting errors found"
  echo "   Run 'npm run lint:fix' to fix"
  exit 1
fi

# Step 3: Type check
echo ""
echo "📝 Step 3: Checking TypeScript types..."
if npm run type-check > /dev/null 2>&1; then
  success "Type checking passed"
else
  error "TypeScript errors found"
  echo "   Fix TypeScript errors before deploying"
  exit 1
fi

# Step 4: Run tests
echo ""
echo "🧪 Step 4: Running tests..."
if npm run test:coverage > /dev/null 2>&1; then
  success "All tests passed"
else
  error "Tests failed"
  echo "   Fix failing tests before deploying"
  exit 1
fi

# Step 5: Build check
echo ""
echo "🔨 Step 5: Verifying production build..."
if npm run build > /dev/null 2>&1; then
  success "Production build successful"
else
  error "Build failed"
  echo "   Fix build errors before deploying"
  exit 1
fi

# Step 6: Environment validation (if .env files exist)
echo ""
echo "🔐 Step 6: Validating environment setup..."
if [ -f ".env.local" ] || [ -f ".env.production.local" ]; then
  if command -v node > /dev/null 2>&1; then
    if node validate-env.js > /dev/null 2>&1; then
      success "Environment variables validated"
    else
      warning "Environment validation had issues (may be OK if env vars not set locally)"
    fi
  fi
else
  warning "No .env files found (this is OK for CI/CD)"
fi

# Step 7: Check for uncommitted changes
echo ""
echo "📋 Step 7: Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
  success "Working directory is clean"
else
  warning "You have uncommitted changes"
  echo "   Consider committing or stashing before deploying"
fi

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
success "All pre-deployment checks passed!"
echo ""
echo "📦 Ready to deploy to: $BRANCH"
echo ""
echo "Next steps:"
echo "  1. Review your changes: git diff"
echo "  2. Commit if needed: git commit -m 'your message'"
echo "  3. Push to trigger deployment: git push origin $BRANCH"
echo ""

