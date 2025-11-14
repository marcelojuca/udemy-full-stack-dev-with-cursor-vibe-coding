# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Next.js 15 full-stack application** (Xpto - GitHub Analyzer) that analyzes GitHub repositories and provides insights, summaries, star tracking, and cool facts. It combines frontend UI with backend AI integration using LangChain and OpenAI.

## Common Commands

### Development

- **Start dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build for production**: `npm run build`
- **Run production build locally**: `npm start`
- **Lint code**: `eslint` (configured in eslint.config.mjs)

### Database

- **Setup development database**: `node setup-database.js` (initializes Supabase tables locally)
- **Setup production database**: Automated via GitHub Actions on merge to `main` (see Deployment section)
- **Validate environment**: `node validate-env.js` (checks all services are configured)

## Architecture & Key Systems

### 1. Authentication (NextAuth + Supabase)

- **Location**: `src/lib/auth.js`, `src/app/api/auth/[...nextauth]/route.js`, `src/contexts/auth-context.tsx`
- **Key Features**:
  - Google OAuth login via NextAuth v4
  - Supabase adapter for session persistence
  - Session stored in Supabase `auth` table
  - AuthContext provides `isAuthenticated`, `user`, `loading` state to entire app
- **Auth flow**: Login → NextAuth session → AuthContext → Protected pages check auth state
- **Protected pages**: `/dashboards` and `/protected` require authentication

### 2. API Keys Management

- **Location**: `src/lib/api-keys-service.js`, `src/lib/api-keys-store-supabase.js`
- **Database**: Supabase table `user_api_keys` (id, user_id, key_name, api_key, created_at)
- **Endpoints**:
  - `POST /api/api-keys` - Create API key
  - `DELETE /api/api-keys/[id]` - Delete API key
  - `POST /api/validate-key` - Validate OpenAI/GitHub API keys
- **Frontend**: `src/components/api-key-modal.tsx` and `src/components/api-key-table.tsx` manage keys with modal dialog
- **Security**: API keys are hashed before storage; user_id tied to each key

### 3. GitHub Analysis (LangChain + OpenAI)

- **Location**: `src/lib/chain.js`, `src/app/api/github-summarizer/route.js`
- **Flow**:
  1. User provides GitHub repo URL
  2. `get-repo-info.js` fetches README and metadata from GitHub API
  3. `chain.js` uses ChatOpenAI with structured output (Zod schema) to analyze README
  4. Returns summary and cool facts
- **LangChain Setup**: Uses ChatPromptTemplate + ChatOpenAI with `withStructuredOutput()` for strict schema enforcement
- **Model**: gpt-4-1-nano (cost-effective for analysis)

### 4. Stripe Payment Integration

- **Location**: `src/app/api/stripe/billing-portal/route.ts`, `src/components/plan-card.tsx`
- **Key Features**:
  - Stripe pricing table embedded in pricing section
  - Billing portal for subscription management (upgrade/downgrade)
  - Secure customer portal hosted by Stripe
  - Seamless subscription management without building custom UI
- **Pricing Table**: Displays Free, Basic ($19), and Pro ($35) plans
- **Manage Plan Button**: Redirects authenticated users to Stripe billing portal
- **Payment Processing**: All handled securely by Stripe

### 5. Rate Limiting

- **Location**: `src/lib/rate-limiting.js`
- **Prevents API abuse** by limiting requests per user/IP

### 6. UI Framework

- **Next.js App Router** with TypeScript support
- **Shadcn/ui components** (from `@radix-ui/*`) for consistent, accessible UI
- **Tailwind CSS 4** for styling (configured in `tailwind.config.js` via `@tailwindcss/postcss`)
- **Custom theme** with CSS variables defined in `src/app/globals.css`
- **Toast notifications**: Sonner library with custom `useToast` hook
- **Responsive layout**: Sidebar + main content area pattern

### 6. Providers & Context

- **Location**: `src/app/providers.tsx`
- **Wraps entire app with**:
  - NextAuth SessionProvider (handles auth state)
  - Custom AuthProvider (manages app-level auth context)
- **Next Themes**: Supports dark mode toggle (configured in providers)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (NextAuth, GitHub analyzer, API keys)
│   ├── auth/                     # Auth pages (signin, error)
│   ├── dashboards/               # Protected user dashboard
│   ├── playground/               # Demo/testing page
│   ├── layout.tsx                # Root layout with metadata
│   ├── providers.tsx             # SessionProvider & AuthProvider setup
│   └── globals.css               # Global Tailwind + CSS variables
├── components/
│   ├── ui/                       # Shadcn components (button, card, toast, etc.)
│   ├── api-key-*.tsx             # API key management UI
│   ├── dashboard-wrapper.tsx     # Protected dashboard wrapper
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── hero-section.tsx          # Landing page sections
│   └── ...other feature sections
├── contexts/
│   └── auth-context.tsx          # App-level auth state
├── hooks/
│   ├── use-api-keys.ts           # API key CRUD operations
│   ├── use-form-data.ts          # Form state management
│   ├── use-modal-state.ts        # Modal dialog state
│   ├── use-sidebar.ts            # Sidebar navigation state
│   └── use-toast.ts              # Toast notifications
├── lib/
│   ├── auth.js                   # NextAuth configuration
│   ├── chain.js                  # LangChain + OpenAI integration
│   ├── supabase.js               # Supabase client
│   ├── get-repo-info.js          # GitHub API wrapper
│   ├── api-keys-*.js             # API key service layer
│   ├── rate-limiting.js          # Request throttling
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript type definitions
└── utils/
    ├── validation.ts             # Form validation schemas (Zod)
    └── clipboard.ts              # Clipboard utilities
```

## Code Implementation Guidelines (from .cursorrules)

- **Early returns** for cleaner code
- **Tailwind-only styling** - no inline CSS or style tags
- **Event handlers** prefixed with "handle" (e.g., `handleClick`, `handleSubmit`)
- **Accessibility first** - include aria-labels, tabindex, and keyboard event handlers
- **Arrow functions with types** - `const myFunc = (): void => {}`
- **DRY principle** - avoid repetition
- **Readability over performance** optimization

### JSX & HTML Best Practices

- **Escape special characters in JSX text content** - ESLint rule: `react/no-unescaped-entities`
  - Double quotes: Use `&quot;` instead of `"`
  - Single quotes/apostrophes: Use `&apos;` instead of `'`
  - Example: `Xpto (&quot;we&quot;, &quot;us&quot;)` not `Xpto ("we", "us")`
  - This prevents ESLint errors during build and ensures proper HTML rendering
  - Common in legal pages (Terms of Service, Privacy Policy) with quotations

## Key Dependencies

- **Next.js 15.5** - App Router, server/client components
- **NextAuth 4.24** - Authentication with Supabase adapter
- **Supabase 2.56** - Database and user management
- **LangChain 0.3.32** - AI chain orchestration
- **OpenAI API** - Language model (via `@langchain/openai`)
- **React Hook Form 7.62** - Form handling
- **Zod 4.1** - Runtime validation and type-safe schemas
- **Shadcn/ui (Radix UI)** - Component library
- **Tailwind CSS 4** - Styling

## Environment Setup & Validation

### Required Environment Variables

Create `.env.local` (for development) with these variables:

```bash
# Supabase - Development
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe (for payment processing)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Validate Environment Setup

Before running the app, validate all services are configured:

```bash
node validate-env.js
```

This script checks:

- ✅ All required environment variables are set
- ✅ Supabase connection works
- ✅ Google OAuth credentials are valid
- ✅ OpenAI API key is accessible
- ✅ NextAuth configuration is correct

**Output example:**

```
✨ All validations passed! Your environment is ready.
You can now run: npm run dev
```

### Environment Variable Sources

| Variable                             | Where to Find                                                          |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase Dashboard → Project Settings → API → Project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Supabase Dashboard → Project Settings → API → Anon Key                 |
| `SUPABASE_SERVICE_ROLE_KEY`          | Supabase Dashboard → Project Settings → API → Service Role Key         |
| `NEXTAUTH_SECRET`                    | Generate: `openssl rand -base64 32`                                    |
| `NEXTAUTH_URL`                       | `http://localhost:3000` (dev) or your deployment URL (prod)            |
| `GOOGLE_CLIENT_ID`                   | Google Cloud Console → Credentials → OAuth 2.0 Client ID               |
| `GOOGLE_CLIENT_SECRET`               | Google Cloud Console → Credentials → OAuth 2.0 Client Secret           |
| `OPENAI_API_KEY`                     | OpenAI Dashboard → API Keys → Create new key                           |
| `STRIPE_SECRET_KEY`                  | Stripe Dashboard → Developers → API Keys → Secret Key (test/live)      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys → Publishable Key (test/live) |

### Setup Checklist

Before starting development:

- [ ] Create `.env.local` file with all variables
- [ ] Run `node validate-env.js` to verify setup
- [ ] Run `node setup-database.js` to initialize Supabase tables
- [ ] Run `npm run dev` to start the development server
- [ ] Test Google login at http://localhost:3000/auth/signin
- [ ] Test GitHub analyzer on the dashboard

---

## Important Notes

- **TypeScript strict mode is OFF** (`tsconfig.json`: `"strict": false`) - be mindful of type safety
- **ESLint checking is enabled** during build - fix linting errors before deployment
- **Environment variables**: Uses `.env.local` (dev) and `.env.production.local` (prod)
- **Secrets are gitignored**: `.env*` files are in `.gitignore` - never commit them
- **Remote image support** for Google OAuth profile pictures (configured in `next.config.mjs`)
- **Logging is reduced** in development to avoid verbose Next.js fetch logs
- **Path alias**: `@/*` maps to `./src/*` for clean imports

## Database Setup & Synchronization

### Initial Setup (Development)

1. Create `.env.local` with development Supabase credentials
2. Run: `node setup-database.js`
3. Tables created automatically in development database

### Syncing Schema to Production

This project uses **separate Supabase projects** for development and production:

**Development**: `.env.local` → Dev Supabase project
**Production**: `.env.production.local` → Production Supabase project

#### To sync production DB schema:

1. Ensure `.env.production.local` has correct production credentials
2. Run: `node setup-production-db.js`
3. The script outputs SQL statements ready to execute
4. Go to your production Supabase SQL Editor: https://app.supabase.com/project/[your-project-id]/sql/new
5. Copy and paste each SQL statement in order (tables before indexes)
6. Execute to create schema

#### Database Schema

The application uses these tables:

| Table                 | Purpose                         | Key Fields                         |
| --------------------- | ------------------------------- | ---------------------------------- |
| `users`               | User accounts (NextAuth)        | id, email, name, image             |
| `accounts`            | OAuth provider data (NextAuth)  | user_id, provider, access_token    |
| `sessions`            | User sessions (NextAuth)        | user_id, session_token, expires    |
| `verification_tokens` | Email verification (NextAuth)   | token, expires                     |
| `api_keys`            | User API keys for GitHub/OpenAI | user_id, key, name, usage tracking |

All tables include `created_at` and `updated_at` timestamps.
Foreign keys are set to CASCADE DELETE on user deletion.

#### Future Schema Changes

When adding new tables or columns:

1. **Update `setup-database.js`** with the new schema
2. Run `node setup-database.js` locally to test
3. **Update `setup-production-db.js`** with the same schema
4. Manually execute the SQL in production via Supabase SQL Editor
5. Commit both files to document the schema change

## Production Environment Setup

### Production Environment Variables

Create `.env.production.local` with all production credentials:

```bash
# Supabase - Production
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# NextAuth Configuration (PRODUCTION)
NEXTAUTH_SECRET=generate-secure-secret-with-openssl
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth (Same credentials as dev, but with production redirect URI)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

### Generate NEXTAUTH_SECRET

```bash
# Run this command and copy the output to .env.production.local
openssl rand -base64 32
```

### Validate Production Environment

Before deploying, validate all production services:

```bash
ENV_FILE=.env.production.local node validate-env.js
```

Expected output:

```
✨ All validations passed! Your environment is ready.
```

### Production Deployment Checklist

**Before merging to main:**

- [ ] `.env.production.local` has all 8 required variables
- [ ] `NEXTAUTH_SECRET` is 32+ characters
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Run validation: `ENV_FILE=.env.production.local node validate-env.js`
- [ ] All Supabase credentials are for production project
- [ ] Google OAuth redirect URI added to Google Cloud Console

**In Google Cloud Console:**

1. Go to https://console.cloud.google.com/
2. Select your OAuth app project
3. Navigate to **Credentials → OAuth 2.0 Client IDs**
4. Click your app's client ID
5. Add authorized redirect URI:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. Save changes

**After merging to main:**

- [ ] GitHub Actions workflow runs automatically
- [ ] Database schema created in production
- [ ] Application deployed successfully
- [ ] Test production login at https://yourdomain.com/auth/signin
- [ ] Verify GitHub analyzer works with production data

### Services Status

| Service      | Development   | Production     | Notes                                |
| ------------ | ------------- | -------------- | ------------------------------------ |
| Supabase     | ✅ Configured | ⚠️ Needs setup | Separate projects (safer)            |
| Google OAuth | ✅ Configured | ✅ Configured  | Need redirect URI in Cloud Console   |
| OpenAI       | ✅ Working    | ✅ Working     | Same key in both environments        |
| NextAuth     | ✅ Configured | ❌ Missing     | Add NEXTAUTH_SECRET and NEXTAUTH_URL |

---

## Deployment & CI/CD

### GitHub Actions Workflow

This project uses **GitHub Actions** to automatically deploy database schema changes to production with **branch protection** to prevent broken deployments.

#### Workflow: `validate-and-deploy-db.yml`

**Location**: `.github/workflows/validate-and-deploy-db.yml`

**Trigger**: Automatically runs on every push to `main` branch

**What it does**:

1. Checks out the code
2. Sets up Node.js environment
3. Installs dependencies
4. **Validates** all production environment variables
5. Executes `setup-production-db.js` with production credentials
6. Creates/verifies all database tables and indexes in production
7. **Fails explicitly** if any schema issues occur (blocks Vercel deployment)

**Safety Features**:

- ✅ Validates environment before deployment
- ✅ Fails fast on Supabase connection errors
- ✅ Prevents app deployment if database setup fails
- ✅ Works with GitHub branch protection rules
- ✅ Clear error messages guide troubleshooting

#### Setup Required (One-time)

**Step 1: Add GitHub Secrets**

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret** and add these secrets:

| Secret Name                      | Value                                | Source                  |
| -------------------------------- | ------------------------------------ | ----------------------- |
| `PROD_SUPABASE_URL`              | Production Supabase project URL      | `.env.production.local` |
| `PROD_SUPABASE_ANON_KEY`         | Production Supabase anon key         | `.env.production.local` |
| `PROD_SUPABASE_SERVICE_ROLE_KEY` | Production Supabase service role key | `.env.production.local` |
| `PROD_NEXTAUTH_SECRET`           | Production NextAuth secret           | `.env.production.local` |
| `PROD_NEXTAUTH_URL`              | Production NextAuth URL              | `.env.production.local` |
| `PROD_GOOGLE_CLIENT_ID`          | Google OAuth client ID               | `.env.production.local` |
| `PROD_GOOGLE_CLIENT_SECRET`      | Google OAuth client secret           | `.env.production.local` |
| `PROD_OPENAI_API_KEY`            | OpenAI API key                       | `.env.production.local` |

**Step 2: Configure GitHub Branch Protection** ⚠️ CRITICAL

This ensures GA failure **blocks** Vercel deployment:

1. Go to **Settings → Branches**
2. Click **Add rule** (or edit existing `main`/`staging` branch rule)
3. Enter branch name pattern: `main` or `staging`
4. Enable these options:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1 (or your preference)
     - Dismiss stale pull request approvals
   - ✅ **Require status checks to pass before merging**
     - Search for: `Validate Database Schema` (the validation job name)
     - Also require: `Quality Assurance Checks`
     - Select them from the dropdown
   - ✅ **Require branches to be up to date before merging**
5. Click **Create** or **Save changes**

**Result**:

- ✅ QA checks must pass before merge button appears
- ✅ DB validation must pass before merge button appears
- ✅ If any check fails, merge is **BLOCKED**
- ✅ Vercel only deploys after merge succeeds
- ✅ Database schema guaranteed to be ready

#### Workflow in Action (Sequential Validation)

**Safe Deployment Flow with Sequential Validation:**

```
1. Developer creates feature branch
   └─ Updates database schema (if needed)
   └─ Updates both setup-database.js and setup-production-db.js
   └─ Tests locally: node setup-database.js

2. Creates Pull Request
   └─ Code review happens
   └─ Sequential validation runs:
       ├─ Step 1: QA Checks (Format, Lint, Types, Tests) → ✅ Success
       └─ Step 2: DB Validation (Env vars, Schema files) → ✅ Success

3. Developer tries to merge to staging/main
   ├─ Branch protection rule triggers
   └─ Required checks status checked:
       ├─ If QA FAILED ❌ → Merge button DISABLED ✅
       ├─ If DB Validation FAILED ❌ → Merge button DISABLED ✅
       └─ If BOTH PASSED ✅ → Merge button ENABLED ✅

4. If checks passed, PR approved and merged
   └─ Merge triggers push event to target branch
   └─ Sequential deployment runs:
       ├─ Step 1: DB Deployment (Actual database update) → ✅ Success
       └─ Step 2: Code Deployment (Vercel) → ✅ Success

5. If any validation failed
   ├─ Cannot merge (blocked) ✅
   ├─ Vercel does NOT deploy ✅
   └─ Production/staging stays safe ✅
```

**Safety Guarantees:**

- ❌ Cannot have broken database in production/staging
- ✅ Must have QA checks passing before merge allowed
- ✅ Must have DB validation passing before merge allowed
- ✅ Database schema validated before merge, deployed after merge
- ✅ Vercel deployment only after DB deployment succeeds
- ✅ Sequential flow: QA → DB Validation → Approval → DB Deploy → Code Deploy

#### Idempotent Operations

The workflow is safe to run repeatedly because:

- All `CREATE TABLE` statements use `IF NOT EXISTS`
- All `CREATE INDEX` statements use `IF NOT EXISTS`
- All `ALTER TABLE ADD COLUMN` statements use `IF NOT EXISTS`
- **Result**: Running it 100 times = running it once ✅

#### Manual Execution (if needed)

To manually run the database setup against production:

```bash
# Local execution (for testing/debugging only)
node setup-production-db.js
```

**Warning**: This connects directly to production database. Use with caution.

#### Troubleshooting GitHub Actions Failures

**If validation checks fail and block your merge:**

1. **Check the error logs**
   - Go to your PR → Click "Checks" tab
   - Check which job failed:
     - `Quality Assurance Checks` → Fix code quality issues
     - `Validate Database Schema` → Fix database validation issues
   - Read the error output in the failed job

2. **Common issues**

   **QA Checks Failures:**
   - ❌ Formatting errors → Run `npm run format`
   - ❌ Linting errors → Run `npm run lint:fix`
   - ❌ Type errors → Fix TypeScript issues
   - ❌ Test failures → Fix failing tests

   **DB Validation Failures:**
   - ❌ Missing environment variables
     - Verify secrets exist in GitHub (e.g., `STAGING_SUPABASE_*` for staging PRs)
     - Test locally: `ENV_FILE=.env.staging.local node validate-env.js`
   - ❌ Missing schema files
     - Ensure `setup-production-db.js` exists
     - Ensure SQL syntax is valid
   - ❌ Supabase connection failed
     - Verify Supabase secrets in GitHub
     - Check network connectivity

   **DB Deployment Failures (after merge):**
   - ❌ Table already exists error
     - This is OK! Idempotent operations handle this
     - But if it's blocking, check database schema manually
   - ❌ Timeout connecting to Supabase
     - Check network connectivity
     - Verify Supabase project is active
     - Retry the job

3. **Fix and retry**
   - Fix the issue in code or GitHub Secrets
   - Commit and push again
   - Validation runs automatically on PR
   - Once all checks pass, merge is enabled

4. **Get help**
   - Check CLAUDE.md sections: Environment Setup, Database Setup
   - Review GitHub Actions logs for detailed errors
   - Run validation locally: `ENV_FILE=.env.staging.local node validate-env.js`

### Best Practices for Schema Changes

When making database schema changes:

1. **Develop locally first**
   - Update `setup-database.js` with new schema
   - Run `node setup-database.js` to test locally
   - Verify changes work with your code

2. **Create feature branch**
   - Branch name: `feature/add-new-table` or `feature/db-migration`
   - Commit both `setup-database.js` AND `setup-production-db.js` changes

3. **Create Pull Request**
   - Document what schema changed and why
   - Highlight any breaking changes
   - Request review from team

4. **Merge to main**
   - GitHub Actions automatically deploys to production
   - Check workflow logs to verify success
   - Monitor application for any issues

5. **After merge**
   - Database schema is automatically applied to production
   - No manual SQL editor steps required
   - Deployment is tracked in git history

---

## Pre-Deployment Quality Assurance System

This project implements a **multi-layer QA system** that ensures code quality before commits, pushes, and deployments. This system protects the codebase from formatting issues, linting errors, type errors, and broken tests.

### Protection Layers

The QA system consists of four protection layers:

1. **Pre-Commit Hook** - Formats and lints staged files before commit
2. **Pre-Push Hook** - Runs full QA checks before pushing to remote
3. **GitHub Actions** - CI/CD validation on PRs and pushes
4. **Manual Check** - Comprehensive pre-deployment validation script

### Layer 1: Pre-Commit Hook (via Husky + lint-staged)

**Location**: `.husky/pre-commit`

**When it runs**: Automatically before every `git commit`

**What it does**:

- Formats staged files with Prettier (`.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.md`, `.css`)
- Lints staged files with ESLint (`.js`, `.jsx`, `.ts`, `.tsx`)
- Auto-fixes formatting and linting issues when possible

**Configuration**: `.lintstagedrc.js`

**Execution time**: < 10 seconds (only processes staged files)

**How it works**:

1. You stage files: `git add file1.ts file2.tsx`
2. You commit: `git commit -m "your message"`
3. Pre-commit hook runs automatically
4. Files are formatted and linted
5. If fixes are applied, files are re-staged
6. Commit proceeds with clean code

**Bypass**: `git commit --no-verify` (NOT recommended - defeats QA purpose)

**For AI agents**: Always let the hook run. Never bypass it.

### Layer 2: Pre-Push Hook (via Husky)

**Location**: `.husky/pre-push`

**When it runs**: Automatically before every `git push` to remote repository

**What it does**:

1. Format check - Verifies all files are properly formatted
2. Lint check - Verifies code quality and style
3. Type check - Verifies TypeScript types are correct
4. Tests - Runs the test suite to ensure nothing is broken

**Runs on**: ALL branches (main, staging, develop, feature branches)

**Execution time**: 1-3 minutes

**How it works**:

1. You push: `git push origin branch-name`
2. Pre-push hook runs automatically
3. All QA checks execute
4. If all checks pass, push proceeds
5. If any check fails, push is blocked

**Bypass**: `git push --no-verify` (NOT recommended - defeats QA purpose)

**For AI agents**: Always let the hook run. Never bypass it.

### Layer 3: GitHub Actions (CI/CD)

**Location**: `.github/workflows/qa.yml`

**When it runs**: On pull requests and pushes to `main`, `staging`, `develop` branches

**What it does**:

- Format check
- Lint check
- Type check
- Tests with coverage
- Build verification

**Execution time**: 2-5 minutes

**Bypass**: Cannot be bypassed (runs on remote repository)

### Layer 4: Manual Pre-Deployment Check

**Location**: `scripts/pre-deploy-check.sh`

**When to run**: Before deploying to production

**Command**: `npm run pre-deploy-check` or `bash scripts/pre-deploy-check.sh`

**What it validates**:

1. Code formatting
2. Code quality (linting)
3. Type checking
4. Tests
5. Production build
6. Environment variables
7. Database schema files

**Usage**:

```bash
# For development environment
npm run pre-deploy-check

# For production environment
bash scripts/pre-deploy-check.sh production
```

### Git Hooks Setup

This project uses **Husky** (v9+) to manage Git hooks.

**Installation**: Automatically runs via `npm install` (via `prepare` script in package.json)

**Dependencies**:

- `husky` - Git hooks manager
- `lint-staged` - Run linters on staged files only

**Hook files**:

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script

### lint-staged Configuration

**Location**: `.lintstagedrc.js`

**Purpose**: Efficiently format and lint only staged files (not entire codebase)

**Configuration**:

- Formats: `*.{js,jsx,ts,tsx,json,md,css}` with Prettier
- Lints: `*.{js,jsx,ts,tsx}` with ESLint

**Why it's fast**: Only processes files you're actually committing

### QA Commands Reference

#### Quick Checks (via justfile)

- `just qa` - Run all QA checks (format, lint, type-check, tests)
- `just format` - Format all files
- `just lintfix` - Fix linting issues
- `just type-check` - Check TypeScript types
- `just test` - Run tests

#### Comprehensive Checks

- `just pre-deploy` - Full pre-deployment check (includes build)
- `npm run pre-deploy-check` - Interactive pre-deployment validation

#### Individual Checks (via npm)

- `npm run format` - Format all files
- `npm run format:check` - Check formatting without fixing
- `npm run lint` - Check linting without fixing
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

### Workflow for Developers

#### Normal Development Flow

1. **Make changes** to code
2. **Test locally**: `npm run dev`
3. **Run QA checks**: `just qa` (optional, hooks will catch issues)
4. **Stage files**: `git add file1.ts file2.tsx`
5. **Commit**: `git commit -m "descriptive message"`
   - Pre-commit hook runs automatically
   - Files are formatted/linted
   - Commit proceeds with clean code
6. **Push**: `git push origin branch-name`
   - Pre-push hook runs automatically
   - Full QA checks execute
   - Push proceeds if all checks pass
7. **Create PR**: GitHub Actions validates again
8. **Deploy**: After all checks pass

#### If Pre-Commit Hook Fails

**Issue**: Formatting or linting errors

**Solution**:

```bash
npm run format        # Format all files
npm run lint:fix      # Fix linting issues
git add .             # Re-stage fixed files
git commit -m "your message"  # Commit again
```

#### If Pre-Push Hook Fails

**Issue**: Format, lint, type, or test failures

**Solution**:

```bash
just qa               # Run all checks locally
# Fix any issues shown
git add .
git commit -m "fix: resolve QA issues"
git push origin branch-name
```

### Workflow for AI Agents

**CRITICAL**: AI agents must follow these guidelines:

1. **Never bypass hooks**: Do NOT use `--no-verify` flags
2. **Let hooks run**: Always allow pre-commit and pre-push hooks to execute
3. **Fix issues**: If hooks fail, fix the issues before proceeding
4. **Review auto-fixes**: After hooks run, review any auto-fixes
5. **Run checks locally**: Use `just qa` before pushing to catch issues early

**Before Committing**:

- Stage files intentionally
- Let pre-commit hook run (it will auto-fix formatting/linting)
- Review auto-fixes if files were modified
- Commit completes with clean code

**Before Pushing**:

- Run `just qa` locally first (optional but recommended)
- Push normally: `git push origin branch-name`
- Let pre-push hook run (validates everything)
- If hook fails, fix issues and push again
- Never bypass with `--no-verify`

**Before Deploying**:

- Run `npm run pre-deploy-check` for comprehensive validation
- Verify all checks pass
- Create/update Pull Request
- Wait for GitHub Actions to pass
- Merge to staging/main

### Emergency Situations

In rare emergency situations, hooks can be bypassed:

- **Pre-commit**: `git commit --no-verify -m "message"`
- **Pre-push**: `git push --no-verify origin branch`

**However**:

- AI agents should NEVER bypass hooks
- Only human developers should do this in true emergencies
- Issues must be fixed immediately after bypassing

### Integration with Justfile

The project uses `just` (a command runner) for QA workflows. See `justfile` for all available commands:

- `just qa` - Run all QA checks
- `just pre-deploy` - Full pre-deployment check
- `just format` - Format code
- `just lintfix` - Fix linting
- `just type-check` - Type checking
- `just test` - Run tests

Run `just help` or `just --list` to see all commands.

### Cursor Rules for AI Agents

AI agents should refer to these Cursor rules files:

- `.cursor/rules/pre-commit.mdc` - Pre-commit hook guidelines
- `.cursor/rules/pre-push.mdc` - Pre-push hook guidelines
- `.cursor/rules/qa-workflow.mdc` - General QA workflow guidelines

These files provide detailed guidance for AI agents on how to work with the QA system.

### Troubleshooting

#### Hook Not Running

If hooks aren't running:

1. **Check Husky installation**: Run `npm install` (triggers `prepare` script)
2. **Verify hook files exist**: Check `.husky/pre-commit` and `.husky/pre-push`
3. **Check file permissions**: Hooks should be executable
4. **Verify Git hooks path**: Run `git config core.hooksPath` (should be `.husky`)

#### Hook Failing Unexpectedly

If hooks fail unexpectedly:

1. **Check dependencies**: Ensure `husky` and `lint-staged` are installed
2. **Verify configuration**: Check `.lintstagedrc.js` syntax
3. **Run commands manually**: Test individual commands (`npm run format`, `npm run lint`, etc.)
4. **Check Node version**: Ensure Node.js version matches project requirements

#### Performance Issues

If hooks are slow:

1. **Pre-commit**: Should be fast (< 10s) - only processes staged files
2. **Pre-push**: May take 1-3 minutes - runs full QA checks
3. **If too slow**: Consider running `just qa` locally before pushing

---

## Development Workflow

1. Start dev server: `npm run dev`
2. Make changes to components/pages
3. Test in browser at http://localhost:3000
4. Run QA checks: `just qa` (or hooks will catch issues automatically)
5. Commit changes with clear messages (pre-commit hook runs automatically)
6. Push to trigger pre-push hook and GitHub Actions validation
7. If database schema changed, GitHub Actions deploys to production on merge to main
