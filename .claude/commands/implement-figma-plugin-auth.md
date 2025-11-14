---
allowed-tools: Task, Read, Write, TodoWrite, Bash
description: Coordinate multi-agent implementation of Figma Plugin Authentication. Executes 5 specialized agents in the correct dependency order to implement backend database, APIs, plugin UI, Stripe webhooks, and QA testing.
required-agents: backend-database-engineer, backend-api-developer, stripe-integration-specialist, plugin-frontend-developer, qa-integration-tester
---

# Implement Figma Plugin Authentication - Multi-Agent Orchestration

## Overview

This command orchestrates the complete implementation of Figma Plugin Authentication using **5 specialized agents working in parallel and sequence**. Each agent handles a distinct phase with clear ownership and non-overlapping scopes.

**Total Implementation Time**: ~2 weeks with parallel execution
**Team Composition**: 1 Database Engineer + 1 Backend Developer + 1 Payment Specialist + 1 Frontend Developer + 1 QA Engineer

---

## Architecture & Dependencies

### Agent Dependency Graph

```
Phase 1: Database Foundation (MUST COMPLETE FIRST)
├─ backend-database-engineer
│  └─ Creates 5 tables + 1 function + indexes
│     (subscription_plans, plugin_tokens, plugin_usage, daily_usage_summary, user_subscriptions)

Phase 2: Parallel Backend Development (DEPENDS ON PHASE 1)
├─ backend-api-developer
│  └─ Creates API routes + auth library
│     (GET /api/plugin/auth, GET /api/plugin/user-info, POST /api/plugin/track-usage)
│     (/src/lib/plugin-auth.js, /src/middleware.ts, /src/app/plugin/auth-success)
│
└─ stripe-integration-specialist
   └─ Creates webhook handler + backfill script
      (/src/app/api/stripe/webhook, /scripts/backfill-subscriptions.js)

Phase 3: Plugin Frontend (DEPENDS ON PHASE 2)
└─ plugin-frontend-developer
   └─ Creates plugin UI + auth library
      (/plugins/image-resizer/src/lib/auth.ts, api.ts, updated ui.tsx)

Phase 4: Quality Assurance (DEPENDS ON ALL PREVIOUS PHASES)
└─ qa-integration-tester
   └─ Tests all components end-to-end
      (45 integration tests, validation report)
```

---

## Execution Workflow

### Phase 1: Database Foundation (Days 1-2)

**Agent**: `backend-database-engineer`

**Task**: Set up all database tables and functions

```bash
Task: /implement-figma-plugin-auth --phase=database-foundation
```

**Outputs**:

- ✅ `setup-database.js` - Updated with 5 new tables + function + indexes
- ✅ `setup-production-db.js` - Identical schema for production
- ✅ 4 subscription plans seeded (free, basic, pro, enterprise)

**Success Criteria**:

- [ ] All 5 tables created with IF NOT EXISTS
- [ ] increment_daily_usage() function created
- [ ] All 6 new indexes created
- [ ] Seed data for subscription_plans inserted
- [ ] Both setup files match exactly

**Validation**:

```bash
node setup-database.js
# Should output: ✅ All tables created
```

**Next**: Proceed to Phase 2 once database tables are created

---

### Phase 2A: Backend API Development (Days 3-7)

**Agent**: `backend-api-developer`

**Task**: Create all API routes and authentication library

```bash
Task: /implement-figma-plugin-auth --phase=backend-api
```

**Outputs**:

- ✅ `/src/lib/plugin-auth.js` (280 lines)
  - generatePluginToken()
  - validatePluginToken()
  - revokePluginToken()
  - getUserSubscription()
  - checkDailyLimit()
  - trackPluginUsage()
  - getCachedUser()

- ✅ `/src/app/api/plugin/auth/route.js` (60 lines)
  - GET /api/plugin/auth endpoint
  - Returns token + user info
  - CORS handlers

- ✅ `/src/app/api/plugin/user-info/route.js` (70 lines)
  - GET /api/plugin/user-info endpoint
  - Returns user + subscription
  - CORS handlers

- ✅ `/src/app/api/plugin/track-usage/route.js` (80 lines)
  - POST /api/plugin/track-usage endpoint
  - Enforces daily limits
  - CORS handlers

- ✅ `/src/app/plugin/auth-success/page.tsx` (50 lines)
  - Token handoff page
  - postMessage communication

- ✅ `/src/middleware.ts` (updated)
  - CORS configuration for /api/plugin/\* routes

**Success Criteria**:

- [ ] All 6 files created/updated
- [ ] No hardcoded subscription limits
- [ ] All limits fetched from subscription_plans table
- [ ] CORS headers for Figma domain (https://www.figma.com)
- [ ] JWT validation on every request
- [ ] Database queries for token validation

**Validation**:

```bash
npm run build
# Should compile without TypeScript errors

curl http://localhost:3000/api/plugin/auth
# Should return: {authenticated: false, loginUrl: "..."}
```

**Parallel Execution**: This phase runs in parallel with Phase 2B (Stripe webhooks)

---

### Phase 2B: Stripe Webhook Integration (Days 3-6)

**Agent**: `stripe-integration-specialist`

**Task**: Create webhook handler and synchronization

```bash
Task: /implement-figma-plugin-auth --phase=stripe-integration
```

**Outputs**:

- ✅ `/src/app/api/stripe/webhook/route.ts` (250 lines)
  - Webhook signature verification
  - Event router (5 event types)
  - handleSubscriptionUpdate() - For created/updated events
  - handleSubscriptionCanceled() - For deleted events
  - handlePaymentSucceeded() - Clear failed payment flag
  - handlePaymentFailed() - Set grace period status

- ✅ `/scripts/backfill-subscriptions.js` (100 lines)
  - One-time migration script
  - Syncs existing Stripe subscriptions to Supabase
  - Fetches limits from subscription_plans table

**Success Criteria**:

- [ ] All 5 webhook event handlers implemented
- [ ] Webhook signature verified with constructEvent()
- [ ] Limits fetched from database (NOT Stripe metadata)
- [ ] Backfill script created and tested
- [ ] Error handling for missing users
- [ ] Atomic database updates

**Validation**:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger customer.subscription.created
# Should show: Event processed successfully
```

**Parallel Execution**: This phase runs in parallel with Phase 2A (Backend APIs)

**Important**: Both Phase 2A and 2B must complete before Phase 3 starts

---

### Phase 3: Plugin Frontend Implementation (Days 8-12)

**Agent**: `plugin-frontend-developer`

**Task**: Build plugin authentication UI

**Prerequisite**: Both Phase 2A and 2B completed

```bash
Task: /implement-figma-plugin-auth --phase=plugin-frontend
```

**Outputs**:

- ✅ `/plugins/image-resizer/src/lib/auth.ts` (190 lines)
  - checkAuthentication() - Validate token on mount
  - startAuthentication() - Open auth window
  - completeAuthentication() - Store token
  - clearAuthentication() - Logout
  - getAuthToken() - Retrieve token
  - getCachedUser() - Offline access
  - Interface types: User, Subscription, AuthState

- ✅ `/plugins/image-resizer/src/lib/api.ts` (60 lines)
  - apiRequest() - Make authenticated requests
  - trackUsage() - Track plugin actions
  - checkActionAllowed() - Validate limits

- ✅ `/plugins/image-resizer/src/ui.tsx` (updated)
  - AuthSection component - Login/logout UI
  - UserInfo component - User profile display
  - UsageInfo component - Daily limit stats
  - PluginContent component - Main plugin UI
  - Updated main Plugin component with auth logic

**Success Criteria**:

- [ ] All 3 files created/updated
- [ ] postMessage flow handles origin validation
- [ ] Token stored in figma.clientStorage (not localStorage)
- [ ] User data cached for offline access
- [ ] All errors handled gracefully
- [ ] Plugin builds successfully: npm run build

**Validation**:

```bash
cd plugins/image-resizer && npm run build
# Should compile without errors

# Load in Figma:
# Plugins → Development → Load plugin from manifest.json
# Select: /plugins/image-resizer/manifest.json
# Click "Sign in with Google" button
# Complete auth flow
# Verify user info displayed
```

---

### Phase 4: Quality Assurance Testing (Days 13-14)

**Agent**: `qa-integration-tester`

**Task**: Test entire system end-to-end

**Prerequisite**: All previous phases completed

```bash
Task: /implement-figma-plugin-auth --phase=qa-testing
```

**Test Coverage**:

- ✅ 6 database schema tests
- ✅ 10 API endpoint tests
- ✅ 10 plugin auth flow tests
- ✅ 10 Stripe webhook tests
- ✅ 6 daily limit enforcement tests
- ✅ 4 CORS configuration tests
- ✅ 9 edge case and error handling tests

**Total**: 45 integration tests

**Success Criteria**:

- [ ] All 45 tests pass
- [ ] Database schema validates
- [ ] API endpoints respond correctly
- [ ] Plugin auth flow works end-to-end
- [ ] Stripe webhooks process successfully
- [ ] Daily limits enforced properly
- [ ] CORS headers correct
- [ ] Error handling robust
- [ ] Test report generated with timestamp

**Validation**:

```bash
# Run all tests as documented in qa-integration-tester agent
# Review test report: /docs/test-reports/plugin-auth-test-report-YYYY-MM-DD.md

# Expected output:
# Total Tests: 45
# Passed: 45
# Failed: 0
```

---

## Quick Start Guide

### Prerequisites

1. **Environment Setup**:

   ```bash
   # Generate PLUGIN_JWT_SECRET
   openssl rand -base64 32

   # Add to .env.local
   PLUGIN_JWT_SECRET=<generated-secret>
   STRIPE_WEBHOOK_SECRET=<from-stripe-dashboard>
   ```

2. **Supabase Ready**: Development database with users table

3. **Stripe Account**: Test mode keys configured in .env.local

### Execute Implementation

#### Option 1: Full Implementation (All Phases)

```bash
/implement-figma-plugin-auth --execute-all
```

Runs all 5 agents in correct dependency order:

1. ✅ backend-database-engineer (Phase 1)
2. ✅ backend-api-developer + stripe-integration-specialist (Phase 2, parallel)
3. ✅ plugin-frontend-developer (Phase 3)
4. ✅ qa-integration-tester (Phase 4)

**Timeline**: ~2 weeks with parallel execution

#### Option 2: Phase-by-Phase (Recommended for Monitoring)

```bash
# Phase 1: Database
/implement-figma-plugin-auth --phase=database-foundation
# Wait for completion, validate: node setup-database.js

# Phase 2A & 2B (Parallel): Backend APIs + Stripe
/implement-figma-plugin-auth --phase=backend-api
/implement-figma-plugin-auth --phase=stripe-integration
# Wait for both to complete

# Phase 3: Plugin Frontend
/implement-figma-plugin-auth --phase=plugin-frontend
# Test locally in Figma

# Phase 4: QA Testing
/implement-figma-plugin-auth --phase=qa-testing
# Review test report
```

#### Option 3: Individual Agent (For Specific Tasks)

```bash
# Run specific agent only
Task(backend-database-engineer)
Task(backend-api-developer)
Task(stripe-integration-specialist)
Task(plugin-frontend-developer)
Task(qa-integration-tester)
```

---

## Execution Checklist

### Before Starting

- [ ] Read `/docs/FIGMA_PLUGIN_AUTH_PLAN.md` completely
- [ ] Understand database schema requirements
- [ ] Verify all dependencies in package.json (jsonwebtoken, stripe)
- [ ] Set up .env.local with all required variables
- [ ] Create Stripe webhook endpoint in Stripe Dashboard

### Phase 1: Database

- [ ] Agent: backend-database-engineer executes
- [ ] Run: `node setup-database.js`
- [ ] Verify: All 5 tables created
- [ ] Check: 4 subscription plans seeded

### Phase 2A: Backend APIs

- [ ] Agent: backend-api-developer executes
- [ ] Run: `npm run build` (TypeScript check)
- [ ] Test: `curl http://localhost:3000/api/plugin/auth`
- [ ] Verify: Token generation works
- [ ] Check: CORS headers present

### Phase 2B: Stripe Integration

- [ ] Agent: stripe-integration-specialist executes
- [ ] Update Stripe products with plan_slug metadata
- [ ] Create webhook endpoint in Stripe Dashboard
- [ ] Test: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Trigger: `stripe trigger customer.subscription.created`

### Phase 3: Plugin Frontend

- [ ] Agent: plugin-frontend-developer executes
- [ ] Build: `cd plugins/image-resizer && npm run build`
- [ ] Load: In Figma, load plugin from manifest.json
- [ ] Test: Click "Sign in" button
- [ ] Verify: Google OAuth flow completes
- [ ] Check: User info displayed after login

### Phase 4: QA Testing

- [ ] Agent: qa-integration-tester executes
- [ ] Run: All 45 integration tests
- [ ] Review: Test report for failures
- [ ] Fix: Any failing tests before deployment
- [ ] Generate: Final validation report

---

## File Manifest

### Created Files (13 Total)

**Database** (0 new files, 2 updated):

- `/setup-database.js` ✏️ Updated
- `/setup-production-db.js` ✏️ Updated

**Backend API** (6 new files):

- `/src/lib/plugin-auth.js` ✨ New
- `/src/app/api/plugin/auth/route.js` ✨ New
- `/src/app/api/plugin/user-info/route.js` ✨ New
- `/src/app/api/plugin/track-usage/route.js` ✨ New
- `/src/app/plugin/auth-success/page.tsx` ✨ New
- `/src/middleware.ts` ✏️ Updated

**Stripe Webhooks** (2 new files):

- `/src/app/api/stripe/webhook/route.ts` ✨ New
- `/scripts/backfill-subscriptions.js` ✨ New

**Plugin Frontend** (3 files):

- `/plugins/image-resizer/src/lib/auth.ts` ✨ New
- `/plugins/image-resizer/src/lib/api.ts` ✨ New
- `/plugins/image-resizer/src/ui.tsx` ✏️ Updated

**Testing & Documentation** (1 file):

- `/docs/test-reports/plugin-auth-test-report-YYYY-MM-DD.md` ✨ Generated

### Total Lines of Code

- Database: ~200 lines (schema + indexes + function)
- API Routes: ~200 lines (3 endpoints + middleware)
- Plugin Auth Library: ~190 lines
- Stripe Webhook: ~250 lines
- Backfill Script: ~100 lines
- Plugin UI Updates: ~150 lines

**Total**: ~1090 lines of code across all phases

---

## Parallel Execution Benefits

By using 5 specialized agents:

✅ **Database Engineer** (Days 1-2): Works independently on schema
✅ **API Developer** (Days 3-7): Creates endpoints while...
✅ **Stripe Specialist** (Days 3-6): Works on webhooks in parallel
✅ **Frontend Developer** (Days 8-12): Builds UI after APIs ready
✅ **QA Tester** (Days 13-14): Validates everything at the end

**Result**: 14 days instead of 20+ days with sequential execution
**Team Utilization**: 5 developers working simultaneously
**Risk Mitigation**: Clear ownership, non-overlapping work

---

## Troubleshooting

### If Phase 1 (Database) Fails

```
Error: Missing SUPABASE_SERVICE_ROLE_KEY

Solution:
1. Check .env.local has SUPABASE_SERVICE_ROLE_KEY set
2. Verify Supabase project is active
3. Ensure users table already exists
4. Retry: node setup-database.js
```

### If Phase 2A (API) Fails

```
Error: Cannot find module 'jsonwebtoken'

Solution:
1. npm install jsonwebtoken
2. Verify package.json has it as dependency
3. Retry build: npm run build
```

### If Phase 2B (Stripe) Fails

```
Error: Webhook signature verification failed

Solution:
1. Verify STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
2. Check webhook URL is correct
3. Retry test: stripe trigger customer.subscription.created
```

### If Phase 3 (Plugin) Fails

```
Error: Cannot load plugin in Figma

Solution:
1. Verify manifest.json has correct paths
2. Check build succeeded: npm run build
3. Clear Figma plugin cache and reload
4. Check browser console for errors
```

### If Phase 4 (QA) Fails

```
Error: Test failure in [specific test]

Solution:
1. Review test-report for detailed error
2. Check specific agent's implementation
3. Verify FIGMA_PLUGIN_AUTH_PLAN.md compliance
4. Fix in appropriate agent scope
5. Re-run tests
```

---

## Success Indicators

### After Each Phase

**Phase 1 Complete**:

```
✅ node setup-database.js outputs all table creation messages
✅ 5 new tables visible in Supabase Dashboard
✅ 4 subscription plans in subscription_plans table
```

**Phase 2 Complete**:

```
✅ npm run build succeeds
✅ curl http://localhost:3000/api/plugin/auth returns response
✅ stripe trigger customer.subscription.created works
```

**Phase 3 Complete**:

```
✅ Plugin loads in Figma
✅ "Sign in" button visible
✅ Google OAuth flow completes
✅ User info displayed after login
```

**Phase 4 Complete**:

```
✅ All 45 tests pass
✅ Test report shows 0 failures
✅ No blocking issues identified
✅ Ready for production deployment
```

---

## Post-Implementation

### Deployment Checklist

- [ ] Add PLUGIN_JWT_SECRET to production .env.production.local
- [ ] Add STRIPE_WEBHOOK_SECRET to production .env.production.local
- [ ] Update plugin manifest networkAccess for production domain
- [ ] Run backfill script on production: `node scripts/backfill-subscriptions.js`
- [ ] Configure Stripe products with plan_slug metadata
- [ ] Create webhook endpoint in Stripe (production)
- [ ] Deploy to Vercel: `git push origin main`
- [ ] Test production auth flow
- [ ] Monitor webhook logs for errors

### Monitoring

Track these metrics post-deployment:

- **Auth Success Rate**: % of login attempts that succeed
- **Token Validation**: Time to validate token on each request
- **Daily Limit Enforcement**: Users hitting limits per day
- **Webhook Processing**: % of Stripe events processed successfully
- **Error Rate**: API error responses per day

---

## Support & Questions

### For Questions About Agents

- **Database**: See `backend-database-engineer` agent specification
- **APIs**: See `backend-api-developer` agent specification
- **Webhooks**: See `stripe-integration-specialist` agent specification
- **Plugin UI**: See `plugin-frontend-developer` agent specification
- **Testing**: See `qa-integration-tester` agent specification

### Refer to Documentation

- **Plan**: `/docs/FIGMA_PLUGIN_AUTH_PLAN.md`
- **Test Report**: `/docs/test-reports/plugin-auth-test-report-*.md`
- **This Guide**: `/.claude/commands/implement-figma-plugin-auth.md`

---

## Summary

This orchestration executes **5 specialized agents** to implement Figma Plugin Authentication:

1. **backend-database-engineer** - Database schema foundation
2. **backend-api-developer** - API routes and auth library
3. **stripe-integration-specialist** - Webhook handlers and sync
4. **plugin-frontend-developer** - Plugin UI and authentication
5. **qa-integration-tester** - End-to-end testing and validation

With proper parallel execution, the entire implementation takes **~2 weeks** instead of 3+ weeks with sequential work.

**Start**: `/implement-figma-plugin-auth --execute-all`
**Monitor**: Check completion of each phase
**Validate**: Review test report at the end
