/**
 * GET /api/plugin/products
 * Public endpoint that returns all available Stripe products and tier configurations
 * Used by both the Figma plugin and the pricing page
 * No authentication required - this is public product information
 *
 * Caching Strategy:
 * - Client-side: HTTP cache headers (3600s)
 * - Server-side: In-memory cache (1 hour) + optional Redis
 * - Reduces Stripe API calls significantly
 */

import { getProductInfo, clearProductCache } from '@/lib/stripe-products';
import { getCached, setCached, clearCached } from '@/lib/cache';

const CACHE_KEY = 'plugin:products:all';
const CACHE_TTL = 3600; // 1 hour

export async function GET(request: Request) {
  try {
    // Check for cache bypass query parameter (useful for testing after adding products)
    const url = new URL(request.url);
    const bypassCache = url.searchParams.get('refresh') === 'true';

    if (bypassCache) {
      console.log('[API] Cache bypass requested, clearing all caches and fetching fresh data');
      await clearCached(CACHE_KEY);
      clearProductCache(); // Also clear in-memory cache in stripe-products.ts
    }

    // Try to get from cache first
    let productInfo = await getCached(CACHE_KEY);

    if (!productInfo) {
      // Cache miss - fetch from Stripe
      console.log('[API] Cache miss, fetching from Stripe');
      productInfo = await getProductInfo();

      // Store in cache for future requests
      await setCached(CACHE_KEY, productInfo, CACHE_TTL);
    } else {
      console.log('[API] Cache hit');
    }

    // Return with cache headers
    // Client cache: 1 hour
    // CDN cache: 30 minutes (if behind CDN like Vercel)
    return Response.json(productInfo, {
      headers: {
        'Cache-Control': bypassCache ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600, s-maxage=1800',
        'Content-Type': 'application/json',
        'X-Cache-Hit': productInfo ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('[API] Error fetching product info:', error);
    return Response.json(
      {
        error: 'Failed to fetch product information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
