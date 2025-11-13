# Pre-Deployment Quality Assurance

This document describes the automated quality assurance system that ensures code follows best practices before deployment.

## 🎯 Overview

The project now has **multiple layers of quality assurance** that automatically check code before it reaches production:

1. **Git Hooks** (Local) - Catch issues before commit/push
2. **Pre-Deployment Script** (Local) - Comprehensive manual check
3. **GitHub Actions** (CI/CD) - Automated checks on PRs and pushes

## 🔧 Automated Git Hooks

### Pre-Commit Hook (`.husky/pre-commit`)

**Runs automatically on `git commit`**

What it does:

- ✅ Formats staged files with Prettier
- ✅ Lints staged files with ESLint (auto-fixes)
- ✅ Type checks TypeScript files if any are staged
- ⚠️ **Blocks commit if checks fail**

**To bypass** (not recommended):

```bash
git commit --no-verify -m "message"
```

### Pre-Push Hook (`.husky/pre-push`)

**Runs automatically on `git push`** (for feature branches only)

What it does:

- ✅ Format check
- ✅ Lint check
- ✅ Type check
- ✅ Test suite
- ⚠️ **Blocks push if checks fail**
- ℹ️ **Skipped for `main` and `staging`** (CI/CD handles these)

**To bypass** (not recommended):

```bash
git push --no-verify
```

## 📋 Pre-Deployment Check Script

### Usage

```bash
npm run pre-deploy-check
```

### What It Checks

1. ✅ **Code Formatting** - Prettier formatting compliance
2. ✅ **Code Quality** - ESLint rules
3. ✅ **Type Safety** - TypeScript type checking
4. ✅ **Tests** - Test suite with coverage
5. ✅ **Build** - Production build verification
6. ✅ **Environment** - Environment variable validation (if available)
7. ✅ **Git Status** - Warns about uncommitted changes

### Output Example

```
🚀 Pre-Deployment Check
======================

📍 Current branch: staging

🎨 Step 1: Checking code formatting...
✅ Code formatting is correct

🔍 Step 2: Checking code quality...
✅ Code quality checks passed

📝 Step 3: Checking TypeScript types...
✅ Type checking passed

🧪 Step 4: Running tests...
✅ All tests passed

🔨 Step 5: Verifying production build...
✅ Production build successful

✅ All pre-deployment checks passed!
```

## 🚀 Quick Commands

### For Developers

```bash
# Quick QA check (auto-fixes)
just qa
npm run qa

# Full pre-deployment check
just pre-deploy
npm run pre-deploy

# Comprehensive interactive check
npm run pre-deploy-check
```

### For AI Agents

**Before making any changes:**

```bash
npm run pre-deploy-check
```

**After making changes:**

```bash
npm run pre-deploy-check
```

**Only commit/push when all checks pass!**

## 📚 Configuration Files

- **`.husky/pre-commit`** - Pre-commit hook script
- **`.husky/pre-push`** - Pre-push hook script
- **`scripts/pre-deploy-check.sh`** - Pre-deployment check script
- **`package.json`** - Contains `lint-staged` configuration
- **`.cursorrules`** - Guidelines for AI agents
- **`CLAUDE.md`** - Comprehensive documentation

## 🔍 What Gets Checked

### Formatting (Prettier)

- Code style consistency
- Indentation
- Quotes and semicolons
- Line breaks

### Linting (ESLint)

- Code quality issues
- Best practices
- Potential bugs
- React/Next.js specific rules

### Type Checking (TypeScript)

- Type safety
- Missing types
- Type mismatches
- Interface compliance

### Tests (Jest)

- Unit test coverage
- Test failures
- Test suite completeness

### Build (Next.js)

- Production build success
- Static page generation
- API route compilation
- Type errors in build

## ⚙️ Lint-Staged Configuration

Automatically runs on staged files:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## 🎓 Best Practices

1. ✅ **Always run `npm run pre-deploy-check` before deploying**
2. ✅ **Let git hooks catch issues early** (they run automatically)
3. ✅ **Fix issues locally** before pushing to avoid CI/CD failures
4. ✅ **Never skip hooks** unless it's a true emergency
5. ✅ **Review GitHub Actions results** before merging PRs
6. ✅ **Keep code formatted** (Prettier runs automatically on commit)
7. ✅ **Follow TypeScript best practices** (type checking is enforced)

## 🆘 Troubleshooting

### Pre-commit hook fails

```bash
# Fix formatting
npm run format

# Fix linting
npm run lint:fix

# Fix types
npm run type-check

# Then commit again
git add .
git commit -m "your message"
```

### Pre-push hook fails

```bash
# Run full QA check
just qa

# Or comprehensive check
npm run pre-deploy-check

# Fix issues, then push again
git push
```

### GitHub Actions fails

1. Check the error logs in GitHub Actions
2. Run checks locally: `npm run pre-deploy-check`
3. Fix issues
4. Commit and push again

## 📖 Additional Resources

- See `CLAUDE.md` → "Pre-Deployment Best Practices & Quality Assurance"
- See `.cursorrules` for AI agent guidelines
- See `justfile` for all available commands
