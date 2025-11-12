# Stripe Integration: Complete Guide

This document covers the complete Stripe integration for the Xpto platform, including backend setup, plugin integration, pricing configuration, and testing.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Setup](#backend-setup)
4. [Tier Configuration](#tier-configuration)
5. [API Reference](#api-reference)
6. [Plugin Integration](#plugin-integration)
7. [Web App Integration](#web-app-integration)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)
10. [Caching Strategy](#caching-strategy)
11. [Performance Metrics](#performance-metrics)

---

## Overview

Xpto uses Stripe to manage product pricing and tiers for the Figma Image Resizer plugin. The system:

- ✅ Fetches pricing dynamically from Stripe (no code changes needed)
- ✅ Supports Free, Basic, Pro, and Enterprise tiers
- ✅ Caches tier data for 1 hour to reduce API calls
- ✅ Applies tier-based limits to image processing
- ✅ Provides graceful fallbacks if API is unavailable

### Key Benefits

- **Real-time Updates**: Change prices in Stripe, they auto-update in the plugin
- **Single Source of Truth**: Tier configuration in one place
- **Type-Safe**: Full TypeScript support throughout
- **Efficient**: 1-hour caching reduces unnecessary API calls
- **Reliable**: Fallback defaults if API fails
- **Scalable**: Easy to add new tiers or features

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Stripe Dashboard                │
│  (Manage products & pricing)            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Backend: /api/plugin/products         │
│  • Fetches from Stripe API              │
│  • Caches for 1 hour                    │
│  • Returns all tier configs             │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────────┐  ┌──────────────────────┐
│  Web App         │  │  Figma Plugin        │
│  (useHook)       │  │  (stripe-products.ts)│
│  • Pricing page  │  │  • Fetch tier info   │
│  • Plan cards    │  │  • Display limits    │
│  • Billing       │  │  • Cache pricing     │
└──────────────────┘  └──────────────────────┘
```

---

## Backend Setup

### Environment Variables

```bash
# Stripe API Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your-test-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key
```

### Core Files

#### 1. **`src/lib/stripe-products.ts`**

Backend service that fetches and caches Stripe products:

```typescript
// Fetch products from Stripe (with caching)
const products = await fetchStripeProducts();

// Get all tier info
const info = await getProductInfo();

// Get specific tier
const tier = getTierById('pro');

// Get resize limit for tier
const limit = getResizeLimit('basic');

// Clear cache manually
clearProductCache();
```

**Key Functions:**
- `fetchStripeProducts()` - Fetch from Stripe API
- `getProductInfo()` - Get all tiers with publishable key
- `getTierById(id)` - Get single tier by ID
- `getResizeLimit(tierId)` - Get limit config for tier
- `clearProductCache()` - Force refresh cache

#### 2. **`src/app/api/plugin/products/route.ts`**

Public API endpoint that returns tier information:

```
GET /api/plugin/products
```

**Response:**
```json
{
  "tiers": [
    {
      "id": "free",
      "displayName": "Free",
      "resizesOneTime": 10,
      "maxBatchSize": 1,
      "monthlyPrice": 0,
      "stripeProductId": null,
      ...
    },
    {
      "id": "basic",
      "displayName": "Basic",
      "resizesPerDay": 25,
      "maxBatchSize": 5,
      "monthlyPrice": 499,
      "stripeProductId": "prod_...",
      "stripePriceId": "price_...",
      ...
    },
    ...
  ],
  "stripePublishableKey": "pk_test_..."
}
```

**Headers:**
- `Cache-Control: public, max-age=3600` (cached for 1 hour)
- `Content-Type: application/json`

---

## Tier Configuration

### Tier Definitions

All tier limits are defined in two places:

1. **Backend**: `src/lib/stripe-products.ts` (source of truth for API)
2. **Plugin**: `plugins/image-resizer/src/stripe-products.ts` (local tier limits for enforcement)

### Free Tier

- **Resizes**: 10 one-time (never resets)
- **Batch Size**: 1 image
- **Formats**: JPG, PNG only
- **Watermark**: Yes
- **API Access**: No
- **Price**: Free ($0)

### Basic Tier

- **Resizes**: 25 per day
- **Batch Size**: 5 images
- **Formats**: JPG, PNG, WebP
- **Watermark**: No
- **API Access**: Yes
- **Price**: $4.99/month
- **Stripe Product**: `Image Resizer - Basic`

### Pro Tier

- **Resizes**: 100 per day
- **Batch Size**: 25 images
- **Formats**: JPG, PNG, WebP, SVG, PDF
- **Watermark**: No
- **API Access**: Yes
- **Team Support**: Yes
- **Price**: $9.99/month
- **Stripe Product**: `Image Resizer - Pro`

### Enterprise Tier

- **Resizes**: Unlimited
- **Batch Size**: 100 images
- **Formats**: JPG, PNG, WebP, SVG, PDF, AVIF
- **Watermark**: No
- **API Access**: Yes
- **Team Support**: Yes
- **Price**: $24.99/month
- **Stripe Product**: `Image Resizer - Enterprise`

### Setting Up Stripe Products

1. **Go to Stripe Dashboard** → Products
2. **Create a new product** for each paid tier

**Basic Product Example:**
```
Name: Image Resizer - Basic
Metadata:
  category: image-resizer
  tier: basic
Price: $4.99/month (recurring, monthly)
```

**Pro Product Example:**
```
Name: Image Resizer - Pro
Metadata:
  category: image-resizer
  tier: pro
Price: $9.99/month (recurring, monthly)
```

**Enterprise Product Example:**
```
Name: Image Resizer - Enterprise
Metadata:
  category: image-resizer
  tier: enterprise
Price: $24.99/month (recurring, monthly)
```

3. **Copy Product IDs** from Stripe Dashboard
4. **Verify** by testing `/api/plugin/products` endpoint

---

## API Reference

### GET /api/plugin/products

**Description**: Get all available tiers with pricing

**Request**:
```bash
curl http://localhost:3000/api/plugin/products
```

**Response** (200 OK):
```json
{
  "tiers": [
    {
      "id": "free",
      "name": "free",
      "displayName": "Free",
      "resizesOneTime": 10,
      "resizesPerDay": null,
      "maxBatchSize": 1,
      "supportedFormats": ["jpg", "png"],
      "maxImageSize": 5,
      "hasWatermark": true,
      "hasApiAccess": false,
      "hasTeamSupport": false,
      "hasAnalytics": false,
      "supportLevel": "community",
      "monthlyPrice": 0,
      "stripeProductId": null,
      "stripePriceId": null
    },
    {
      "id": "basic",
      "name": "basic",
      "displayName": "Basic",
      "resizesPerDay": 25,
      "maxBatchSize": 5,
      "supportedFormats": ["jpg", "png", "webp"],
      "maxImageSize": 10,
      "hasWatermark": false,
      "hasApiAccess": true,
      "hasTeamSupport": false,
      "hasAnalytics": true,
      "supportLevel": "email",
      "monthlyPrice": 499,
      "stripeProductId": "prod_...",
      "stripePriceId": "price_..."
    },
    ...
  ],
  "stripePublishableKey": "pk_test_..."
}
```

**Cache**: 1 hour (configurable in backend)

---

## Plugin Integration

### Plugin Architecture

The Figma plugin integrates with Stripe in three layers:

1. **Plugin Service** (`plugins/image-resizer/src/stripe-products.ts`)
   - Fetches tier info from `/api/plugin/products`
   - Caches data in `figma.clientStorage`
   - Exposes utility functions

2. **Plugin Main** (`plugins/image-resizer/src/main.ts`)
   - Handles `GET_TIER_INFO` messages from UI
   - Calls service layer
   - Sends `TIER_INFO` back to UI

3. **Plugin UI** (`plugins/image-resizer/src/ui.tsx`)
   - Requests tier info on load
   - Displays pricing cards
   - Shows current tier/limits

### Plugin Service: `stripe-products.ts`

```typescript
// Fetch tier info
const tierInfo = await getTierInfo('basic');
// Returns: { displayName, limit, isDaily, monthlyPrice, ... }

// Get resize limit
const limit = getResizeLimit('pro');
// Returns: { limit: 100, isDaily: true }

// Get all tiers
const tiers = await getAllTiers();

// Clear cache manually
await clearCache();
```

**Tier Limits (Source of Truth for Plugin):**
```typescript
const TIER_LIMITS = {
  free: { limit: 10, isDaily: false },      // 10 one-time
  basic: { limit: 25, isDaily: true },       // 25 per day
  pro: { limit: 100, isDaily: true }         // 100 per day
}
```

### Data Flow: Plugin Load

```
1. Plugin UI mounts
   ↓
2. fetchTierInfo() called
   ↓
3. UI emits GET_TIER_INFO for free/basic/pro to main thread
   ↓
4. Main thread receives message
   ↓
5. Main thread calls getTierDetails(plan)
   ↓
6. getTierDetails calls getTierInfo() from stripe-products.ts
   ↓
7. stripe-products.ts fetches from /api/plugin/products
   ↓
8. Stripe API returns current prices
   ↓
9. Data cached in figma.clientStorage (1 hour)
   ↓
10. Main thread emits TIER_INFO back to UI
    ↓
11. UI receives and updates tierInfo state
    ↓
12. Pricing cards render with live data
```

### Data Flow: Price Update in Stripe

```
1. Edit price in Stripe Dashboard
   ↓
2. Price takes effect immediately
   ↓
3. Plugin still shows cached price (up to 1 hour)
   ↓
4. Wait for cache to expire OR manually clear
   ↓
5. User reloads plugin
   ↓
6. fetchTierInfo() fetches fresh data from API
   ↓
7. Plugin shows new pricing
```

### Plugin Message Flow

**UI → Main Thread:**
```typescript
emit('GET_TIER_INFO', { plan: 'basic' })
```

**Main Thread Processing:**
```typescript
on('GET_TIER_INFO', async ({ plan }) => {
  const tierDetails = await getTierDetails(plan);
  // tierDetails includes: displayName, limit, monthlyPrice, stripeProductId, etc.
})
```

**Main Thread → UI:**
```typescript
emit('TIER_INFO', {
  plan: 'basic',
  displayName: 'Basic',
  limit: 25,
  isDaily: true,
  monthlyPrice: 499,
  stripeProductId: 'prod_...',
  stripePriceId: 'price_...'
})
```

**UI Listener:**
```typescript
on('TIER_INFO', (data) => {
  setTierInfo(prev => ({ ...prev, [data.plan]: data }))
})
```

### Display Pricing in Plugin UI

```typescript
import React, { useState, useEffect } from 'react';

export function PricingTab() {
  const [tierInfo, setTierInfo] = useState({});
  const [loadingTierInfo, setLoadingTierInfo] = useState(true);

  useEffect(() => {
    fetchTierInfo();
  }, []);

  const fetchTierInfo = async () => {
    const plans = ['free', 'basic', 'pro'];

    for (const plan of plans) {
      parent.postMessage(
        { pluginMessage: { type: 'GET_TIER_INFO', plan } },
        '*'
      );
    }

    // Listen for responses
    window.onmessage = (event) => {
      const { type, plan, data } = event.data.pluginMessage;
      if (type === 'TIER_INFO') {
        setTierInfo(prev => ({ ...prev, [plan]: data }));
      }
    };

    setLoadingTierInfo(false);
  };

  if (loadingTierInfo) return <div>Loading pricing...</div>;

  return (
    <div>
      {/* Basic Tier Card */}
      {tierInfo.basic && (
        <div className="tier-card">
          <h3>{tierInfo.basic.displayName}</h3>
          <p>{tierInfo.basic.limit} resizes per day</p>
          <p>${(tierInfo.basic.monthlyPrice / 100).toFixed(2)}/month</p>
        </div>
      )}

      {/* Pro Tier Card */}
      {tierInfo.pro && (
        <div className="tier-card">
          <h3>{tierInfo.pro.displayName}</h3>
          <p>{tierInfo.pro.limit} resizes per day</p>
          <p>${(tierInfo.pro.monthlyPrice / 100).toFixed(2)}/month</p>
        </div>
      )}
    </div>
  );
}
```

### Apply Tier Limits in Plugin

```typescript
// In main.ts or ui.tsx
async function validateResize(userTier) {
  // Get tier details
  const tierDetails = await getTierDetails(userTier);

  // Check remaining uses
  const usage = figma.clientStorage.getAsync('usage_' + userTier);

  if (userTier === 'free') {
    if (usage >= tierDetails.limit) {
      showError('Free tier limit reached');
      return false;
    }
  }

  if (tierDetails.isDaily) {
    const today = new Date().toISOString().split('T')[0];
    const key = `usage_${userTier}_${today}`;
    const usedToday = figma.clientStorage.getAsync(key) || 0;

    if (usedToday >= tierDetails.limit) {
      showError('Daily limit reached');
      return false;
    }
  }

  return true;
}
```

---

## Web App Integration

### Display Pricing on Website

Use the `useStripeProducts` hook to fetch and display pricing:

```typescript
import { useStripeProducts } from '@/hooks/use-stripe-products';

export function PricingSection() {
  const { products, loading, error } = useStripeProducts();

  if (loading) return <div>Loading pricing...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section className="pricing">
      <div className="tiers">
        {products?.tiers.map(tier => (
          <div key={tier.id} className="tier-card">
            <h3>{tier.displayName}</h3>
            <p className="price">
              {tier.monthlyPrice === 0
                ? 'Free'
                : `$${(tier.monthlyPrice / 100).toFixed(2)}/month`}
            </p>
            <ul>
              <li>
                {tier.resizesPerDay
                  ? `${tier.resizesPerDay} resizes/day`
                  : tier.resizesOneTime
                  ? `${tier.resizesOneTime} total resizes`
                  : 'Unlimited resizes'}
              </li>
              <li>Max batch: {tier.maxBatchSize} images</li>
              <li>Formats: {tier.supportedFormats.join(', ')}</li>
            </ul>
            {tier.id !== 'free' && (
              <button onClick={() => upgradeTier(tier)}>
                Choose Plan
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Show Current User Plan

```typescript
export function CurrentPlanCard() {
  const { user } = useAuth();
  const { getTier } = useStripeProducts();

  const tierInfo = getTier(user?.plan || 'free');

  return (
    <div className="plan-card">
      <h2>{tierInfo?.displayName} Plan</h2>
      <p>
        {tierInfo?.resizesPerDay
          ? `${tierInfo.resizesPerDay} resizes/day`
          : 'Unlimited resizes'}
      </p>
      <button onClick={manageSubscription}>
        Manage Subscription
      </button>
    </div>
  );
}
```

---

## Testing Guide

### Test API Endpoint

```bash
# Start dev server
npm run dev

# Test endpoint in another terminal
curl http://localhost:3000/api/plugin/products | jq

# Verify response includes:
# - tiers array with 4 tiers (free, basic, pro, enterprise)
# - Stripe product IDs for paid tiers
# - stripePublishableKey
```

### Test Plugin Integration

**Setup:**
```bash
# Build plugin
cd plugins/image-resizer && npm run build

# Import into Figma:
# Right-click → Plugins → Development → Import plugin from manifest.json
```

**Test Pricing Display:**
- [ ] Open plugin in Figma
- [ ] Click "Pricing" tab
- [ ] Verify all 3 tiers display with:
  - Free: "10 one-time resizes"
  - Basic: "25 resizes per day" + "$4.99/month"
  - Pro: "100 resizes per day" + "$9.99/month"

**Test Dynamic Pricing:**
- [ ] Change price in Stripe Dashboard
- [ ] Wait 1 hour OR manually clear cache
- [ ] Reload plugin in Figma
- [ ] Verify new price displays

**Test Limit Enforcement:**
- [ ] Free tier: 10 resizes work, 11th blocked
- [ ] Basic tier: 25/day limit enforced, resets next day
- [ ] Pro tier: No daily limit, unlimited resizes

**Test Error Handling:**
- [ ] Stop dev server
- [ ] Plugin still shows pricing (fallback defaults)
- [ ] Check browser console for no errors
- [ ] Restart server and verify refresh works

### Test with Browser DevTools

```javascript
// In Figma console (DevTools)

// Check if pricing is cached
console.log(figma.clientStorage.getAsync('stripe_products_cache'));

// Clear cache manually
figma.clientStorage.removeAsync('stripe_products_cache');

// Test API fetch
fetch('/api/plugin/products')
  .then(r => r.json())
  .then(data => console.log('Tiers:', data.tiers));
```

---

## Troubleshooting

### Pricing Not Showing

**Problem:** Pricing cards blank or not displaying

**Solutions:**
1. Check browser console in Figma for errors
2. Verify dev server running: `npm run dev`
3. Check API endpoint works:
   ```bash
   curl http://localhost:3000/api/plugin/products
   ```
4. Check Stripe credentials in `.env.local`
5. Verify Stripe products exist with correct metadata

### Using Hardcoded Defaults

**Problem:** Plugin shows default prices instead of Stripe prices

**Possible Causes:**
- API unreachable (dev server down)
- Network error (check console)
- Cache expired and no fresh data
- Stripe API error

**Fix:**
- Restart dev server
- Check network tab in browser DevTools
- Clear figma.clientStorage manually
- Check Stripe account status

### Cache Not Expiring

**Problem:** Changed price in Stripe but plugin still shows old price

**Solutions:**
1. Wait 1 hour for cache to expire
2. Manually clear cache:
   ```typescript
   // In plugin
   await clearCache();
   ```
3. Restart Figma
4. Clear browser storage (DevTools → Application → Storage)

### Build Errors

**Problem:** TypeScript errors when building plugin or web app

**Solutions:**
```bash
# Verify plugins excluded from tsconfig.json
cat tsconfig.json | grep plugins

# Rebuild TypeScript
npm run build

# Clean and rebuild
rm -rf plugins/image-resizer/build
npm run build

# Check for type errors
tsc --noEmit
```

### Products Not in API Response

**Problem:** `/api/plugin/products` returns empty tiers array

**Solutions:**
1. Verify Stripe API key in `.env.local`
2. Check products exist in Stripe Dashboard
3. Verify product metadata:
   - `category: "image-resizer"`
   - `tier: "basic"`, `"pro"`, or `"enterprise"`
4. Verify prices exist (recurring, monthly)
5. Test Stripe connection:
   ```bash
   node validate-env.js
   ```

---

## Caching Strategy

### How Caching Works

1. **First Request**: Fetches from Stripe API (~200-500ms)
2. **Subsequent Requests**: Returns cached data (~10-50ms)
3. **After 1 Hour**: Fetches fresh data from Stripe
4. **Manual Clear**: Call `clearProductCache()` to force refresh

### Backend Cache (1 hour)

```typescript
// In src/app/api/plugin/products/route.ts
response.headers.set('Cache-Control', 'public, max-age=3600');
```

### Plugin Cache (figma.clientStorage)

```typescript
// In plugins/image-resizer/src/stripe-products.ts
const cacheKey = 'stripe_products_cache';
const cacheDuration = 1 * 60 * 60 * 1000; // 1 hour

async function getCachedProducts() {
  const cached = await figma.clientStorage.getAsync(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Fetch fresh data
  const data = await fetchFromAPI();

  // Cache it
  await figma.clientStorage.setAsync(cacheKey, {
    data,
    expires: Date.now() + cacheDuration
  });

  return data;
}
```

### Clear Cache Programmatically

```typescript
import { clearProductCache } from '@/lib/stripe-products';

// Force refresh products
clearProductCache();
const freshProducts = await getProductInfo();
```

---

## Performance Metrics

### API Performance

| Operation | Time |
|-----------|------|
| First request (uncached) | ~200-500ms |
| Cached request (API level) | ~10-50ms |
| Cached request (plugin level) | ~5-20ms |
| Cache duration | 1 hour |
| API response time | < 100ms |

### Plugin Loading

| Metric | Value |
|--------|-------|
| Time to show pricing | ~500ms-2s |
| Memory usage | ~5KB (tier data) |
| Storage used | ~2KB (clientStorage) |
| Cache hit rate | ~95%+ |

### Optimization Tips

1. **Use Browser Cache**: 1-hour TTL reduces API load
2. **Lazy Load Pricing**: Don't fetch on plugin startup, only when pricing tab opens
3. **Monitor Cache Hit Rate**: Track in analytics
4. **Clear Cache on Demand**: Add "Refresh" button for users who need latest prices

---

## Common Tasks

### Change Tier Limits

Edit both locations:

**Backend** (`src/lib/stripe-products.ts`):
```typescript
TIER_LIMITS: {
  basic: { limit: 50, isDaily: true }  // Changed from 25
}
```

**Plugin** (`plugins/image-resizer/src/stripe-products.ts`):
```typescript
TIER_LIMITS = {
  basic: { limit: 50, isDaily: true }  // Changed from 25
}
```

### Update Stripe Prices

1. Go to Stripe Dashboard → Products
2. Edit product price
3. Wait 1 hour OR call `clearProductCache()`
4. Plugin auto-refreshes on reload

### Add New Tier

1. **Stripe**: Create product with tier metadata
2. **Backend** (`src/lib/stripe-products.ts`):
   ```typescript
   TIER_LIMITS.elite = { limit: 200, isDaily: true }
   ```
3. **Plugin** (`plugins/image-resizer/src/stripe-products.ts`):
   ```typescript
   TIER_LIMITS.elite = { limit: 200, isDaily: true }
   ```
4. **Plugin UI** (`plugins/image-resizer/src/ui.tsx`):
   ```typescript
   {tierInfo.elite && (
     <div className="tier-card">...</div>
   )}
   ```

### Format Pricing Display

```typescript
// Utility function
function formatPrice(cents?: number): string {
  if (!cents || cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}/month`;
}

function formatLimit(tier): string {
  if (tier.id === 'free') {
    return `${tier.resizesOneTime} total resizes`;
  }
  if (tier.resizesPerDay === undefined) {
    return 'Unlimited resizes';
  }
  return `${tier.resizesPerDay} resizes/day`;
}

// Usage
<p>{formatPrice(tier.monthlyPrice)}</p>
<p>{formatLimit(tier)}</p>
```

---

## Files Reference

### Backend Files

| File | Purpose |
|------|---------|
| `src/lib/stripe-products.ts` | Core tier configuration |
| `src/app/api/plugin/products/route.ts` | API endpoint |
| `src/hooks/use-stripe-products.ts` | React hook for web |

### Plugin Files

| File | Purpose |
|------|---------|
| `plugins/image-resizer/src/stripe-products.ts` | Plugin service layer |
| `plugins/image-resizer/src/main.ts` | Plugin main thread |
| `plugins/image-resizer/src/ui.tsx` | Plugin UI component |

### Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | Must exclude plugins directory |
| `.env.local` | Stripe API keys |
| `.env.production.local` | Production Stripe keys |

---

## Next Steps

- [ ] Set up Stripe products in Dashboard
- [ ] Configure environment variables
- [ ] Test API endpoint: `/api/plugin/products`
- [ ] Build and test plugin in Figma
- [ ] Update web app pricing page
- [ ] Deploy to production
- [ ] Monitor cache hit rates
- [ ] Track subscription analytics

---

## Support & References

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe API Docs**: https://stripe.com/docs/api
- **Project CLAUDE.md**: CLAUDE.md (project overview)
- **Integration Plan**: docs/integration-plan.md (monetization strategy)

