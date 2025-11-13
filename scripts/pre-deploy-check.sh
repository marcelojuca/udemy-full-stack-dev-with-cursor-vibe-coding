#!/bin/bash
# Pre-deployment validation script
# Ensures all best practices are followed before deployment
# Usage: ./scripts/pre-deploy-check.sh [environment]
# Environment: dev (default) or production

set -e  # Exit on any error

ENVIRONMENT=${1:-dev}
ENV_FILE=".env.local"

if [ "$ENVIRONMENT" = "production" ]; then
  ENV_FILE=".env.production.local"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Pre-Deployment Checklist for $ENVIRONMENT environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Code Formatting
echo "📋 Step 1/7: Checking code formatting..."
if ! npm run format:check > /dev/null 2>&1; then
  echo "❌ Format check failed. Run 'npm run format' to fix."
  exit 1
fi
echo "✅ Code formatting is correct"

# Step 2: Linting
echo ""
echo "📋 Step 2/7: Checking code quality (ESLint)..."
if ! npm run lint > /dev/null 2>&1; then
  echo "❌ Lint check failed. Run 'npm run lint:fix' to fix."
  exit 1
fi
echo "✅ Code quality checks passed"

# Step 3: Type Checking
echo ""
echo "📋 Step 3/7: Type checking (TypeScript)..."
if ! npm run type-check > /dev/null 2>&1; then
  echo "❌ Type check failed. Fix TypeScript errors."
  exit 1
fi
echo "✅ Type checking passed"

# Step 4: Tests
echo ""
echo "📋 Step 4/7: Running tests..."
if ! npm run test:coverage > /dev/null 2>&1; then
  echo "❌ Tests failed. Fix test failures."
  exit 1
fi
echo "✅ All tests passed"

# Step 5: Build Check
echo ""
echo "📋 Step 5/7: Building for production..."
if ! npm run build > /dev/null 2>&1; then
  echo "❌ Build failed. Fix build errors."
  exit 1
fi
echo "✅ Production build successful"

# Step 6: Environment Validation
echo ""
echo "📋 Step 6/7: Validating environment variables..."
if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  Warning: $ENV_FILE not found. Skipping environment validation."
  echo "   For production, ensure all required env vars are set in GitHub Secrets."
else
  if ENV_FILE="$ENV_FILE" node validate-env.js > /dev/null 2>&1; then
    echo "✅ Environment variables validated"
  else
    echo "❌ Environment validation failed. Check $ENV_FILE"
    echo "   Run: ENV_FILE=$ENV_FILE node validate-env.js"
    exit 1
  fi
fi

# Step 7: Database Schema Check (if applicable)
echo ""
echo "📋 Step 7/7: Checking database schema files..."
if [ -f "setup-production-db.js" ] && [ -f "setup-database.js" ]; then
  echo "✅ Database schema files present"
  echo "   ⚠️  Remember: Schema changes must be updated in both files"
else
  echo "⚠️  Warning: Database schema files not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pre-deployment checks passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Next steps:"
echo "   1. Review CLAUDE.md → Deployment & CI/CD section"
echo "   2. Ensure GitHub Secrets are configured (for production)"
echo "   3. Create/update Pull Request"
echo "   4. Wait for GitHub Actions to pass"
echo "   5. Merge to staging/main branch"
echo ""
