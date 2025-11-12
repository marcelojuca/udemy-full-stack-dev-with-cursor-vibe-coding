# Stripe Products Retrieval Check & Improvements

## Summary

I've analyzed the Figma plugin's Stripe product retrieval system and made improvements to ensure all products are properly retrieved.

## Issues Found

### 1. **Overly Restrictive Filtering**
- **Problem**: Products were only retrieved if they had `metadata.category === 'image-resizer'`
- **Impact**: Products without this exact metadata would be missed
- **Fix**: Added fallback to also match products by name pattern (`image resizer` or `image-resizer`)

### 2. **Strict Price Matching**
- **Problem**: Price matching required both `metadata.tier` to match AND be monthly interval
- **Impact**: Prices without tier metadata or yearly prices might not be matched
- **Fix**: Made matching more flexible - tries exact match first, then falls back to any monthly price for the product

### 3. **Missing Yearly Prices**
- **Problem**: Only monthly prices were retrieved and matched
- **Impact**: Yearly pricing options weren't available
- **Fix**: Now retrieves and matches yearly prices as well

### 4. **Limited Product Matching**
- **Problem**: Only matched by name contains or metadata.tier
- **Impact**: Products with different naming might not match
- **Fix**: Added multiple matching strategies:
  1. Exact tier match in metadata (most reliable)
  2. Name contains tier name (e.g., "basic")
  3. Name contains display name (e.g., "Basic")

### 5. **No Logging/Debugging**
- **Problem**: Hard to diagnose why products weren't being retrieved
- **Impact**: Difficult to troubleshoot issues
- **Fix**: Added comprehensive console logging to track:
  - Total products fetched
  - Filtered products found
  - Product details (name, ID, metadata)
  - Price details
  - Matching results for each tier

## Improvements Made

### Enhanced `fetchStripeProducts()` Function
- ✅ Added fallback name pattern matching
- ✅ Retrieves both monthly and yearly prices
- ✅ Comprehensive logging of all products and prices found

### Enhanced `getProductInfo()` Function
- ✅ Multiple product matching strategies
- ✅ Flexible price matching (with and without metadata)
- ✅ Yearly price support
- ✅ Detailed logging for each tier match

## How to Verify

### Option 1: Run the Diagnostic Script
```bash
node check-stripe-products.js
```

This script will:
- Show all products in your Stripe account
- Show which ones match the filtering criteria
- Test the matching logic for each tier
- Identify any missing products or prices

### Option 2: Check Server Logs
When the API endpoint `/api/plugin/products` is called, you'll now see detailed logs:
```
[Stripe Products] Fetched X total active products from Stripe
[Stripe Products] Found X image-resizer products
  - Product Name (prod_xxx) - category: image-resizer, tier: basic
[Stripe Products] Found X recurring prices for image-resizer products
  - Price price_xxx: $4.99/month for Product Name (tier: basic)
[Stripe Products] Matched tier "basic" to product "Image Resizer - Basic" (prod_xxx)
[Stripe Products] Found monthly price for "basic": price_xxx ($4.99)
```

### Option 3: Test the API Endpoint
```bash
curl http://localhost:3000/api/plugin/products
```

Check the response to ensure all tiers have `stripeProductId` and `stripePriceId` populated (except free tier).

## Expected Behavior

The plugin should now retrieve:
- ✅ All 4 tiers (free, basic, pro, enterprise)
- ✅ Stripe product IDs for paid tiers (if products exist in Stripe)
- ✅ Monthly price IDs for paid tiers
- ✅ Yearly price IDs (if available)

## Required Stripe Product Setup

For products to be retrieved, they should have:

**Option 1 (Recommended):**
```
Name: Image Resizer - Basic (or Pro, Enterprise)
Metadata:
  category: image-resizer
  tier: basic (or pro, enterprise)
```

**Option 2 (Fallback):**
```
Name: Must contain "image resizer" or "image-resizer" and tier name
(e.g., "Image Resizer Basic", "Image Resizer Pro")
```

**Prices:**
- Must be recurring (monthly or yearly)
- Should have `metadata.tier` matching the tier (optional but recommended)

## Next Steps

1. **Run the diagnostic script** to see current state:
   ```bash
   node check-stripe-products.js
   ```

2. **Check server logs** when the plugin calls the API to see what's being retrieved

3. **Verify Stripe products** match the expected format (see above)

4. **Test the plugin** to ensure it receives all tier information

## Notes

- The plugin will always receive all 4 tiers (free, basic, pro, enterprise) even if Stripe products aren't found
- If Stripe products aren't matched, tiers will still work but won't have `stripeProductId`/`stripePriceId` populated
- The free tier never has Stripe products (it's free)
- Caching is still in place (1 hour TTL) to reduce API calls

