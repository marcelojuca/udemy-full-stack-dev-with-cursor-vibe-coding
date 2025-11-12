# Figma Plugin Monetization & Stripe Integration Plan

**Project**: Xpto - GitHub Analyzer with Figma Image Resizer Plugin Subscription

## 📋 Table of Contents

1. [Overview & Strategy](#overview--strategy)
2. [Subscription Plan Structure](#subscription-plan-structure)
3. [Implementation Roadmap](#implementation-roadmap)
4. [Stripe Integration (Web Backend)](#stripe-integration-web-backend)
5. [Figma Plugin Integration](#figma-plugin-integration)
6. [API Gateway & Authentication](#api-gateway--authentication)
7. [Success Metrics & Milestones](#success-metrics--milestones)
8. [Risk Mitigation](#risk-mitigation)

---

## Overview & Strategy

### The Opportunity

**Current State:**
- ✅ Website: Next.js full-stack app with user authentication (Google OAuth) and Supabase database
- ✅ Plugin: Figma Image Resizer Pro plugin (TypeScript + React UI)
- ⚠️ Missing: Stripe payment integration, plugin monetization, plugin ↔ website API connection

**Goal**: Create a **freemium subscription model** where users:
1. Sign up on the website (free tier by default)
2. Authenticate in the Figma plugin (reads API key from website)
3. Unlock Pro features by upgrading subscription (via Stripe)
4. Use API endpoints for advanced image processing

### Monetization Model

**Freemium with 3 Tiers:**

| Tier | Price | Monthly<br/>Usage Limit | Features | Distribution |
|------|-------|------------------------|----------|--------------|
| **Free** | $0 | 5 images/day | - Basic image resizing<br/>- JPG/PNG only<br/>- Watermarked outputs | Figma Community<br/>(Organic growth) |
| **Pro** | $4.99/mo | Unlimited | - Advanced formats (SVG)<br/>- Batch processing<br/>- No watermarks<br/>- API access | Figma Community<br/>(Paid listing) |
| **Team/Enterprise** | $19.99/user/mo | Unlimited + 2x<br/>speed | - Team collaboration<br/>- Shared API keys<br/>- Usage analytics<br/>- Priority support | Direct via Website |

**Distribution Strategy:**
- **Primary**: Figma Community Marketplace (~15% fee, high discoverability)
- **Secondary**: Direct Stripe on website (~3% fee, for enterprise/API add-ons)
- **Hybrid approach** maximizes reach while optimizing margins

---

## Subscription Plan Structure

### Tier Details

#### Free Tier
- **Access**: Automatic on account creation
- **Limits**: 5 image processing operations per day
- **Features**:
  - Basic resize functionality
  - JPG/PNG format support only
  - Watermarked outputs
  - No API key generation
- **Use Case**: Test the plugin, light image editing
- **Goal**: Drive adoption, build funnel to paid tiers

#### Pro Tier ($4.99/month)
- **Access**: Via Figma Community or website subscription
- **Limits**: Unlimited image operations
- **Features**:
  - Unlimited image processing
  - Advanced formats (SVG, WebP, AVIF)
  - Batch processing (up to 100 images/batch)
  - Remove watermarks
  - **API key generation** for website integration
  - Priority customer support
- **Ideal For**: Designers, freelancers, small studios
- **Expected Conversion**: 10-20% of free users (industry benchmark)
- **Retention**: Focus on value, not dark patterns

#### Team/Enterprise ($19.99/user/month)
- **Access**: Via website direct Stripe integration
- **Limits**: Unlimited + 2x processing speed
- **Features**:
  - All Pro features
  - Team member seats (add/remove users)
  - Shared API keys with usage tracking
  - Advanced usage analytics dashboard
  - Custom integrations (white-label API)
  - SLAs for uptime (99.5%)
  - Dedicated support channel
- **Ideal For**: Design agencies, product teams, enterprises
- **Setup**: Annual contract available (save 20%)

### Pricing Strategy Notes

1. **Why these prices?**
   - $4.99: Impulse-buy friendly, aligns with successful Figma plugins ($2-5 range)
   - $19.99: Team/enterprise pricing targets organizations, not individuals
   - **Avoid**: Race to zero; low prices = high support cost

2. **Payment Terms**:
   - Monthly for flexibility (upgrade/downgrade anytime)
   - Annual discount: 20% off (incentivizes commitment)
   - Free trial: 7-14 days for Pro tier (via Figma Payments API)

3. **Why Subscriptions?**
   - Recurring revenue aligns with ongoing image processing needs
   - One-time payments undervalue the backend service
   - SaaS model enables feature updates and support

---

## Implementation Roadmap

### Phase 1: Backend Setup (Stripe Integration) ⚠️ IN PROGRESS
**Timeline**: Weeks 1-2
**Owner**: Backend (Next.js API)
**Reference**: See `docs/stripe_implementation_plan.md` for detailed implementation

#### Tasks:
- [ ] Install Stripe dependencies
  ```bash
  npm install stripe @stripe/react-stripe-js @stripe/stripe-js
  ```

- [ ] Create Stripe Canada business account
  - Complete business verification
  - Add GST/HST number (register with CRA)
  - Enable Stripe Tax

- [ ] Set up environment variables
  ```bash
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

- [ ] Update database schema
  - Add `orders` table (payment tracking)
  - Add `invoices` table (CRA compliance)
  - Add `subscriptions` table (subscription state)
  - Add `line_items` table (invoice details)
  - See `stripe_implementation_plan.md` for full schema

- [ ] Create Stripe service layer
  - `src/lib/stripe.js` - Utility functions
  - `src/lib/invoice-service.js` - Invoice generation
  - Functions: `calculateGST()`, `generateInvoiceNumber()`, `formatCAD()`

- [ ] Create payment endpoints
  - `POST /api/payments/create-payment` - Initiate payment
  - `POST /api/payments/create-subscription` - Create recurring subscription
  - `POST /api/webhooks/stripe` - Handle Stripe events

- [ ] Create webhook handler
  - Handle `payment_intent.succeeded`
  - Handle `customer.subscription.updated`
  - Handle `charge.refunded`
  - Update order/subscription status in database

- [ ] Create checkout form component
  - `src/components/payment/checkout-form.tsx`
  - Stripe Card Element for secure payment
  - GST breakdown display
  - Error handling

- [ ] Create subscription management UI
  - `src/components/payment/subscription-manager.tsx`
  - Show current tier
  - Upgrade/downgrade options
  - Cancel subscription
  - Billing history

**Success Criteria**:
- ✅ Payment flow works end-to-end with Stripe test card
- ✅ Invoices generated with correct GST (5% for Alberta)
- ✅ Webhooks properly handle payment events
- ✅ Order/subscription records created in database

---

### Phase 2: Plugin-Backend Connection
**Timeline**: Weeks 2-3
**Owner**: Full-stack (Plugin + Backend)
**Dependencies**: Phase 1 complete

#### Tasks:
- [ ] Create API key management endpoints
  - `POST /api/api-keys/generate` - Generate API key for authenticated user
  - `GET /api/api-keys` - List user's API keys
  - `DELETE /api/api-keys/[id]` - Revoke API key
  - Keys should be scoped to subscription tier

- [ ] Add tier-based rate limiting
  - Free tier: 5 requests/day
  - Pro tier: Unlimited (100 req/min burst)
  - Enterprise: 1000 req/min burst
  - Implement in middleware

- [ ] Create plugin authentication endpoint
  - `GET /api/plugin/auth/verify-key` - Verify API key + get tier info
  - Response: `{ tier: "pro", limits: { daily: unlimited }, features: [...] }`

- [ ] Update plugin code
  - Store API key from website in plugin local storage
  - Add tier-aware UI (show limits for free tier, hide for Pro)
  - Authenticate all API calls with API key
  - Handle 429 (rate limit) responses gracefully

- [ ] Create plugin image processing API
  - `POST /api/plugin/process-image` - Core endpoint for plugin
  - Validate API key + tier
  - Check rate limits
  - Process image (existing logic)
  - Return processed image + metadata

- [ ] Add usage tracking
  - Log all API calls to database
  - Track per-user, per-tier
  - Show stats in website dashboard
  - Use for billing and analytics

**Success Criteria**:
- ✅ Plugin can authenticate with API key from website
- ✅ Rate limiting works correctly per tier
- ✅ Free tier limited to 5 images/day
- ✅ Pro tier has unlimited access
- ✅ Usage is tracked for analytics

---

### Phase 3: Figma Community Publishing
**Timeline**: Week 3-4
**Owner**: Product/Marketing
**Dependencies**: Phase 1 & 2 complete

#### Tasks:
- [ ] Apply for Figma seller approval
  - Submit business details
  - Link to privacy policy + terms of service
  - Wait for approval (typically 1-2 weeks)

- [ ] Create Figma Payments integration
  - **Note**: Figma Marketplace handles payments via Stripe
  - Configure subscription in Figma dashboard
  - Set trial period: 7-14 days
  - Link tier to subscription plan

- [ ] Create listing assets
  - High-quality thumbnail (1920x1080px)
  - Plugin description (~500 chars)
  - Feature screenshots (4-6 images)
  - Demo GIF (5-10 seconds)
  - Pricing explanation

- [ ] Write plugin documentation
  - In-plugin help text
  - Quick start guide
  - FAQ section
  - Link to website docs

- [ ] Prepare for launch
  - Beta test with 20-30 users
  - Gather feedback
  - Fix critical bugs
  - Refine UI/UX

- [ ] Publish to Figma Community
  - Submit for review
  - Respond to feedback from Figma team
  - Publish when approved
  - Monitor for issues first 2 weeks

**Success Criteria**:
- ✅ Plugin listed on Figma Community
- ✅ Free + Pro tiers available for purchase
- ✅ Payments flowing to Stripe account
- ✅ No critical bugs reported

---

### Phase 4: Marketing & Optimization
**Timeline**: Week 4+
**Owner**: Marketing/Community
**Dependencies**: Phase 3 complete

#### Tasks:
- [ ] Community outreach
  - Post on Figma Forum
  - Share on Reddit (/r/FigmaDesign)
  - Tweet about launch
  - Reach out to design blogs

- [ ] Monitor metrics
  - Track daily installs
  - Measure free-to-paid conversion (target: 10-20%)
  - Monitor churn rate
  - Collect user feedback

- [ ] Iterate on pricing
  - A/B test prices if conversion is low
  - Monitor MRR (Monthly Recurring Revenue)
  - Target: 1,000 Pro users = $5K MRR

- [ ] Feature updates
  - Add 2-3 new features monthly
  - Keep changelog in plugin
  - Announce updates on Figma Community

- [ ] Customer support
  - Set up support email
  - Create FAQ
  - Monitor issue tracker
  - Respond to support requests within 24 hours

**Success Criteria**:
- ✅ 100+ installs in first month
- ✅ Free-to-paid conversion ≥ 5%
- ✅ $500-1000 MRR within 3 months
- ✅ Churn rate < 5% monthly

---

## Stripe Integration (Web Backend)

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         Figma Plugin                    │
│  (Image Resizer with API Key)           │
└────────────────┬────────────────────────┘
                 │ API Key + Image
                 ▼
┌─────────────────────────────────────────┐
│       Next.js Web Backend               │
│  - Authenticate API key                 │
│  - Check subscription tier              │
│  - Apply rate limiting                  │
│  - Process image                        │
│  - Track usage                          │
└────────────────┬────────────────────────┘
                 │ Image result
                 ▼
┌─────────────────────────────────────────┐
│         Stripe (Payments)               │
│  - Process subscriptions                │
│  - Issue invoices                       │
│  - Handle refunds                       │
│  - Webhook events                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Supabase (Database)                │
│  - Users & subscriptions                │
│  - API keys                             │
│  - Orders & invoices                    │
│  - Usage tracking                       │
└─────────────────────────────────────────┘
```

### Key Implementation Points

**See `docs/stripe_implementation_plan.md` for:**
- Complete database schema
- Detailed API endpoint code
- Webhook handler implementation
- Checkout form components
- Tax compliance (GST for Alberta)
- Invoice generation
- Refund handling

### Quick Summary

1. **Payment Flow**:
   ```
   User clicks "Upgrade to Pro"
   → Backend creates Stripe payment intent
   → Frontend shows Stripe card form
   → User enters card details
   → Stripe confirms payment
   → Webhook fires payment_intent.succeeded
   → Backend creates subscription record
   → User gets API key + Pro tier access
   ```

2. **Subscription Flow**:
   ```
   Monthly: Stripe auto-charges subscription
   → Webhook fires invoice.payment_succeeded
   → Backend updates subscription_end_date
   → User retains Pro tier access
   → Invoice stored in database (for CRA)
   ```

3. **GST Compliance**:
   - Calculate 5% GST for Alberta (Canadian customer)
   - Show breakdown: $4.99 + $0.25 GST = $5.24 total
   - Track GST collected for quarterly CRA filing
   - Generate compliant invoices

---

## Figma Plugin Integration

### Plugin Architecture

The plugin needs to:
1. Authenticate with the website
2. Respect subscription tier limits
3. Send/receive data via API
4. Display tier status to user

### Authentication Flow

```
1. User signs in on website
   → Gets API key in dashboard

2. User copies API key
   → Pastes into Figma plugin
   → Plugin stores in localStorage

3. Plugin authenticates on startup
   → Sends: { apiKey: "sk_prod_..." }
   → Receives: { tier: "pro", limits: {...} }

4. All image processing requests include API key
   → Stripe/backend validates
   → Rate limiting applied
   → Image processed
   → Result returned
```

### Plugin Files to Update

**`plugins/image-resizer/src/main.ts`** - Plugin main code
- Add API key input when not authenticated
- Show tier status (Free / Pro / Enterprise)
- Add tier-aware UI elements
- Add usage counter for free tier

**`plugins/image-resizer/src/ui.tsx`** - UI components
- API key input field
- Tier status badge
- Free tier: Show "5 uses remaining"
- Pro tier: Show "Unlimited" or "Batch mode available"
- Upgrade button: Link to website pricing page

**Example: Display tier info**
```typescript
// Show in plugin UI
const tierInfo = {
  free: { limit: 5, batchSize: 1, features: ['resize'] },
  pro: { limit: -1, batchSize: 100, features: ['resize', 'crop', 'format'] },
};

// Show to user
<div>Your Plan: {tier} | Limit: {tierInfo[tier].limit}/day</div>
```

### Rate Limiting Strategy

**Free Tier:**
- 5 image operations per calendar day
- Counter resets at midnight UTC
- Show warning at 4/5 used
- Show upgrade prompt at 5/5 used

**Pro Tier:**
- Unlimited daily operations
- 100 requests per minute burst limit
- No upgrade prompt

**Enterprise Tier:**
- Unlimited daily operations
- 1000 requests per minute burst limit
- Priority processing queue

---

## API Gateway & Authentication

### API Key Format & Security

**Key Generation** (website dashboard):
```javascript
const apiKey = `sk_prod_${generateRandomString(32)}`;
// Example: sk_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

// Hash before storage (never store plaintext)
const hashedKey = bcrypt.hash(apiKey, 10);
// Store: hashed_key, key_prefix (e.g., "sk_prod_a1b2"), created_at
```

**Plugin Authentication**:
```typescript
// Plugin sends request with API key
const response = await fetch('https://api.xpto.com/api/plugin/process-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ image: imageData }),
});
```

**Backend Validation**:
```javascript
// src/app/api/plugin/process-image/route.js
export async function POST(request) {
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  // Verify API key exists and is valid
  const { user, tier } = await validateAPIKey(apiKey);

  // Check rate limit
  if (!checkRateLimit(user.id, tier)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Process image
  const result = await processImage(imageData, tier);

  // Track usage
  await logAPIUsage(user.id, 'image_process');

  return Response.json(result);
}
```

### Endpoints Reference

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|-----------|
| `/api/plugin/auth/verify-key` | POST | Verify API key & get tier | API Key | Per-tier |
| `/api/plugin/process-image` | POST | Process single image | API Key | Per-tier |
| `/api/plugin/batch-process` | POST | Batch process images (Pro+) | API Key | Per-tier |
| `/api/payments/create-subscription` | POST | Create subscription | Session | Logged-in users |
| `/api/api-keys/generate` | POST | Generate new API key | Session | 1 per day |
| `/api/usage/get-stats` | GET | Get usage statistics | Session | Logged-in users |

---

## Success Metrics & Milestones

### Key Metrics to Track

| Metric | Target | Timeline | Owner |
|--------|--------|----------|-------|
| **Installs** | 100+ | Week 2 | Marketing |
| **Free-to-Paid Conversion** | 10-20% | Month 1 | Product |
| **Monthly Recurring Revenue (MRR)** | $500 | Month 2 | Finance |
| **Churn Rate** | < 5% monthly | Ongoing | Product |
| **NPS Score** | > 40 | Month 3 | Support |
| **Support Response Time** | < 24 hours | Ongoing | Support |

### Milestone Checklist

**✅ Phase 1 Complete (Week 2)**
- [ ] Stripe payment flow working (test mode)
- [ ] All database tables created
- [ ] Invoice generation tested
- [ ] Webhook handling verified

**✅ Phase 2 Complete (Week 3)**
- [ ] Plugin authenticates with API key
- [ ] Rate limiting works
- [ ] Usage tracking operational
- [ ] Free tier limited to 5/day

**✅ Phase 3 Complete (Week 4)**
- [ ] Plugin published to Figma Community
- [ ] First 10 paying customers
- [ ] Zero critical bugs

**✅ Phase 4 Ongoing (Month 2+)**
- [ ] 100+ total installs
- [ ] $500+ MRR
- [ ] Positive customer feedback
- [ ] Feature roadmap defined

---

## Risk Mitigation

### Risk 1: Low Conversion Rate
**Problem**: Fewer than 5% of free users upgrade
**Mitigation**:
- Test pricing with A/B tests
- Improve free tier→Pro value proposition
- Add more visible upgrade prompts
- Offer limited-time discounts (10% off first month)

### Risk 2: High Churn
**Problem**: Users cancel subscription after first month
**Mitigation**:
- Monitor user feedback closely
- Add features monthly
- Offer email support + quick responses
- Create case studies showing ROI

### Risk 3: Plugin Rejection by Figma
**Problem**: Plugin doesn't meet Figma's approval standards
**Mitigation**:
- Disclose all data practices in manifest
- Avoid dark patterns (no aggressive pop-ups)
- Test thoroughly before submission
- Have backup plan: Direct website sales via Stripe

### Risk 4: Payment Processing Issues
**Problem**: Webhooks fail, payments not recorded
**Mitigation**:
- Implement webhook retry logic
- Log all webhook events to database
- Alert on webhook failures
- Manual reconciliation process (monthly)

### Risk 5: GST Compliance Issues
**Problem**: Incorrectly charging/not remitting GST
**Mitigation**:
- Consult with Canadian accountant
- Calculate GST correctly (5% for Alberta)
- Track all transactions for CRA
- File quarterly GST returns on time
- Keep records for 6 years

### Risk 6: Plugin Pricing Too Low
**Problem**: Revenue insufficient to cover support costs
**Mitigation**:
- Start with $4.99/month, increase if demand high
- Focus on retention over volume
- Monitor unit economics monthly
- Be willing to raise prices for new features

---

## Next Steps

### Immediate (This Week)
1. ✅ Review this plan with team
2. ✅ Get approval for Stripe integration
3. ⚠️ Start Phase 1: Stripe backend setup
4. ⚠️ Register with CRA for GST number (takes ~2 weeks)

### Short Term (Next 2 Weeks)
1. Complete Phase 1: Stripe integration
2. Complete Phase 2: Plugin-backend connection
3. Set up Figma seller account
4. Prepare plugin for publication

### Medium Term (Weeks 3-4)
1. Publish plugin to Figma Community
2. Launch marketing campaign
3. Monitor initial metrics
4. Iterate on pricing/features

### Long Term (Month 2+)
1. Scale: Optimize conversion funnel
2. Grow: Add new features based on feedback
3. Expand: Consider other Figma plugins or markets
4. Monetize: Introduce enterprise tier

---

## Related Documents

- **`stripe_implementation_plan.md`** - Detailed Stripe backend implementation guide
- **`../CLAUDE.md`** - Project overview and architecture
- **`plugins/image-resizer/README.md`** - Figma plugin documentation
- **`plugins/image-resizer/docs/IMPLEMENTATION_CHECKLIST.md`** - Plugin feature checklist

---

**Document Status**: Draft v1.0
**Last Updated**: 2025-01-11
**Owner**: Product Team
**Next Review**: After Phase 1 completion
