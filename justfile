# Justfile for QA and development tasks
# Similar to Python project's QA workflow
# Usage: just qa (runs all QA checks)

set shell := ["bash", "-c"]
set dotenv-load := true

# Display all available commands
@default:
    echo "📋 Available commands:"
    just --list

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QA WORKFLOW (Main Command)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Run all QA checks before deployment (equivalent to Python: uv run --extra test)
qa: format lintfix type-check test
    @echo ""
    @echo "✅ All QA checks passed!"
    @echo ""
    @echo "Safe to deploy or push to repository."

# Pre-deployment full check (includes build verification)
pre-deploy: format lint type-check test build
    @echo ""
    @echo "✅ Pre-deployment checks complete!"
    @echo ""
    @echo "Ready for deployment to production."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMATTING (Step 1: Code formatting)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Format code with Prettier (auto-fixes formatting)
@format:
    echo "🎨 Formatting code with Prettier..."
    npm run format
    echo "✅ Code formatted"

# Check code formatting without making changes
@formatcheck:
    echo "🎨 Checking code format..."
    npm run format:check
    echo "✅ Format check passed"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LINTING (Step 2: Code quality & fixes)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Lint code and fix issues (auto-fixes most issues)
@lintfix:
    echo "🔍 Linting and fixing code..."
    npm run lint:fix
    echo "✅ Lint check completed"

# Check lint without fixing
@lint:
    echo "🔍 Checking lint rules..."
    npm run lint
    echo "✅ Lint check passed"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TYPE CHECKING (Step 3: TypeScript validation)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Run TypeScript type checking (no code generation)
@type-check:
    echo "📝 Type checking with TypeScript..."
    npm run type-check
    echo "✅ Type check passed"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TESTING (Step 4: Unit tests)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Run tests with coverage reporting
@test:
    echo "🧪 Running tests with coverage..."
    npm run test:coverage
    echo "✅ Tests passed"

# Run tests in watch mode (for development)
@testwatch:
    echo "🧪 Running tests in watch mode..."
    npm run test:watch

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUILD (Verify production build)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Build for production and verify no errors
@build:
    echo "🔨 Building for production..."
    npm run build
    echo "✅ Build successful"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DEVELOPMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Start development server
@dev:
    echo "🚀 Starting development server..."
    npm run dev

# Start production server (after build)
@start:
    echo "🚀 Starting production server..."
    npm run start

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UTILITIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Install dependencies
@install:
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo "✅ Dependencies installed"

# Clean up build artifacts and cache
@clean:
    echo "🧹 Cleaning up..."
    rm -rf .next
    rm -rf out
    rm -rf coverage
    rm -rf dist
    echo "✅ Cleanup complete"

# Show git status
@status:
    git status

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELP & DOCUMENTATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Show this help message
@help:
    echo ""
    echo "🎯 Just Commands - QA & Development Workflow"
    echo ""
    echo "📋 MAIN COMMANDS:"
    echo "  just qa              Run all QA checks (format → lint → types → test)"
    echo "  just pre-deploy      Full pre-deployment check (includes build)"
    echo ""
    echo "🔧 INDIVIDUAL CHECKS:"
    echo "  just format          Format code with Prettier"
    echo "  just formatcheck     Check formatting without changes"
    echo "  just lint            Check linting rules"
    echo "  just lintfix         Fix linting issues"
    echo "  just type-check      Run TypeScript type checking"
    echo "  just test            Run tests with coverage"
    echo "  just testwatch       Run tests in watch mode"
    echo "  just build           Build for production"
    echo ""
    echo "🚀 DEVELOPMENT:"
    echo "  just dev             Start development server"
    echo "  just start           Start production server"
    echo "  just install         Install dependencies"
    echo "  just clean           Clean build artifacts"
    echo ""
    echo "📚 DOCUMENTATION:"
    echo "  just help            Show this help message"
    echo ""
