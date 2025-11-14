# Xpto - GitHub Repository Analyzer

> A full-stack Next.js application that analyzes GitHub repositories and provides AI-powered insights, summaries, star tracking, and cool facts.

## Overview

**Xpto** is a comprehensive GitHub analysis platform built with Next.js 15, combining a modern frontend with a powerful backend that integrates LangChain and OpenAI. Users can authenticate via Google OAuth, manage API keys securely, and get instant AI-powered summaries and insights about GitHub repositories.

**Course Context**: This project is part of the [Cursor Course: FullStack Development with Cursor Vibe Coding](https://www.udemy.com/course/cursor-ai-ide/learn/lecture/45609807).

## Features

- **Google OAuth Authentication** - Secure login via Google with session persistence in Supabase
- **GitHub Repository Analysis** - Input any GitHub repo URL and get AI-powered analysis
- **Smart Summaries** - Automatically generate concise summaries from README files
- **Cool Facts** - Discover interesting insights about repositories
- **API Key Management** - Securely store and manage OpenAI and GitHub API keys
- **User Dashboard** - Personalized workspace for authenticated users
- **Dark Mode Support** - Complete dark theme with Next Themes
- **Rate Limiting** - Built-in protection against API abuse
- **Responsive Design** - Mobile-first UI with Shadcn/ui components
- **Production-Ready Deployment** - Automated CI/CD with GitHub Actions

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS 4** - Utility-first CSS framework with PostCSS
- **Shadcn/ui + Radix UI** - High-quality, accessible component library
- **React Hook Form** - Efficient form state management
- **Sonner** - Toast notifications
- **Next Themes** - Dark mode support

### Backend & Services

- **NextAuth 4** - Authentication with Supabase adapter
- **Supabase** - PostgreSQL database and session management
- **LangChain 0.3** - AI chain orchestration
- **OpenAI API** - GPT models for analysis (gpt-4-mini)
- **GitHub API** - Repository metadata and README retrieval

### Infrastructure

- **Vercel** - Production deployment
- **GitHub Actions** - CI/CD and automatic database schema deployment
- **Zod** - Runtime validation and type-safe schemas
- **ESLint** - Code quality enforcement

## Prerequisites

Before getting started, ensure you have:

- **Node.js 18.x or 20.x LTS** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **GitHub account** with a personal access token (for API access)
- **Google Cloud Console project** with OAuth 2.0 credentials
- **OpenAI API key** from the OpenAI Platform
- **Supabase account** with a project (free tier available)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dandi
```

### 2. Install Dependencies

```bash
npm install
# If you encounter peer dependency conflicts with zod, use:
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase (Development)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

**Where to find each variable:**

| Variable                        | Source                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Project Settings → API → Project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → Anon Key         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard → Project Settings → API → Service Role Key |
| `NEXTAUTH_SECRET`               | Generate: `openssl rand -base64 32`                            |
| `GOOGLE_CLIENT_ID`              | Google Cloud Console → Credentials → OAuth 2.0 Client ID       |
| `GOOGLE_CLIENT_SECRET`          | Google Cloud Console → Credentials → OAuth 2.0 Client Secret   |
| `OPENAI_API_KEY`                | OpenAI Platform → API Keys → Create new key                    |

### 4. Setup Development Database

Initialize the Supabase database schema:

```bash
node setup-database.js
```

This creates all necessary tables (users, sessions, accounts, api_keys, etc.) in your development Supabase project.

### 5. Validate Environment

Verify all services are properly configured:

```bash
node validate-env.js
```

Expected output:

```
✨ All validations passed! Your environment is ready.
You can now run: npm run dev
```

## Development

### Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Common Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run linter
eslint

# Lint and fix issues
eslint --fix
```

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── api-keys/             # API key management endpoints
│   │   ├── github-summarizer/    # GitHub analysis endpoint
│   │   └── validate-key/         # API key validation endpoint
│   ├── auth/                     # Authentication pages
│   ├── dashboards/               # Protected user dashboard
│   ├── playground/               # Demo/testing page
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Auth & Session providers
│   └── globals.css               # Global styles & CSS variables
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── api-key-modal.tsx         # API key creation UI
│   ├── api-key-table.tsx         # API key management table
│   ├── dashboard-wrapper.tsx     # Protected route wrapper
│   ├── sidebar.tsx               # Navigation sidebar
│   └── ...                       # Feature-specific components
├── contexts/
│   └── auth-context.tsx          # App-level authentication state
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
│   ├── api-keys-service.js       # API key service layer
│   ├── api-keys-store-supabase.js # Database operations for API keys
│   ├── rate-limiting.js          # Request throttling
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript definitions
└── utils/
    ├── validation.ts             # Zod validation schemas
    └── clipboard.ts              # Clipboard utilities
```

## Architecture

### Authentication Flow

```
Google Login → NextAuth → Supabase Adapter → User Session → AuthContext → Protected Pages
```

- **NextAuth 4** handles OAuth authentication
- **Supabase adapter** persists sessions in database
- **AuthContext** provides authentication state app-wide
- Protected routes check `isAuthenticated` and `loading` state

### API Key Management

- Secure storage in Supabase `user_api_keys` table
- API keys are hashed before storage
- Each key is tied to a specific user
- Validation endpoints for GitHub and OpenAI keys
- Modal UI for key creation and management

### GitHub Analysis Pipeline

```
User Input (Repo URL)
  → Fetch Repository Info (GitHub API)
  → Extract README Content
  → LangChain + ChatOpenAI
  → Structured Output (Zod Schema)
  → Summary + Cool Facts
  → Response to User
```

- Uses `gpt-4-mini` for cost-effective analysis
- Structured output ensures consistent, parseable responses
- Rate limiting prevents API abuse

## Database Schema

All tables include `created_at` and `updated_at` timestamps. Foreign keys are set to CASCADE DELETE for referential integrity.

| Table                 | Purpose                        | Key Fields                                      |
| --------------------- | ------------------------------ | ----------------------------------------------- |
| `users`               | User accounts (NextAuth)       | id, email, name, image                          |
| `accounts`            | OAuth provider data (NextAuth) | user_id, provider, access_token                 |
| `sessions`            | User sessions (NextAuth)       | user_id, session_token, expires                 |
| `verification_tokens` | Email verification (NextAuth)  | token, expires                                  |
| `user_api_keys`       | Stored API keys                | user_id, key_name, api_key (hashed), created_at |

## Multi-Environment Setup

This project uses a **three-tier environment strategy** with **single Vercel project** and **single GitHub repository**:

```
Local Development (localhost:3000)
    ↓ Feature branches (no preview)
Staging (dandi.lat)
    ↓ After QA approval
Production (xpto.space)
```

### Git Branch Strategy

| Branch      | Environment | URL                | Auto-Deploy            |
| ----------- | ----------- | ------------------ | ---------------------- |
| `main`      | Production  | https://xpto.space | ✅ Yes (to Production) |
| `staging`   | Staging/QA  | https://dandi.lat  | ✅ Yes (to Preview)    |
| `develop`   | Local Dev   | localhost:3000     | ❌ No                  |
| `feature/*` | Local Dev   | localhost:3000     | ❌ No                  |

### Deployment Workflow

**1. Feature Development**

```bash
git checkout -b feature/xyz
# Make changes, test locally with: npm run dev
git push -u origin feature/xyz
```

- ✅ Test locally only
- ✅ No preview deployment

**2. Code Review & Staging**

```bash
# Create PR: feature/xyz → staging
# Sequential validation runs automatically:
# 1. QA Checks (Format, Lint, Types, Tests) → ✅ Success
# 2. DB Validation (Environment vars, Schema files) → ✅ Success
# After approval, merge to staging
git checkout staging
git merge feature/xyz
git push origin staging
```

- ✅ Sequential deployment runs automatically:
  1. DB Deployment (Database schema updated)
  2. Code Deployment (Vercel auto-deploys to dandi.lat)

**3. Production Promotion**

```bash
# After staging approval
git checkout main
git merge staging
git push origin main
```

- ✅ Sequential deployment runs automatically:
  1. DB Deployment (Database schema updated)
  2. Code Deployment (Vercel auto-deploys to xpto.space)
- ✅ Production is live

### Vercel Configuration

**Location:** Vercel Dashboard → xpto-saas project → Settings → Git

**Recommended Settings:**

- Production Branch: `main`
- Preview Branches: `staging` only
- Deploy Previews: Enabled

### Environment Variables by Tier

Add these to **Vercel → Settings → Environment Variables** with different values per environment:

| Variable                             | Production           | Preview (Staging)   | Development             |
| ------------------------------------ | -------------------- | ------------------- | ----------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | prod-url             | staging-url         | dev-url                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | prod-key             | staging-key         | dev-key                 |
| `SUPABASE_SERVICE_ROLE_KEY`          | prod-role            | staging-role        | dev-role                |
| `NEXTAUTH_SECRET`                    | prod-secret          | staging-secret      | dev-secret              |
| `NEXTAUTH_URL`                       | `https://xpto.space` | `https://dandi.lat` | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID`                   | prod-id              | staging-id          | dev-id                  |
| `GOOGLE_CLIENT_SECRET`               | prod-secret          | staging-secret      | dev-secret              |
| `OPENAI_API_KEY`                     | shared               | shared              | shared                  |
| `STRIPE_SECRET_KEY`                  | live-key             | test-key            | test-key                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | live-pub             | test-pub            | test-pub                |

**Tip:** Each environment uses **separate Supabase projects** for data isolation.

### Google OAuth Setup

Configure redirect URIs in **Google Cloud Console → Credentials → OAuth 2.0 Client IDs:**

- Production: `https://xpto.space/api/auth/callback/google`
- Staging: `https://dandi.lat/api/auth/callback/google`
- Development: `http://localhost:3000/api/auth/callback/google`

---

## Deployment

### Production Environment Variables

Create `.env.production.local` with production credentials:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# NextAuth Configuration (PRODUCTION)
NEXTAUTH_SECRET=generate-secure-secret-with-openssl
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

### GitHub Actions Deployment

The project includes automated CI/CD via GitHub Actions:

**Workflows**:

- `validate-db.yml` - Validates database schema on PRs (before merge)
- `deploy-db.yml` - Deploys database schema after merge (on push)

**Triggers**:

- Validation: Runs on PRs targeting `main` or `staging`
- Deployment: Runs on push to `main` or `staging` branches

**What they do**:

**Validation (PR)**:

1. Validates environment variables
2. Checks database schema files exist
3. Validates SQL syntax
4. Blocks merge if validation fails

**Deployment (Push)**:

1. Validates production/staging environment variables
2. Executes database schema setup on Supabase
3. Blocks Vercel deployment if database setup fails
4. Ensures database is ready before app deployment

**Setup Required** (one-time):

1. Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):
   - `PROD_SUPABASE_URL`
   - `PROD_SUPABASE_ANON_KEY`
   - `PROD_SUPABASE_SERVICE_ROLE_KEY`
   - `PROD_NEXTAUTH_SECRET`
   - `PROD_NEXTAUTH_URL`
   - `PROD_GOOGLE_CLIENT_ID`
   - `PROD_GOOGLE_CLIENT_SECRET`
   - `PROD_OPENAI_API_KEY`

2. Configure branch protection on `main`:
   - Go to Settings → Branches
   - Add rule for `main`
   - Require status check: `Validate Database Schema` (from validate-db.yml workflow)
   - Enable "Require pull request before merging"

### Production Deployment Checklist

Before merging to main:

- [ ] `.env.production.local` has all 8 required variables
- [ ] `NEXTAUTH_SECRET` is 32+ characters
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Run validation: `ENV_FILE=.env.production.local node validate-env.js`
- [ ] All Supabase credentials are for production project
- [ ] GitHub OAuth redirect URI configured in Google Cloud Console

### Deploy on Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Connect your GitHub repository to Vercel
2. Set production environment variables in Vercel project settings
3. Merge to `main` branch - GitHub Actions validates database
4. Vercel automatically deploys after GA succeeds

## Code Guidelines

This project follows these conventions (defined in `.cursorrules`):

- **Early returns** for cleaner, more readable code
- **Tailwind-only styling** - no inline CSS or style tags
- **Event handlers** prefixed with "handle" (e.g., `handleClick`, `handleSubmit`)
- **Accessibility first** - aria-labels, tabindex, keyboard handlers
- **Arrow functions with types** - `const myFunc = (): void => {}`
- **DRY principle** - avoid code repetition
- **Readability over premature optimization**

## Troubleshooting

### Peer Dependency Conflicts

If `npm install` fails with zod peer dependency errors:

```bash
npm install --legacy-peer-deps
```

### Environment Validation Fails

1. Double-check all environment variables in `.env.local`
2. Verify Supabase project is active
3. Test Google OAuth credentials in Google Cloud Console
4. Verify OpenAI API key is valid and has sufficient quota

### Database Setup Fails

1. Ensure `SUPABASE_SERVICE_ROLE_KEY` has correct permissions
2. Check Supabase project is not rate-limited
3. Run locally: `node setup-database.js` with verbose output
4. Verify database tables don't already exist with duplicate schemas

### Google OAuth Not Working

1. Ensure redirect URI is added to Google Cloud Console:
   - For dev: `http://localhost:3000/api/auth/callback/google`
   - For prod: `https://yourdomain.com/api/auth/callback/google`
2. Verify credentials match `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Contributing

This is a learning/training project. Feel free to fork, modify, and build upon it!

## License

This project is open source and available under the MIT License.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [LangChain Documentation](https://js.langchain.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
