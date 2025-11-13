# Figma Plugin Authentication Implementation Plan

## Document Information

- **Project**: Xpto - GitHub Analyzer + Image Resizer Plugin
- **Feature**: Add NextAuth-based authentication to the Image Resizer Figma plugin
- **Status**: ✅ Multi-Agent Implementation Plan Ready
- **Last Updated**: November 13, 2024
- **Estimated Duration**: ~14 days with parallelization via 5 specialized agents
- **Implementation Method**: Distributed execution via 5 non-overlapping specialized agents
- **Execution Command**: `/implement-figma-plugin-auth --execute-all`

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Implementation via Specialized Agents](#implementation-via-specialized-agents)
3. [Current State Analysis](#current-state-analysis)
4. [Proposed Architecture](#proposed-architecture)
5. [Dynamic Subscription & Usage Tracking](#dynamic-subscription--usage-tracking)
6. [Phase 1: Backend Infrastructure](#phase-1-backend-infrastructure)
7. [Phase 1B: Stripe Webhook Integration](#phase-1b-stripe-webhook-integration)
8. [Phase 2: Plugin Frontend](#phase-2-plugin-frontend)
9. [Phase 3: Testing & Deployment](#phase-3-testing--deployment)
10. [Technical Specifications](#technical-specifications)
11. [Security Considerations](#security-considerations)
12. [Implementation Checklist](#implementation-checklist)
13. [Troubleshooting Guide](#troubleshooting-guide)

---

## Quick Start

### Prerequisites

Before executing the implementation, ensure you have:

```bash
# Generate PLUGIN_JWT_SECRET
openssl rand -base64 32

# Add to .env.local and .env.production.local
PLUGIN_JWT_SECRET=<generated-secret>
STRIPE_WEBHOOK_SECRET=<from-stripe-dashboard>
```

### Execution Options

**Option 1: Full Implementation (Recommended)**

```bash
/implement-figma-plugin-auth --execute-all
```

Executes all 5 agents in correct dependency order. Timeline: ~14 days with parallelization.

**Option 2: Phase-by-Phase (For Monitoring)**

```bash
/implement-figma-plugin-auth --phase=database-foundation
/implement-figma-plugin-auth --phase=backend-api
/implement-figma-plugin-auth --phase=stripe-integration
/implement-figma-plugin-auth --phase=plugin-frontend
/implement-figma-plugin-auth --phase=qa-testing
```

**Option 3: Individual Agents (Specific Tasks)**

```bash
Task(backend-database-engineer)
Task(backend-api-developer)
Task(stripe-integration-specialist)
Task(plugin-frontend-developer)
Task(qa-integration-tester)
```

### Agent Files

All agent specifications are in `/.claude/agents/`:

- `backend-database-engineer.md` - Database schema
- `backend-api-developer.md` - API routes + auth library
- `stripe-integration-specialist.md` - Webhooks + subscription sync
- `plugin-frontend-developer.md` - Plugin UI + authentication
- `qa-integration-tester.md` - Comprehensive testing

Orchestration: `/.claude/commands/implement-figma-plugin-auth.md`

---

## Implementation via Specialized Agents

**Status**: ✅ Multi-agent implementation plan created and ready for execution

This plan has been decomposed into **5 specialized agents** for distributed, non-overlapping implementation. Each agent handles a distinct phase with clear scope boundaries and no overlapping responsibilities.

### Agent Summary Table

| Phase | Agent                         | Duration | Key Deliverables                                        | Dependencies               |
| ----- | ----------------------------- | -------- | ------------------------------------------------------- | -------------------------- |
| 1     | Backend Database Engineer     | 2 days   | 5 tables + 1 function + 6 indexes + seed data           | None                       |
| 2A    | Backend API Developer         | 5 days   | 3 API routes + auth library + middleware + success page | Phase 1                    |
| 2B    | Stripe Integration Specialist | 4 days   | Webhook handler + backfill script                       | Phase 1 (parallel with 2A) |
| 3     | Plugin Frontend Developer     | 5 days   | Auth library + API client + UI components               | Phase 2 (2A + 2B)          |
| 4     | QA Integration Tester         | 2 days   | 45 integration tests + test report                      | All phases                 |

**Total Timeline**: ~14 days (parallelization saves 4 days vs. sequential)

### Phase Dependencies

```
Phase 1: Database Foundation (Days 1-2)
└─ Prerequisite for all other phases

Phase 2: Parallel Backend (Days 3-7)
├─ 2A: Backend APIs (5 days)
│  └─ Prerequisite for Phase 3
└─ 2B: Stripe Webhooks (4 days, runs simultaneously)

Phase 3: Plugin Frontend (Days 8-12)
└─ Depends on both Phase 2A and 2B

Phase 4: QA Testing (Days 13-14)
└─ Validates entire system end-to-end
```

### Agent Details

#### Phase 1: Backend Database Engineer

- **Database schema**: 5 new tables (subscription_plans, plugin_tokens, plugin_usage, daily_usage_summary, user_subscriptions)
- **PostgreSQL function**: `increment_daily_usage()` for atomic usage tracking
- **Indexes**: 6 performance indexes for query optimization
- **Seed data**: 4 subscription plans (free, basic, pro, enterprise)
- **Files**: Updates `setup-database.js` and `setup-production-db.js`

#### Phase 2A: Backend API Developer

- **Authentication library**: `/src/lib/plugin-auth.js` with 7 core functions
- **API routes**:
  - `GET /api/plugin/auth` - Generate plugin token
  - `GET /api/plugin/user-info` - Fetch user + subscription data
  - `POST /api/plugin/track-usage` - Track usage and enforce daily limits
- **Auth success page**: `/src/app/plugin/auth-success/page.tsx` for token handoff
- **CORS middleware**: Updates `/src/middleware.ts` for Figma domain

#### Phase 2B: Stripe Integration Specialist

- **Webhook handler**: `/src/app/api/stripe/webhook/route.ts` with 5 event processors
- **Event processors**: customer.subscription.created/updated/deleted, invoice.payment_succeeded/failed
- **Backfill script**: `/scripts/backfill-subscriptions.js` for existing subscriptions
- **Configuration**: Stripe product metadata setup guide (single source of truth)

#### Phase 3: Plugin Frontend Developer

- **Auth library**: `/plugins/image-resizer/src/lib/auth.ts` with 8 authentication functions
- **API client**: `/plugins/image-resizer/src/lib/api.ts` for authenticated requests
- **UI components**: Updates `/plugins/image-resizer/src/ui.tsx` with authentication UI
- **Features**: postMessage flow, token storage, offline access with caching

#### Phase 4: QA Integration Tester

- **Test coverage**: 45 comprehensive integration tests
  - 6 database schema tests
  - 10 API endpoint tests
  - 10 plugin authentication flow tests
  - 10 Stripe webhook event tests
  - 6 daily limit enforcement tests
  - 4 CORS configuration tests
  - 9 edge case and error handling tests
- **Test report**: Detailed pass/fail status and metrics
- **Validation**: End-to-end system validation

---

## Current State Analysis

### Figma Plugin Architecture

**Location**: `/plugins/image-resizer/`

**Stack**:

- Build Tool: `@create-figma-plugin/build` v4.0.3
- UI Framework: Preact (React-compatible)
- Styling: Tailwind CSS 4
- Language: TypeScript

**Plugin Manifest** (`manifest.json`):

```json
{
  "api": "1.0.0",
  "editorType": ["figma"],
  "id": "1055271383487263589",
  "name": "Image Resizer Pro",
  "main": "build/main.js",
  "ui": "build/ui.js",
  "permissions": ["payments"],
  "networkAccess": {
    "allowedDomains": ["https://*.vercel.app", "https://xpto.app"],
    "devAllowedDomains": ["http://localhost:3000", "http://localhost:3001"]
  }
}
```

### Current Plugin Features

- ✅ Image resizing (frames/images to custom dimensions)
- ✅ Batch processing (multiple variants)
- ✅ Aspect ratio preservation
- ✅ Usage tracking with tier-based limits
- ✅ Client-side storage via `figma.clientStorage`
- ❌ **NO user authentication**
- ❌ **NO connection to website user accounts**

**Tier System** (example):

```
free:       2 one-time resizes
basic:      4 resizes per day
pro:        6 resizes per day
enterprise: Unlimited
```

### Website Authentication System

**Tech Stack**: NextAuth v4 + Google OAuth + Supabase

**Key Components**:

- **Config**: `/src/lib/auth.js`
- **Context**: `/src/contexts/auth-context.tsx`
- **Routes**: `/src/app/api/auth/[...nextauth]/route.js`
- **Database**: Supabase PostgreSQL with NextAuth tables

**Authentication Flow**:

```
Google Login → NextAuth OAuth → Supabase Session → AuthContext → Protected Routes
```

**Database Tables**:

- `users` - User accounts
- `accounts` - OAuth provider data
- `sessions` - JWT sessions
- `api_keys` - User API key management

### The Gap

| Aspect            | Plugin                | Website                    |
| ----------------- | --------------------- | -------------------------- |
| Authentication    | ❌ None               | ✅ NextAuth + Google OAuth |
| Database          | ❌ Local storage only | ✅ Supabase                |
| User Accounts     | ❌ No accounts        | ✅ Supabase users table    |
| Subscription Sync | ❌ Local tracking     | ✅ Planned via API         |
| Payment           | ✅ Figma.payments     | ✅ Stripe                  |

---

## Proposed Architecture

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FIGMA PLUGIN                              │
│                    (Sandboxed iframe)                            │
│                                                                  │
│  1. User clicks "Sign in with Google"                           │
│     └─> window.open('https://yourapp.com/plugin/auth')         │
└────────────────────────┬────────────────────────────────────────┘
                         │ (New browser window opens)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              WEBSITE: /plugin/auth PAGE                          │
│                                                                  │
│  2. Check if user is authenticated                              │
│     ├─ If YES: Generate plugin token                            │
│     └─ If NO: Redirect to /auth/signin with callback            │
│                                                                  │
│  3. Generate JWT token (7-day expiration)                       │
│     └─> Store in plugin_tokens table                            │
│                                                                  │
│  4. Send token back to plugin via postMessage()                 │
│     └─> window.opener.postMessage({ token })                   │
│                                                                  │
│  5. Auto-close auth window                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ (Returns to plugin)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PLUGIN: Store Token                            │
│                                                                  │
│  6. Receive token via postMessage listener                       │
│     └─> figma.clientStorage.setAsync('auth_token', token)      │
│                                                                  │
│  7. Fetch user data from /api/plugin/user-info                  │
│     └─> Headers: { Authorization: Bearer <token> }             │
│                                                                  │
│  8. Display authenticated UI with user info                      │
│     ├─ User name & avatar                                       │
│     ├─ Plan tier (Free/Basic/Pro)                               │
│     └─ Daily resize limit & usage                               │
└──────────────────────────────────────────────────────────────────┘
```

### Why This Approach?

1. **Standard OAuth** - Leverages existing Google OAuth configuration
2. **Secure** - Tokens validated server-side on every request
3. **Seamless** - Uses existing user database and subscription system
4. **Non-breaking** - Optional authentication, existing users unaffected
5. **Scalable** - Supports token refresh, revocation, and audit logging

### Key Constraints & Solutions

| Constraint               | Problem                                  | Solution                                              |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------- |
| **Figma iframe sandbox** | Cannot handle OAuth redirects directly   | Open new browser window with `window.open()`          |
| **Plugin isolation**     | No access to browser cookies             | Use JWT tokens in `figma.clientStorage`               |
| **Same-origin policy**   | Cannot use OAuth callback to same iframe | Use `window.opener.postMessage()` to communicate back |
| **Token storage limit**  | `figma.clientStorage` has 5MB limit      | JWT tokens are small (~500 bytes) ✅                  |
| **CORS restrictions**    | Backend blocks non-browser requests      | Add middleware for `/api/plugin/*` routes             |

---

## Dynamic Subscription & Usage Tracking

### Problem with Hardcoding

The initial plan had subscription limits hardcoded in the application:

```javascript
// ❌ HARDCODED - Requires code deployment to change
const planLimits = {
  free: { resizesPerDay: 2, batchSize: 1, isDaily: false },
  basic: { resizesPerDay: 4, batchSize: 5, isDaily: true },
  pro: { resizesPerDay: 6, batchSize: 20, isDaily: true },
  enterprise: { resizesPerDay: -1, batchSize: -1, isDaily: false },
};
```

**Issues:**

- ❌ Cannot change pricing without deploying code
- ❌ No connection to Stripe product configuration
- ❌ Cannot A/B test different tier limits
- ❌ No real-time sync of subscription status
- ❌ Inefficient daily usage queries (scans all rows)

### Solution: Database-Driven Limits + Stripe Webhook Sync

**Key Changes:**

1. **Create `subscription_plans` table** - Master list of plans with limits from Stripe
2. **Add `limits` JSONB column** to `user_subscriptions` - Store dynamic limits per user
3. **Create `daily_usage_summary` table** - Efficient daily usage tracking with atomic counters
4. **Implement Stripe webhook handler** - Real-time sync of subscription changes
5. **Update plugin-auth.js** - Fetch limits from database, not hardcoded objects

### Benefits

- ✅ **Change pricing without deploying code** - Update Stripe products, limits auto-sync
- ✅ **Real-time subscription status** - Webhook updates Supabase when user upgrades/downgrades
- ✅ **Scalable daily usage tracking** - Atomic increments on summary table instead of scanning all rows
- ✅ **A/B test pricing** - Run experiments with different tier limits
- ✅ **Historical analytics** - Track all usage events with subscription tier at time of action
- ✅ **Automatic daily reset** - Database trigger or query handles count reset
- ✅ **Support subscription lifecycle** - Handle upgrade, downgrade, cancellation, failed payments

### Architecture

```
Stripe Subscription Event
        ↓
Webhook Handler (/api/stripe/webhook)
        ↓
Verify JWT Signature
        ↓
Extract Product Metadata
        ↓
Update user_subscriptions table
  - Set: plan, limits, status
  - From: Stripe product metadata
        ↓
Plugin requests user-info
        ↓
API returns subscription with limits
  - Source: user_subscriptions.limits (synced from Stripe)
        ↓
Plugin displays usage stats
  - Fetches from daily_usage_summary table
  - Atomic increment on resize action
```

---

## Phase 1: Backend Infrastructure

- **Duration**: 3-5 days
- **Owner**: Backend developer
- **Deliverables**: Database schema + API endpoints + Auth library

### 1.1 Database Schema

Add to `/setup-database.js`:

```javascript
// Subscription plans master table (plans with pricing tiers and limits)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_slug VARCHAR(50) UNIQUE NOT NULL,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_monthly INTEGER DEFAULT 0,  -- in cents
  limits JSONB NOT NULL DEFAULT '{
    "resizesPerDay": 2,
    "batchSize": 1,
    "isDaily": false
  }'::jsonb,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data for plans
INSERT INTO subscription_plans (plan_slug, name, price_monthly, limits, features) VALUES
  ('free', 'Free', 0, '{"resizesPerDay": 2, "batchSize": 1, "isDaily": false}', ARRAY['basic_resize']),
  ('basic', 'Basic', 1900, '{"resizesPerDay": 4, "batchSize": 5, "isDaily": true}', ARRAY['batch_resize', 'aspect_ratio']),
  ('pro', 'Pro', 3500, '{"resizesPerDay": 6, "batchSize": 20, "isDaily": true}', ARRAY['unlimited_batch', 'priority_support']),
  ('enterprise', 'Enterprise', 0, '{"resizesPerDay": -1, "batchSize": -1, "isDaily": false}', ARRAY['custom_limits', 'dedicated_support'])
ON CONFLICT (plan_slug) DO NOTHING;

-- Plugin authentication tokens table
CREATE TABLE IF NOT EXISTS plugin_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  revoked BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_plugin_tokens_user_id ON plugin_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_tokens_token ON plugin_tokens(token);

-- Plugin usage tracking (detailed events for analytics)
CREATE TABLE IF NOT EXISTS plugin_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  plan VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  limit_enforced BOOLEAN DEFAULT false,
  daily_count INTEGER,
  limit_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plugin_usage_user_id ON plugin_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_usage_created_at ON plugin_usage(created_at);

-- Daily usage summary (efficient tracking with atomic increments)
CREATE TABLE IF NOT EXISTS daily_usage_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  last_incremented TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_action_date
ON daily_usage_summary(user_id, action, usage_date);

-- PostgreSQL function to atomically increment daily usage
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id UUID,
  p_action VARCHAR,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  INSERT INTO daily_usage_summary (user_id, action, usage_date, count)
  VALUES (p_user_id, p_action, p_date, 1)
  ON CONFLICT (user_id, action, usage_date)
  DO UPDATE SET
    count = daily_usage_summary.count + 1,
    last_incremented = NOW()
  RETURNING count INTO current_count;

  RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- User subscriptions (unified across web + plugin)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  limits JSONB DEFAULT '{
    "resizesPerDay": 2,
    "batchSize": 1,
    "isDaily": false
  }'::jsonb,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  payment_failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
```

Also update `/setup-production-db.js` with the same schema.

### 1.2 Environment Variables

Add to `.env.local` and `.env.production.local`:

```bash
# Plugin JWT Secret (generate with: openssl rand -base64 32)
PLUGIN_JWT_SECRET=your-plugin-jwt-secret-here-min-32-chars

# Stripe Webhook Secret (get from Stripe Dashboard → Developers → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Add to GitHub Actions secrets:

```
PROD_PLUGIN_JWT_SECRET=<production-secret>
PROD_STRIPE_WEBHOOK_SECRET=<production-webhook-secret>
```

### 1.3 Plugin Auth Library

Create `/src/lib/plugin-auth.js`:

```javascript
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from './supabase';

const PLUGIN_JWT_SECRET = process.env.PLUGIN_JWT_SECRET;
const TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generate a plugin authentication token for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<string>} JWT token
 */
export async function generatePluginToken(userId) {
  // Create JWT token
  const token = jwt.sign(
    {
      userId,
      type: 'plugin',
      iat: Math.floor(Date.now() / 1000),
    },
    PLUGIN_JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Store token in database for audit & revocation
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { error } = await supabaseAdmin.from('plugin_tokens').insert([
    {
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    },
  ]);

  if (error) {
    throw new Error('Failed to store plugin token');
  }

  return token;
}

/**
 * Validate a plugin token
 * @param {string} token - JWT token from plugin
 * @returns {Promise<{valid: boolean, userId?: string, error?: string}>}
 */
export async function validatePluginToken(token) {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, PLUGIN_JWT_SECRET);

    // Check database record exists and not revoked
    const { data: tokenData, error } = await supabaseAdmin
      .from('plugin_tokens')
      .select('*')
      .eq('token', token)
      .eq('revoked', false)
      .single();

    if (error || !tokenData) {
      return { valid: false, error: 'Token not found or revoked' };
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return { valid: false, error: 'Token expired' };
    }

    // Update last used timestamp
    await supabaseAdmin
      .from('plugin_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return {
      valid: true,
      userId: tokenData.user_id,
      tokenId: tokenData.id,
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Revoke a plugin token (on logout)
 * @param {string} token - Token to revoke
 * @returns {Promise<boolean>}
 */
export async function revokePluginToken(token) {
  const { error } = await supabaseAdmin
    .from('plugin_tokens')
    .update({ revoked: true })
    .eq('token', token);

  return !error;
}

/**
 * Get user subscription info with tier limits (fetched from database, not hardcoded)
 * @param {string} userId - Supabase user ID
 * @returns {Promise<{plan: string, status: string, limits: object}>}
 */
export async function getUserSubscription(userId) {
  // Fetch subscription with limits from database (synced from Stripe)
  const { data: subscription, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('plan, status, limits, current_period_end, stripe_subscription_id')
    .eq('user_id', userId)
    .single();

  // If no subscription found, return free tier from subscription_plans table
  if (error || !subscription) {
    const { data: freePlan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('limits')
      .eq('plan_slug', 'free')
      .single();

    // ✅ FAIL FAST: Throw error if seed data is missing
    // Don't fall back to hardcoded limits - configuration problems should be caught at deployment
    if (planError || !freePlan) {
      throw new Error(
        'Failed to load free tier configuration from subscription_plans table. ' +
          'Ensure database seed data is initialized via setup-database.js'
      );
    }

    return {
      plan: 'free',
      status: 'active',
      limits: freePlan.limits, // ✅ Always fetched from database, never hardcoded
    };
  }

  // Return subscription with limits from database (synced from Stripe webhooks)
  return {
    plan: subscription.plan,
    status: subscription.status,
    limits: subscription.limits, // ✅ Fetched from DB, NOT hardcoded
    currentPeriodEnd: subscription.current_period_end,
    stripeSubscriptionId: subscription.stripe_subscription_id,
  };
}

/**
 * Track plugin usage for analytics
 * @param {string} userId - Supabase user ID
 * @param {string} action - Action name (resize, batch, etc.)
 * @param {object} metadata - Additional data
 */
export async function trackPluginUsage(userId, action, metadata = {}) {
  await supabaseAdmin.from('plugin_usage').insert([
    {
      user_id: userId,
      action,
      metadata,
    },
  ]);
}

/**
 * Check if user exceeded daily limit for an action (uses efficient summary table)
 * @param {string} userId - Supabase user ID
 * @param {string} action - Action name
 * @param {number} dailyLimit - Maximum allowed per day (-1 for unlimited)
 * @returns {Promise<{allowed: boolean, used: number, remaining: number, limit: number}>}
 */
export async function checkDailyLimit(userId, action, dailyLimit) {
  const today = new Date().toISOString().split('T')[0];

  // Query efficient summary table (single row lookup instead of scanning all rows)
  const { data: summary } = await supabaseAdmin
    .from('daily_usage_summary')
    .select('count')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('usage_date', today)
    .single();

  const used = summary?.count || 0;

  // Support unlimited limits (-1 means unlimited)
  const allowed = dailyLimit === -1 || used < dailyLimit;
  const remaining = dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - used);

  return { allowed, used, remaining, limit: dailyLimit };
}
```

### 1.4 API Routes

#### Route 1: `/src/app/api/plugin/auth/route.js`

Get or create plugin token for authenticated user:

```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generatePluginToken } from '@/lib/plugin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          authenticated: false,
          loginUrl: `${process.env.NEXTAUTH_URL}/auth/signin?callbackUrl=/plugin/auth-success`,
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': 'https://www.figma.com',
            'Access-Control-Allow-Credentials': 'true',
          },
        }
      );
    }

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate plugin token
    const token = await generatePluginToken(user.id);

    return NextResponse.json(
      {
        authenticated: true,
        token,
        user: {
          id: user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.figma.com',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  } catch (error) {
    console.error('Plugin auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.figma.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

#### Route 2: `/src/app/api/plugin/user-info/route.js`

Get authenticated user data and subscription:

```javascript
import { NextResponse } from 'next/server';
import { validatePluginToken, getUserSubscription } from '@/lib/plugin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate token
    const validation = await validatePluginToken(token);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || 'Invalid token' }, { status: 401 });
    }

    // Get user data
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, image')
      .eq('id', validation.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get subscription info
    const subscription = await getUserSubscription(validation.userId);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        subscription,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.figma.com',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  } catch (error) {
    console.error('Plugin user-info error:', error);
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.figma.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

#### Route 3: `/src/app/api/plugin/track-usage/route.js`

Track usage and enforce limits:

```javascript
import { NextResponse } from 'next/server';
import {
  validatePluginToken,
  trackPluginUsage,
  getUserSubscription,
  checkDailyLimit,
} from '@/lib/plugin-auth';

export async function POST(request) {
  try {
    // Validate token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const validation = await validatePluginToken(token);

    if (!validation.valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { action, metadata } = body;

    // Get user's subscription
    const subscription = await getUserSubscription(validation.userId);

    // Check limits if daily limit applies
    if (subscription.limits.isDaily && action === 'resize') {
      const dailyLimit = subscription.limits.resizesPerDay;
      const { allowed, used, remaining } = await checkDailyLimit(
        validation.userId,
        action,
        dailyLimit
      );

      if (!allowed) {
        return NextResponse.json(
          {
            error: 'Daily limit exceeded',
            limit: dailyLimit,
            used,
            remaining: 0,
          },
          { status: 429 }
        );
      }
    }

    // Track usage
    await trackPluginUsage(validation.userId, action, metadata);

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.figma.com',
        },
      }
    );
  } catch (error) {
    console.error('Track usage error:', error);
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.figma.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### 1.5 CORS Middleware

Create or update `/src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle CORS preflight for plugin routes
  if (pathname.startsWith('/api/plugin') && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.figma.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS headers to plugin API responses
  if (pathname.startsWith('/api/plugin')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'https://www.figma.com');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/plugin/:path*',
};
```

### 1.6 Testing Backend

```bash
# Test token generation
curl -X GET http://localhost:3000/api/plugin/auth \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"

# Test user info endpoint
curl -X GET http://localhost:3000/api/plugin/user-info \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test usage tracking
curl -X POST http://localhost:3000/api/plugin/track-usage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "resize", "metadata": {"width": 1920, "height": 1080}}'
```

---

## Phase 1B: Stripe Webhook Integration

- **Duration**: 2-3 days
- **Owner**: Backend developer
- **Deliverables**: Webhook handler + Stripe configuration + backfill script

### 1B.1 Stripe Webhook Handler

Create `/src/app/api/stripe/webhook/route.ts`:

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: `Webhook Error: ${error}` }, { status: 400 });
  }

  console.log(`Processing Stripe event: ${event.type}`);

  try {
    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Get product and extract plan_slug
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);
    const planSlug = product.metadata.plan_slug || 'free';

    // Fetch limits from Supabase (single source of truth)
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('limits')
      .eq('plan_slug', planSlug)
      .single();

    if (planError || !plan) {
      throw new Error(`Plan ${planSlug} not found in subscription_plans table`);
    }

    const limits = plan.limits;

    // Find or create user subscription
    const { data: existingSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (existingSub) {
      // Update existing subscription
      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan: planSlug,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          limits,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          updated_at: new Date(),
        })
        .eq('stripe_customer_id', customerId);

      if (error) throw error;
      console.log(`Updated subscription for customer: ${customerId}`);
    } else {
      // New subscription - find user by email
      const customer = await stripe.customers.retrieve(customerId);
      const email = (customer as Stripe.Customer).email;

      if (!email) {
        throw new Error(`Customer ${customerId} has no email`);
      }

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.warn(`User not found for email: ${email}`);
        return;
      }

      // Create new subscription
      const { error } = await supabaseAdmin.from('user_subscriptions').insert({
        user_id: user.id,
        plan: planSlug,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        limits,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
      });

      if (error) throw error;
      console.log(`Created subscription for user: ${user.id}`);
    }
  } catch (error) {
    console.error('Failed to handle subscription update:', error);
    throw error;
  }
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // ✅ Fetch free tier limits from database instead of hardcoding
    // This ensures canceled users get the current free tier configuration
    const { data: freePlan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('limits')
      .eq('plan_slug', 'free')
      .single();

    if (planError || !freePlan) {
      throw new Error('Failed to load free tier configuration for subscription cancellation');
    }

    // Set subscription to free tier with database-driven limits
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: subscription.id,
        limits: freePlan.limits, // ✅ From database, not hardcoded
        updated_at: new Date(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) throw error;
    console.log(`Canceled subscription for customer: ${customerId}`);
  } catch (error) {
    console.error('Failed to handle subscription cancellation:', error);
    throw error;
  }
}

/**
 * Handle successful payment (resets failed status)
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'active',
        payment_failed_at: null,
        updated_at: new Date(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) throw error;
    console.log(`Payment succeeded for customer: ${customerId}`);
  } catch (error) {
    console.error('Failed to handle payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment (sets grace period)
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    // Mark subscription as past due instead of immediately canceling
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        payment_failed_at: new Date(),
        updated_at: new Date(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) throw error;
    console.log(`Payment failed for customer: ${customerId}`);

    // TODO: Send email notification to user about failed payment
  } catch (error) {
    console.error('Failed to handle payment failure:', error);
    throw error;
  }
}
```

### 1B.2 Stripe Product Metadata Configuration

**Architecture Decision: Single Source of Truth**

This implementation stores **only `plan_slug` in Stripe metadata** and fetches all feature limits from Supabase's `subscription_plans` table. This avoids duplication and provides these benefits:

- ✅ **No redundancy**: Limits exist only in Supabase database
- ✅ **Easy updates**: Change limits without touching Stripe
- ✅ **Single source of truth**: Webhook always pulls from Supabase `subscription_plans` table
- ✅ **A/B testing**: Run experiments with different limits per plan
- ✅ **Better architecture**: Billing system (Stripe) separate from feature configuration (Supabase)

**Why only `plan_slug` in Stripe?**

- Identifies which plan the customer purchased
- Maps Stripe product to your plan system
- Webhook uses it to look up limits from `subscription_plans` table
- All other configuration lives in Supabase

**Step 1: Log into Stripe Dashboard**

Go to: https://dashboard.stripe.com/products

**Step 2: Edit Each Product**

**Important**: Only store `plan_slug` in Stripe metadata. All limits are fetched from the `subscription_plans` table in Supabase (single source of truth).

For the **Free** product, add metadata:

```json
{
  "plan_slug": "free"
}
```

For the **Basic** product, add metadata:

```json
{
  "plan_slug": "basic"
}
```

For the **Pro** product, add metadata:

```json
{
  "plan_slug": "pro"
}
```

For the **Enterprise** product, add metadata:

```json
{
  "plan_slug": "enterprise"
}
```

**Step 3: Create Webhook Endpoint**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter webhook URL:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
4. For development, use Stripe CLI forwarding:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. Copy webhook signing secret → Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 1B.3 Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded

# Check logs
tail -f ~/.config/stripe/logs.txt
```

### 1B.4 Backfill Existing Subscriptions (One-time)

Create migration script `/scripts/backfill-subscriptions.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backfillSubscriptions() {
  console.log('Starting subscription backfill...');

  try {
    // Get all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100
    });

    for (const subscription of subscriptions.data) {
      const customerId = subscription.customer as string;

      // Get Stripe customer
      const customer = await stripe.customers.retrieve(customerId);
      const email = (customer as Stripe.Customer).email;

      if (!email) {
        console.warn(`Skipping customer ${customerId} - no email`);
        continue;
      }

      // Find user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.warn(`User not found for email: ${email}`);
        continue;
      }

      // Get product and extract plan_slug
      const productId = subscription.items.data[0].price.product as string;
      const product = await stripe.products.retrieve(productId);
      const planSlug = product.metadata.plan_slug || 'free';

      // Fetch limits from Supabase (single source of truth)
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('limits')
        .eq('plan_slug', planSlug)
        .single();

      if (planError || !plan) {
        console.warn(`Plan ${planSlug} not found for subscription ${subscription.id}`);
        continue;
      }

      // Update or insert subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan: planSlug,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          limits: plan.limits,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000)
        });

      if (error) {
        console.error(`Failed to upsert subscription for ${email}:`, error);
      } else {
        console.log(`✓ Updated subscription for ${email}`);
      }
    }

    console.log('Backfill complete!');
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  }
}

backfillSubscriptions();
```

Run it:

```bash
node scripts/backfill-subscriptions.js
```

---

## Phase 2: Plugin Frontend

- **Duration**: 3-5 days
- **Owner**: Frontend developer (plugin)
- **Deliverables**: Authentication module + updated UI component

### 2.1 Plugin File Structure

```
plugins/image-resizer/src/
├── main.ts              # Main thread (Figma API)
├── ui.tsx               # UI component (Preact/React)
├── lib/
│   ├── auth.ts          # Authentication logic
│   ├── api.ts           # API client
│   └── storage.ts       # clientStorage wrapper
├── components/
│   ├── AuthButton.tsx   # Login/logout UI
│   ├── UserInfo.tsx     # Display user info
│   └── UsageInfo.tsx    # Display daily usage
└── types/
    └── index.ts         # TypeScript types
```

### 2.2 Authentication Module

Create `/plugins/image-resizer/src/lib/auth.ts`:

```typescript
const STORAGE_KEY_TOKEN = 'xpto_auth_token';
const STORAGE_KEY_USER = 'xpto_user_data';
const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? 'https://xpto.app' : 'http://localhost:3000';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: string;
  limits: {
    resizesPerDay: number;
    batchSize: number;
    isDaily: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: User;
  subscription?: Subscription;
  loading?: boolean;
}

/**
 * Check if user is authenticated by validating stored token
 */
export async function checkAuthentication(): Promise<AuthState> {
  try {
    const token = await figma.clientStorage.getAsync(STORAGE_KEY_TOKEN);

    if (!token) {
      return { isAuthenticated: false, loading: false };
    }

    // Validate token with backend
    const response = await fetch(`${API_BASE_URL}/api/plugin/user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token invalid or expired, clear storage
      await clearAuthentication();
      return { isAuthenticated: false, loading: false };
    }

    const data = await response.json();

    // Store user data for offline access
    await figma.clientStorage.setAsync(STORAGE_KEY_USER, JSON.stringify(data.user));

    return {
      isAuthenticated: true,
      token,
      user: data.user,
      subscription: data.subscription,
      loading: false,
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { isAuthenticated: false, loading: false };
  }
}

/**
 * Start authentication flow by opening auth window
 */
export async function startAuthentication(): Promise<string | null> {
  try {
    const authUrl = `${API_BASE_URL}/plugin/auth`;
    const authWindow = window.open(authUrl, 'xpto_auth', 'width=500,height=600');

    if (!authWindow) {
      throw new Error('Failed to open authentication window');
    }

    // Listen for auth completion message
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== API_BASE_URL) return;

        if (event.data.type === 'PLUGIN_AUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          resolve(event.data.token);
        } else if (event.data.type === 'PLUGIN_AUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Timeout after 5 minutes
      const timeout = setTimeout(
        () => {
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication timeout'));
        },
        5 * 60 * 1000
      );

      // Close timer if window closes
      const closeCheckInterval = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(closeCheckInterval);
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication window closed'));
        }
      }, 500);
    });
  } catch (error) {
    console.error('Auth start failed:', error);
    return null;
  }
}

/**
 * Complete authentication by storing token
 */
export async function completeAuthentication(token: string): Promise<AuthState> {
  try {
    await figma.clientStorage.setAsync(STORAGE_KEY_TOKEN, token);

    // Fetch and store user data
    const authState = await checkAuthentication();

    return authState;
  } catch (error) {
    console.error('Auth completion failed:', error);
    return { isAuthenticated: false, loading: false };
  }
}

/**
 * Clear authentication (logout)
 */
export async function clearAuthentication(): Promise<void> {
  await figma.clientStorage.deleteAsync(STORAGE_KEY_TOKEN);
  await figma.clientStorage.deleteAsync(STORAGE_KEY_USER);
}

/**
 * Get current auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return await figma.clientStorage.getAsync(STORAGE_KEY_TOKEN);
}

/**
 * Get cached user data (for offline access)
 */
export async function getCachedUser(): Promise<User | null> {
  try {
    const userData = await figma.clientStorage.getAsync(STORAGE_KEY_USER);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}
```

### 2.3 API Client Module

Create `/plugins/image-resizer/src/lib/api.ts`:

```typescript
import { getAuthToken } from './auth';

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? 'https://xpto.app' : 'http://localhost:3000';

/**
 * Make authenticated API request
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Track plugin action usage
 */
export async function trackUsage(
  action: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const response = await apiRequest('/api/plugin/track-usage', {
      method: 'POST',
      body: JSON.stringify({ action, metadata }),
    });

    if (!response.ok) {
      console.error('Failed to track usage:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
}

/**
 * Check if action is allowed (not exceeding limits)
 */
export async function checkActionAllowed(action: string): Promise<{
  allowed: boolean;
  error?: string;
  limit?: number;
  remaining?: number;
}> {
  try {
    // This could be part of track-usage response in a real implementation
    // For now, we track and let the API enforce limits
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'Failed to check limits' };
  }
}
```

### 2.4 Updated Plugin UI Component

Update `/plugins/image-resizer/src/ui.tsx`:

```typescript
import { render, Container, VerticalSpace, Button, Text, Heading } from '@create-figma-plugin/ui';
import { h, ComponentChildren } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  checkAuthentication,
  startAuthentication,
  completeAuthentication,
  clearAuthentication,
  type AuthState
} from './lib/auth';
import { trackUsage } from './lib/api';

function AuthSection({ authState, onLogin, onLogout, authenticating }: {
  authState: AuthState;
  onLogin: () => void;
  onLogout: () => void;
  authenticating: boolean;
}) {
  if (!authState.isAuthenticated) {
    return (
      <Container space="medium">
        <VerticalSpace space="large" />
        <Heading>Image Resizer Pro</Heading>
        <Text>Sign in to use all features</Text>
        <VerticalSpace space="small" />
        <Button
          fullWidth
          onClick={onLogin}
          disabled={authenticating}
        >
          {authenticating ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        <VerticalSpace space="small" />
        <Text muted small>
          Free tier: 2 one-time resizes
        </Text>
      </Container>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {authState.user?.image && (
          <img
            src={authState.user.image}
            alt={authState.user.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '600' }}>
            {authState.user?.name}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {authState.subscription?.plan.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <div style={{
        padding: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        marginBottom: '12px'
      }}>
        <Text small>
          {authState.subscription?.limits.isDaily
            ? `${authState.subscription.limits.resizesPerDay} resizes per day`
            : `${authState.subscription?.limits.resizesPerDay} one-time resizes`
          }
        </Text>
      </div>

      {/* Main Plugin UI Goes Here */}
      <PluginContent authState={authState} />

      {/* Logout Button */}
      <VerticalSpace space="medium" />
      <Button secondary fullWidth onClick={onLogout}>
        Sign out
      </Button>
    </div>
  );
}

function PluginContent({ authState }: { authState: AuthState }) {
  const handleResize = async () => {
    // Track the resize action
    await trackUsage('resize', {
      plan: authState.subscription?.plan
    });

    // Rest of resize logic here
  };

  return (
    <div>
      {/* Your existing plugin UI components here */}
      {/* Add onClick handlers to call trackUsage */}
    </div>
  );
}

function Plugin() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true
  });
  const [authenticating, setAuthenticating] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuthentication().then(state => {
      setAuthState(state);
    });
  }, []);

  const handleLogin = async () => {
    setAuthenticating(true);

    try {
      const token = await startAuthentication();

      if (token) {
        const newState = await completeAuthentication(token);
        setAuthState(newState);
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Show error toast
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthentication();
    setAuthState({ isAuthenticated: false });
  };

  if (authState.loading) {
    return (
      <Container space="medium">
        <VerticalSpace space="large" />
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <AuthSection
      authState={authState}
      onLogin={handleLogin}
      onLogout={handleLogout}
      authenticating={authenticating}
    />
  );
}

export default render(Plugin);
```

### 2.5 Plugin Auth Success Page

Create `/src/app/plugin/auth-success/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function PluginAuthSuccess() {
  const [status, setStatus] = useState('Authenticating...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get token from URL params
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        throw new Error('No token provided');
      }

      // Verify we have access to opener (plugin window)
      if (!window.opener) {
        throw new Error('Plugin window not found');
      }

      // Send token back to plugin
      window.opener.postMessage(
        {
          type: 'PLUGIN_AUTH_SUCCESS',
          token
        },
        'https://www.figma.com'
      );

      setStatus('✓ Authentication Successful');

      // Close window after delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);

      // Send error back to plugin
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'PLUGIN_AUTH_ERROR',
            error: errorMsg
          },
          'https://www.figma.com'
        );
      }

      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: error ? '#fee' : '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: error ? '#c33' : '#333', margin: '0 0 10px 0' }}>
          {error ? '✗ Error' : status}
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          {error
            ? `Failed: ${error}`
            : 'You can close this window and return to Figma.'
          }
        </p>
      </div>
    </div>
  );
}
```

### 2.6 Build and Test

```bash
# Build plugin
cd plugins/image-resizer
npm run build

# Load in Figma Desktop
# Plugins > Development > Load plugin from manifest.json
# Select plugins/image-resizer/manifest.json
```

---

## Phase 3: Testing & Deployment

- **Duration**: 3-5 days
- **Owner**: QA + DevOps
- **Deliverables**: Test reports + deployed changes

### 3.1 Local Testing Checklist

- [ ] **Backend API Tests**
  - [ ] GET /api/plugin/auth returns 401 when not authenticated
  - [ ] GET /api/plugin/auth returns token when authenticated
  - [ ] Validate token JWT signature and expiration
  - [ ] Check CORS headers present in responses

- [ ] **Plugin Authentication Flow**
  - [ ] Click "Sign in" opens new browser window
  - [ ] Google OAuth flow works in new window
  - [ ] Token successfully sent back to plugin via postMessage
  - [ ] Token stored in figma.clientStorage
  - [ ] Auth window closes after success

- [ ] **Plugin API Integration**
  - [ ] Plugin can fetch /api/plugin/user-info with token
  - [ ] User info displays correctly (name, email, avatar)
  - [ ] Subscription plan shows correct tier
  - [ ] Daily limit info displays correctly

- [ ] **Usage Tracking**
  - [ ] Each resize action tracked to database
  - [ ] Daily limits enforced (429 when exceeded)
  - [ ] Limit resets at midnight
  - [ ] Free tier users still work without auth

- [ ] **Token Lifecycle**
  - [ ] Token validates on each request
  - [ ] Expired token returns 401
  - [ ] Revoked token returns 401
  - [ ] Logout clears token from storage

- [ ] **CORS & Security**
  - [ ] Figma origin allowed in CORS headers
  - [ ] Other origins blocked
  - [ ] Authorization header required for user info
  - [ ] Unauthenticated requests rejected

### 3.2 Staging Deployment

```bash
# Build the application
npm run build

# Verify no TypeScript or ESLint errors
npm run lint

# Deploy to staging (Vercel)
git push origin staging

# Verify in Figma staging environment
# Update plugin manifest networkAccess.devAllowedDomains with staging URL
```

### 3.3 Production Deployment

```bash
# 1. Add environment variables
# GitHub: Settings → Secrets and variables → Actions
# Add: PROD_PLUGIN_JWT_SECRET

# 2. Update plugin manifest
# plugins/image-resizer/manifest.json
# Set allowedDomains to production domain

# 3. Build and test locally
npm run build
cd plugins/image-resizer
npm run build

# 4. Commit changes
git add .
git commit -m "feat: add plugin authentication

- Implement OAuth flow for Figma plugin
- Add JWT token generation and validation
- Create plugin-specific API endpoints
- Add usage tracking and subscription limits
- Integrate with website authentication system"

git push origin main

# 5. GitHub Actions automatically runs
# - Validates environment variables
# - Creates plugin_tokens, plugin_usage, user_subscriptions tables
# - Vercel deploys application

# 6. Submit plugin update to Figma Community
# plugins/image-resizer → Edit → Submit version
```

### 3.4 Monitoring & Debugging

```bash
# View plugin tokens table
SELECT * FROM plugin_tokens ORDER BY created_at DESC LIMIT 10;

# View plugin usage
SELECT action, COUNT(*) as count FROM plugin_usage
GROUP BY action
ORDER BY count DESC;

# Check for revoked tokens
SELECT * FROM plugin_tokens WHERE revoked = true;

# Monitor API errors
# Check Vercel logs: https://vercel.com/dashboard → [project] → Logs
```

---

## Technical Specifications

### Token Format

**JWT Claims**:

```json
{
  "userId": "user-uuid",
  "type": "plugin",
  "iat": 1234567890,
  "exp": 1234652290
}
```

**Token Expiry**: 7 days
**Refresh Strategy**: Client requests new token when old one expires
**Storage**: Secure storage in `figma.clientStorage`

### API Response Formats

**GET /api/plugin/auth** (Token Generation):

```json
{
  "authenticated": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://..."
  }
}
```

**GET /api/plugin/user-info** (User + Subscription):

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://..."
  },
  "subscription": {
    "plan": "basic",
    "status": "active",
    "limits": {
      "resizesPerDay": 4,
      "batchSize": 5,
      "isDaily": true
    }
  }
}
```

**POST /api/plugin/track-usage** (Usage Tracking):

```json
{
  "success": true
}
```

**Error Response** (Daily limit exceeded):

```json
{
  "error": "Daily limit exceeded",
  "limit": 4,
  "used": 4,
  "remaining": 0
}
```

### Database Schema Quick Reference

| Table                 | Purpose                                       | Key Columns                                       |
| --------------------- | --------------------------------------------- | ------------------------------------------------- |
| `subscription_plans`  | Master list of plans and limits               | `plan_slug`, `limits` (JSONB), `features`         |
| `plugin_tokens`       | JWT token storage for audit/revocation        | `user_id`, `token`, `expires_at`, `revoked`       |
| `plugin_usage`        | Detailed event tracking for analytics         | `user_id`, `action`, `metadata`, `created_at`     |
| `daily_usage_summary` | Efficient daily tracking with atomic counters | `user_id`, `action`, `usage_date`, `count`        |
| `user_subscriptions`  | User subscription + Stripe sync               | `user_id`, `plan`, `limits` (from DB), `stripe_*` |

**Key Indexes**:

- `plugin_tokens(user_id)` - Token lookup by user
- `plugin_tokens(token)` - Token validation
- `plugin_usage(user_id, created_at)` - Usage queries
- `daily_usage_summary(user_id, action, usage_date)` - Daily limit checks
- `user_subscriptions(user_id, stripe_customer_id)` - Subscription lookup

**PostgreSQL Function**:

- `increment_daily_usage(p_user_id, p_action, p_date)` - Atomic increment for daily counters

---

## Security Considerations

### Authentication & Token Management

- ✅ Use HTTPS everywhere (enforced by Vercel + Figma)
- ✅ Validate JWT signature with secret key on every request
- ✅ Check token expiration on every request (7-day window)
- ✅ Store tokens server-side in `plugin_tokens` table for audit & revocation capability
- ✅ Use secure random for JWT secret (minimum 32 characters, generate: `openssl rand -base64 32`)
- ✅ Implement token revocation on logout (set `revoked = true` in database)

### CORS & Network Security

- ✅ Only allow `https://www.figma.com` origin for plugin API endpoints (`/api/plugin/*`)
- ✅ Handle preflight OPTIONS requests for browser CORS validation
- ✅ Set `Access-Control-Allow-Origin: https://www.figma.com` header on all responses
- ✅ Require `Authorization: Bearer <token>` header for authenticated endpoints
- ✅ Reject requests without proper origin/headers with 401/403 status

### Data Protection & Input Validation

- ✅ Never expose secrets or tokens in client-side code or logs
- ✅ Validate all inputs on backend (token, action, metadata)
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Store sensitive data encrypted (tokens validated via JWT signature)
- ✅ Clear tokens from storage on logout via `figma.clientStorage.deleteAsync()`

### Rate Limiting & Quota Enforcement

- ✅ Existing rate limiter in `/src/lib/rate-limiting.js` applies to all API endpoints
- ✅ Daily limits enforced per user based on subscription tier (checked before action)
- ✅ Return 429 (Too Many Requests) when limit exceeded
- ✅ Atomic increment via `increment_daily_usage()` function prevents race conditions
- ✅ Unlimited tiers (-1 limit) supported for enterprise plans

### Logging & Audit Trail

- ✅ All token generation logged to `plugin_tokens` table (user_id, creation time, expiry)
- ✅ All actions tracked in `plugin_usage` table (user_id, action, subscription tier, timestamp)
- ✅ Token validation attempts logged via `last_used_at` timestamp update
- ✅ Monitor `plugin_tokens.revoked` for suspicious logout patterns
- ✅ Query suggestions provided in Phase 3 monitoring section

---

## Troubleshooting Guide

### Issue: "Token Expired" Error

**Symptoms**: User logs in, then after 7 days cannot use plugin

**Solution**:

1. Implement token refresh on auth check failure
2. Or prompt user to sign in again
3. Consider longer expiry (30 days) for better UX

### Issue: CORS Error in Plugin

**Symptoms**: "Access to fetch at 'https://...' has been blocked by CORS policy"

**Solution**:

1. Verify API route has OPTIONS handler
2. Verify `Access-Control-Allow-Origin` header set
3. Check request includes `Authorization` header
4. Test with curl to verify headers

### Issue: postMessage Not Received by Plugin

**Symptoms**: Auth window closes but plugin doesn't get token

**Solution**:

1. Verify auth-success page calls `window.opener.postMessage()`
2. Verify target origin is correct: `'https://www.figma.com'`
3. Add console.logs to debug message flow
4. Check browser console for errors in opener window

### Issue: Daily Limit Not Enforcing

**Symptoms**: User exceeds daily limit but can still resize

**Solution**:

1. Verify `checkDailyLimit` query filters by current day
2. Verify `current_period_end` is set correctly in subscription
3. Check timezone handling (UTC vs local)
4. Test with manual database queries

### Issue: Figma Plugin Won't Load

**Symptoms**: Plugin loads but UI doesn't appear

**Solution**:

1. Check browser console for errors
2. Verify manifest.json syntax is valid
3. Run `npm run build` in plugin directory
4. Check that `build/main.js` and `build/ui.js` exist
5. Try hard refresh or clear plugin cache

---

## Implementation Checklist

### Pre-Implementation

- [ ] Review plan with team
- [ ] Allocate 2-3 weeks of development time
- [ ] Set up separate branch: `feature/plugin-auth`
- [ ] Generate `PLUGIN_JWT_SECRET`: `openssl rand -base64 32`
- [ ] Obtain `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard

### Phase 1: Backend Database & API

See detailed database schema in [Phase 1: Backend Infrastructure](#phase-1-backend-infrastructure) section.

**Database**:

- [ ] Create tables: `subscription_plans`, `plugin_tokens`, `plugin_usage`, `daily_usage_summary`
- [ ] Create PostgreSQL function: `increment_daily_usage()`
- [ ] Add `limits` JSONB column to `user_subscriptions`
- [ ] Add all indexes (see Technical Specifications section)
- [ ] Update `setup-database.js` and `setup-production-db.js`
- [ ] Test schema locally and verify queries

**Backend Library** (`/src/lib/plugin-auth.js`):

- [ ] `generatePluginToken()` - Generate 7-day JWT
- [ ] `validatePluginToken()` - Verify JWT + database record
- [ ] `revokePluginToken()` - Logout functionality
- [ ] `getUserSubscription()` - Fetch limits from database (NOT hardcoded)
- [ ] `checkDailyLimit()` - Use `daily_usage_summary` for efficiency
- [ ] `trackPluginUsage()` - Record actions with subscription info

**API Routes**:

- [ ] `GET /api/plugin/auth` - Generate plugin token for authenticated user
- [ ] `GET /api/plugin/user-info` - Return user + subscription with DB-fetched limits
- [ ] `POST /api/plugin/track-usage` - Track actions, enforce daily limits (429 on exceed)
- [ ] Add CORS middleware for `https://www.figma.com` origin
- [ ] Create `/src/app/plugin/auth-success/page.tsx` for auth completion

**Environment Setup**:

- [ ] Add `PLUGIN_JWT_SECRET` to `.env.local` and `.env.production.local`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.local` and `.env.production.local`
- [ ] Add GitHub Actions secrets: `PROD_PLUGIN_JWT_SECRET`, `PROD_STRIPE_WEBHOOK_SECRET`

### Phase 1B: Stripe Webhook Integration

See detailed webhook implementation in [Phase 1B: Stripe Webhook Integration](#phase-1b-stripe-webhook-integration) section.

**Webhook Handler** (`/src/app/api/stripe/webhook/route.ts`):

- [ ] Create webhook endpoint with signature verification
- [ ] Implement 5 event handlers:
  - `customer.subscription.created` → Create `user_subscriptions` record
  - `customer.subscription.updated` → Update plan + limits from Stripe product metadata
  - `customer.subscription.deleted` → Set user to free tier
  - `invoice.payment_succeeded` → Set status to `active`
  - `invoice.payment_failed` → Set status to `past_due`
- [ ] Add error handling and logging

**Stripe Configuration**:

- [ ] Add `plan_slug` metadata to all 4 Stripe products (Free, Basic, Pro, Enterprise)
- [ ] Create webhook endpoint in Stripe Dashboard pointing to `/api/stripe/webhook`
- [ ] Select the 5 events listed above
- [ ] Copy webhook signing secret to environment variables

**Testing & Backfill**:

- [ ] Test webhook locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Trigger test events: `stripe trigger customer.subscription.created`
- [ ] Create `/scripts/backfill-subscriptions.js` to sync existing subscriptions
- [ ] Run backfill script in production

### Phase 2: Plugin Frontend

See detailed implementation in [Phase 2: Plugin Frontend](#phase-2-plugin-frontend) section.

**Plugin Auth Module** (`/plugins/image-resizer/src/lib/auth.ts`):

- [ ] `checkAuthentication()` - Validate stored token via API
- [ ] `startAuthentication()` - Open auth window with `window.open()`
- [ ] `completeAuthentication()` - Listen for `postMessage` from auth window
- [ ] `clearAuthentication()` - Logout and clear storage
- [ ] `getAuthToken()` - Retrieve token from `figma.clientStorage`
- [ ] `getCachedUser()` - Fetch cached user data for offline access

**Plugin API Module** (`/plugins/image-resizer/src/lib/api.ts`):

- [ ] `apiRequest()` - Authenticated fetch wrapper with Bearer token
- [ ] `trackUsage()` - POST to `/api/plugin/track-usage`

**Plugin UI** (`/plugins/image-resizer/src/ui.tsx`):

- [ ] Add "Sign in with Google" button when unauthenticated
- [ ] Display user info (name, avatar, plan tier) when authenticated
- [ ] Show daily usage limits and remaining count
- [ ] Add logout button
- [ ] Implement `postMessage` listener for auth window communication
- [ ] Add error handling for network failures

**Testing**:

- [ ] Test token storage in `figma.clientStorage`
- [ ] Test `window.open()` flow and `postMessage` communication
- [ ] Test OAuth redirect and callback
- [ ] Verify CORS headers are present
- [ ] Test offline access with cached data

### Phase 3: Testing & Deployment

See detailed testing in [Phase 3: Testing & Deployment](#phase-3-testing--deployment) section.

**Local Testing**:

- [ ] Backend API tests (401 on unauthenticated, 200 on valid token, 429 on limit exceeded)
- [ ] Plugin authentication flow (window.open → OAuth → postMessage → storage)
- [ ] User info display (name, email, avatar, subscription tier)
- [ ] Daily limit enforcement (multiple resizes, reset at midnight)
- [ ] Token lifecycle (expiration, revocation, logout)
- [ ] CORS & security (Figma origin allowed, other origins blocked)

**Deployment**:

- [ ] Run `npm run build` and `npm run lint` (must pass)
- [ ] Deploy to staging environment
- [ ] Test complete flow in Figma staging environment
- [ ] Run backfill script: `node scripts/backfill-subscriptions.js`
- [ ] Deploy to production
- [ ] Monitor Vercel logs and Stripe webhook logs
- [ ] Update plugin in Figma Community

**Post-Deployment**:

- [ ] Document API endpoints for developers
- [ ] Create user guide (how to sign in, manage subscription)
- [ ] Set up monitoring alerts for webhook failures
- [ ] Monitor metrics: auth success rate, daily limit hits, error rates
- [ ] Gather user feedback on authentication UX

---

## Files to Create/Modify

### Summary Table

| File                                       | Type          | Phase | Purpose                                           |
| ------------------------------------------ | ------------- | ----- | ------------------------------------------------- |
| `/setup-database.js`                       | Modify        | 1     | Add 5 tables + 1 function + seed data             |
| `/setup-production-db.js`                  | Modify        | 1     | Same schema as development                        |
| `/src/lib/plugin-auth.js`                  | Create        | 1     | 6 core auth functions (280 lines)                 |
| `/src/app/api/plugin/auth/route.js`        | Create        | 1     | Token generation endpoint (60 lines)              |
| `/src/app/api/plugin/user-info/route.js`   | Create        | 1     | User + subscription endpoint (70 lines)           |
| `/src/app/api/plugin/track-usage/route.js` | Create        | 1     | Usage tracking + limit enforcement (80 lines)     |
| `/src/app/api/stripe/webhook/route.ts`     | Create        | 1B    | Stripe event handler (250 lines)                  |
| `/src/app/plugin/auth-success/page.tsx`    | Create        | 1     | Auth window completion page (70 lines)            |
| `/src/middleware.ts`                       | Create/Modify | 1     | CORS middleware for `/api/plugin/*` (50 lines)    |
| `/scripts/backfill-subscriptions.js`       | Create        | 1B    | One-time migration script (100 lines)             |
| `/plugins/image-resizer/src/lib/auth.ts`   | Create        | 2     | Plugin auth library (190 lines)                   |
| `/plugins/image-resizer/src/lib/api.ts`    | Create        | 2     | Plugin API client (60 lines)                      |
| `/plugins/image-resizer/src/ui.tsx`        | Modify        | 2     | Add auth UI components                            |
| `/.env.local`                              | Modify        | 1     | Add `PLUGIN_JWT_SECRET` + `STRIPE_WEBHOOK_SECRET` |
| `/.env.production.local`                   | Modify        | 1     | Same env vars as `.env.local`                     |
| `/plugins/image-resizer/manifest.json`     | Review        | 2     | Verify/update `networkAccess.allowedDomains`      |

### Files to Review (No Changes Needed)

| File                             | Reason                               |
| -------------------------------- | ------------------------------------ |
| `/src/lib/rate-limiting.js`      | Already applies to all API endpoints |
| `/src/lib/auth.js`               | NextAuth config unaffected           |
| `/src/contexts/auth-context.tsx` | App-level auth unaffected            |

---

## Timeline & Resource Allocation

### Week 1: Backend Database Schema & Stripe Webhook

| Day              | Task                                                          | Owner   | Hours        |
| ---------------- | ------------------------------------------------------------- | ------- | ------------ |
| 1                | Database schema design & SQL                                  | Backend | 4            |
| 1                | Create subscription_plans, plugin_tokens, plugin_usage tables | Backend | 3            |
| 2                | Create daily_usage_summary + increment_daily_usage() function | Backend | 3            |
| 2                | Add limits JSONB column + indexes                             | Backend | 2            |
| 3                | Create plugin-auth.js module (updated with dynamic limits)    | Backend | 6            |
| 3                | Create /api/plugin routes (auth, user-info, track-usage)      | Backend | 6            |
| 4                | Create Stripe webhook handler (/api/stripe/webhook/route.ts)  | Backend | 8            |
| 4                | Add Stripe product metadata + configure webhook               | Backend | 3            |
| **Week 1 Total** |                                                               |         | **35 hours** |

### Week 2: Plugin Frontend & Testing

| Day              | Task                                              | Owner    | Hours        |
| ---------------- | ------------------------------------------------- | -------- | ------------ |
| 5                | Create auth.ts + api.ts modules (with caching)    | Frontend | 6            |
| 5                | Add CORS middleware + auth success page           | Backend  | 4            |
| 6                | Update plugin UI component with auth UI           | Frontend | 8            |
| 6                | Test webhook locally with Stripe CLI              | Backend  | 4            |
| 7                | postMessage flow + token storage testing          | Frontend | 4            |
| 7                | Create backfill script for existing subscriptions | Backend  | 3            |
| 8                | Local end-to-end testing (auth → limits → usage)  | Both     | 6            |
| 8                | Error handling & edge cases                       | Frontend | 3            |
| **Week 2 Total** |                                                   |          | **38 hours** |

### Week 3: Deployment & Monitoring

| Day              | Task                                     | Owner   | Hours        |
| ---------------- | ---------------------------------------- | ------- | ------------ |
| 9                | Staging deployment + environment setup   | DevOps  | 4            |
| 9                | Run backfill script on staging           | Backend | 2            |
| 9                | End-to-end testing on staging            | QA      | 6            |
| 10               | Test complete subscription lifecycle     | QA      | 4            |
| 10               | Webhook testing with real Stripe events  | Backend | 3            |
| 11               | Production deployment + secrets setup    | DevOps  | 4            |
| 11               | Run backfill script on production        | Backend | 2            |
| 12               | Monitor webhook logs + limit enforcement | DevOps  | 3            |
| 12               | Documentation + runbook creation         | All     | 3            |
| **Week 3 Total** |                                          |         | **31 hours** |

### **Total Estimate: 104 hours (~3-4 weeks FTE with dynamic subscription sync)**

**Note**: Includes Stripe webhook integration (Phase 1B) which replaces hardcoded limits with database-driven configuration. Additional time vs. original plan accounts for:

- Database schema design and PostgreSQL functions
- Stripe webhook handler and event processing
- Backfill script for migration
- Additional testing of subscription lifecycle
- Monitoring and logging setup

---

## Success Criteria

### Authentication & Authorization

- ✅ Plugin users can sign in with Google OAuth
- ✅ Authentication persists across plugin sessions via JWT tokens
- ✅ Tokens stored securely in figma.clientStorage
- ✅ Token validation on every API request
- ✅ Logout clears tokens and user data

### Dynamic Subscription Management

- ✅ Subscription limits fetched from database (NOT hardcoded)
- ✅ Stripe webhook syncs subscription changes to Supabase in real-time
- ✅ Plan upgrades/downgrades reflected immediately in plugin
- ✅ Product metadata from Stripe used for limit configuration
- ✅ Free tier fallback for users without subscription
- ✅ Can change pricing without code deployment

### Usage Tracking & Limits

- ✅ Daily usage tracked in daily_usage_summary table
- ✅ Atomic increment function prevents race conditions
- ✅ Daily limits enforced correctly based on subscription tier
- ✅ Unlimited tiers (-1) supported
- ✅ Usage count resets at midnight automatically
- ✅ Plugin displays "X of Y resizes remaining today"

### Stripe Integration

- ✅ Webhook handler correctly processes subscription events
- ✅ Webhook signature verification prevents spoofing
- ✅ Subscription created → user_subscriptions record created
- ✅ Subscription updated → limits updated from product metadata
- ✅ Subscription canceled → user reverts to free tier
- ✅ Payment failed → status set to past_due (grace period)
- ✅ Payment succeeded → status returned to active

### UI & User Experience

- ✅ Plugin displays user info (name, email, avatar)
- ✅ Plugin shows current plan tier
- ✅ Plugin shows daily usage stats dynamically
- ✅ CORS headers properly configured for Figma domain
- ✅ Error messages clear and helpful
- ✅ Auth window opens and closes properly

### Code Quality & Testing

- ✅ All API routes tested with curl/Stripe CLI
- ✅ Database schema tested locally
- ✅ Webhook tested with Stripe CLI
- ✅ End-to-end flow tested (auth → subscribe → use → limit)
- ✅ Edge cases tested (expired token, failed payment, downgrade)
- ✅ Documentation complete and accurate

### Deployment & Reliability

- ✅ Backward compatible (existing free users unaffected)
- ✅ Zero downtime deployment
- ✅ Backfill script successfully migrates existing subscriptions
- ✅ Monitoring alerts set up for webhook failures
- ✅ Database indexes optimized for query performance
- ✅ Error handling for all failure cases

---

## Appendix: Links & References

### Documentation

- [Figma Plugin Typings](https://www.figma.com/plugin-docs/intro)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [JWT Introduction](https://jwt.io/introduction)
- [Web Security Academy - OAuth](https://portswigger.net/web-security/oauth)

### Related Files in Codebase

- Authentication: `/src/lib/auth.js`
- Database: `/setup-database.js`
- API patterns: `/src/app/api/` routes
- Rate limiting: `/src/lib/rate-limiting.js`
- CLAUDE.md: `/CLAUDE.md`

### Testing Tools

```bash
# Test API endpoints
curl -X GET http://localhost:3000/api/plugin/auth

# Generate test tokens
node -e "console.log(require('jsonwebtoken').sign({userId: 'test'}, 'secret'))"

# Validate Figma plugin manifest
npx @create-figma-plugin/build --help
```

---

## Next Steps

1. **Review this document** - Understand the architecture and implementation plan
2. **Verify environment setup** - Ensure all prerequisites are in place
3. **Execute implementation** - Run `/implement-figma-plugin-auth --execute-all`
4. **Monitor progress** - Review agent outputs and validate each phase
5. **Run tests** - Verify all 45 integration tests pass
6. **Deploy** - Push changes to production with confidence

---

## Change Log

| Date              | Version | Changes                                                                                        |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------- |
| November 13, 2024 | 2.0     | Consolidated multi-agent implementation plan with full technical specifications and all phases |
| 2024              | 1.0     | Initial plan document                                                                          |

---

## Appendix: Quick Reference

### Single Command to Start

```bash
/implement-figma-plugin-auth --execute-all
```

### Phase-by-Phase Commands

```bash
/implement-figma-plugin-auth --phase=database-foundation
/implement-figma-plugin-auth --phase=backend-api
/implement-figma-plugin-auth --phase=stripe-integration
/implement-figma-plugin-auth --phase=plugin-frontend
/implement-figma-plugin-auth --phase=qa-testing
```

### Individual Agent Commands

```bash
Task(backend-database-engineer)
Task(backend-api-developer)
Task(stripe-integration-specialist)
Task(plugin-frontend-developer)
Task(qa-integration-tester)
```

### 30-Second Setup

```bash
# 1. Generate JWT secret
openssl rand -base64 32

# 2. Add to .env.local
PLUGIN_JWT_SECRET=<generated>
STRIPE_WEBHOOK_SECRET=<from-stripe>

# 3. Execute
/implement-figma-plugin-auth --execute-all
```

### Agent Timeline

| Phase     | Agent              | Days         | Depends On         |
| --------- | ------------------ | ------------ | ------------------ |
| 1         | Database Engineer  | 2            | None               |
| 2A        | API Developer      | 5            | Phase 1            |
| 2B        | Stripe Specialist  | 4            | Phase 1 (parallel) |
| 3         | Frontend Developer | 5            | Phase 2A + 2B      |
| 4         | QA Tester          | 2            | All phases         |
| **Total** | **5 Agents**       | **~14 days** | **Parallelized**   |

### Key Files Created by Each Agent

**Phase 1: Database**

- `setup-database.js` (updated)
- `setup-production-db.js` (updated)

**Phase 2A: Backend APIs**

- `/src/lib/plugin-auth.js`
- `/src/app/api/plugin/auth/route.js`
- `/src/app/api/plugin/user-info/route.js`
- `/src/app/api/plugin/track-usage/route.js`
- `/src/app/plugin/auth-success/page.tsx`
- `/src/middleware.ts` (updated)

**Phase 2B: Stripe**

- `/src/app/api/stripe/webhook/route.ts`
- `/scripts/backfill-subscriptions.js`

**Phase 3: Plugin**

- `/plugins/image-resizer/src/lib/auth.ts`
- `/plugins/image-resizer/src/lib/api.ts`
- `/plugins/image-resizer/src/ui.tsx` (updated)

**Phase 4: Testing**

- Test report: `/docs/test-reports/plugin-auth-test-report-*.md`

### Agent Specifications

For detailed implementation specs, see:

- `/.claude/agents/backend-database-engineer.md`
- `/.claude/agents/backend-api-developer.md`
- `/.claude/agents/stripe-integration-specialist.md`
- `/.claude/agents/plugin-frontend-developer.md`
- `/.claude/agents/qa-integration-tester.md`
- `/.claude/commands/implement-figma-plugin-auth.md` (orchestration)

---

**Status**: ✅ Multi-Agent Implementation Plan Ready for Execution
**Last Updated**: November 13, 2024
**Next Action**: Execute `/implement-figma-plugin-auth --execute-all` or start with Phase 1
