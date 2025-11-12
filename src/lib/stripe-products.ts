/**
 * Stripe Product & Pricing Configuration
 * Maps Stripe products to Figma plugin tier limits
 *
 * This module provides a centralized way to:
 * 1. Fetch Stripe products and prices
 * 2. Define tier-based limits (resizes, features, etc.)
 * 3. Associate API tiers with Stripe products
 * 4. Retrieve tier info for both web and plugin
 */

import Stripe from 'stripe';

// Initialize Stripe client (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * Tier configuration mapping Stripe products to feature limits
 * These define what users can do based on their subscription tier
 */
export interface TierConfig {
  id: string;
  name: string;
  displayName: string;
  resizesPerDay?: number;        // Daily limit (null = unlimited)
  resizesOneTime?: number;       // One-time resizes (for free tier)
  maxBatchSize: number;          // Max images per batch operation
  supportedFormats: string[];    // Image formats allowed
  maxImageSize: number;          // Max file size in MB
  hasWatermark: boolean;         // Add watermark to output
  hasApiAccess: boolean;         // Can generate API keys
  hasTeamSupport: boolean;       // Team features
  hasAnalytics: boolean;         // Usage analytics
  supportLevel: 'community' | 'email' | 'priority';
  stripeProductId?: string;      // Stripe product ID (if paid)
  stripePriceId?: string;        // Stripe price ID (if paid)
  monthlyPrice?: number;         // Price in cents (e.g., 499 = $4.99)
  yearlyPrice?: number;          // Yearly price in cents
}

/**
 * Free tier configuration
 * One-time 10 resizes to encourage signup and try the plugin
 */
export const FREE_TIER: TierConfig = {
  id: 'free',
  name: 'free',
  displayName: 'Free',
  resizesOneTime: 10,            // 10 one-time resizes (total, not daily)
  maxBatchSize: 1,
  supportedFormats: ['jpg', 'png'],
  maxImageSize: 5,
  hasWatermark: true,
  hasApiAccess: false,
  hasTeamSupport: false,
  hasAnalytics: false,
  supportLevel: 'community',
  monthlyPrice: 0,
};

/**
 * Basic tier configuration
 * 25 resizes per day, perfect for individual freelancers
 */
export const BASIC_TIER: TierConfig = {
  id: 'basic',
  name: 'basic',
  displayName: 'Basic',
  resizesPerDay: 25,             // 25 resizes per calendar day
  maxBatchSize: 5,
  supportedFormats: ['jpg', 'png', 'webp'],
  maxImageSize: 10,
  hasWatermark: false,
  hasApiAccess: true,            // Can generate API keys
  hasTeamSupport: false,
  hasAnalytics: true,
  supportLevel: 'email',
  monthlyPrice: 499,             // $4.99/month
  yearlyPrice: 4490,             // $44.90/year (20% off)
  // stripeProductId and stripePriceId populated from Stripe
};

/**
 * Pro tier configuration
 * 100 resizes per day, for power users and small teams
 */
export const PRO_TIER: TierConfig = {
  id: 'pro',
  name: 'pro',
  displayName: 'Pro',
  resizesPerDay: 100,            // 100 resizes per calendar day
  maxBatchSize: 25,
  supportedFormats: ['jpg', 'png', 'webp', 'svg', 'pdf'],
  maxImageSize: 25,
  hasWatermark: false,
  hasApiAccess: true,
  hasTeamSupport: true,          // Team features
  hasAnalytics: true,
  supportLevel: 'priority',
  monthlyPrice: 999,             // $9.99/month
  yearlyPrice: 8990,             // $89.90/year (25% off)
  // stripeProductId and stripePriceId populated from Stripe
};

/**
 * Enterprise tier configuration
 * Unlimited resizes per day, custom integrations, dedicated support
 */
export const ENTERPRISE_TIER: TierConfig = {
  id: 'enterprise',
  name: 'enterprise',
  displayName: 'Enterprise',
  resizesPerDay: undefined,      // Unlimited
  maxBatchSize: 100,
  supportedFormats: ['jpg', 'png', 'webp', 'svg', 'pdf', 'avif'],
  maxImageSize: 50,
  hasWatermark: false,
  hasApiAccess: true,
  hasTeamSupport: true,
  hasAnalytics: true,
  supportLevel: 'priority',
  monthlyPrice: 2499,            // $24.99/month
  yearlyPrice: 22490,            // $224.90/year (25% off)
  // stripeProductId and stripePriceId populated from Stripe
};

/**
 * All tiers in order
 */
export const ALL_TIERS: TierConfig[] = [FREE_TIER, BASIC_TIER, PRO_TIER, ENTERPRISE_TIER];

/**
 * Get tier config by ID
 */
export function getTierById(tierId: string): TierConfig | null {
  return ALL_TIERS.find(tier => tier.id === tierId) || null;
}

/**
 * Get tier config by Stripe product ID
 * Useful when receiving webhook events from Stripe
 */
export function getTierByStripeProductId(productId: string): TierConfig | null {
  return ALL_TIERS.find(tier => tier.stripeProductId === productId) || null;
}

/**
 * Interface for product cache (stores fetched Stripe products)
 */
interface StripeProductCache {
  products: Stripe.Product[];
  prices: Stripe.Price[];
  lastFetched: number;
  ttl: number; // Time to live in milliseconds
}

// In-memory cache for Stripe products (expires after 1 hour)
let productCache: StripeProductCache | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch all Stripe products and prices
 * Caches results for 1 hour to reduce API calls
 */
export async function fetchStripeProducts(): Promise<{
  products: Stripe.Product[];
  prices: Stripe.Price[];
}> {
  // Return cached data if still valid
  if (productCache && Date.now() - productCache.lastFetched < productCache.ttl) {
    return {
      products: productCache.products,
      prices: productCache.prices,
    };
  }

  try {
    // Fetch all active products for image resizer
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });

    console.log(`[Stripe Products] Fetched ${products.data.length} total active products from Stripe`);

    // Filter for image resizer products
    // Check multiple criteria:
    // 1. Tags array contains 'image-resizer' (most common way to tag products)
    // 2. Metadata category equals 'image-resizer'
    // 3. Name pattern matching as fallback
    const imageResizerProducts = products.data.filter(
      p => {
        // Check tags (Stripe products have tags array, but TypeScript types may not include it)
        const tags = (p as any).tags as string[] | undefined;
        const hasTag = Array.isArray(tags) && tags.includes('image-resizer');
        const hasCategory = p.metadata?.category === 'image-resizer';
        const matchesNamePattern = p.name?.toLowerCase().includes('image resizer') || 
                                   p.name?.toLowerCase().includes('image-resizer');
        return hasTag || hasCategory || matchesNamePattern;
      }
    );

    console.log(`[Stripe Products] Found ${imageResizerProducts.length} image-resizer products`);
    if (imageResizerProducts.length > 0) {
      imageResizerProducts.forEach(p => {
        const tags = (p as any).tags as string[] | undefined;
        const tagsStr = Array.isArray(tags) ? tags.join(', ') : 'N/A';
        console.log(`  - ${p.name} (${p.id}) - tags: [${tagsStr}], category: ${p.metadata?.category || 'N/A'}, tier: ${p.metadata?.tier || 'N/A'}`);
      });
    } else {
      console.warn(`[Stripe Products] No image-resizer products found. Make sure products are tagged with 'image-resizer' or have metadata.category='image-resizer'`);
    }

    // Fetch all prices for those products
    const pricesList = await stripe.prices.list({
      limit: 100,
      active: true,
    });

    // Filter for recurring prices on our products (both monthly and yearly)
    const relevantPrices = pricesList.data.filter(
      p =>
        p.recurring &&
        imageResizerProducts.some(product => product.id === p.product)
    );

    console.log(`[Stripe Products] Found ${relevantPrices.length} recurring prices for image-resizer products`);
    if (relevantPrices.length > 0) {
      relevantPrices.forEach(p => {
        const product = imageResizerProducts.find(prod => prod.id === p.product);
        console.log(`  - Price ${p.id}: $${(p.unit_amount || 0) / 100}/${p.recurring?.interval} for ${product?.name} (tier: ${p.metadata?.tier || 'N/A'})`);
      });
    }

    // Cache the results
    productCache = {
      products: imageResizerProducts,
      prices: relevantPrices,
      lastFetched: Date.now(),
      ttl: CACHE_TTL,
    };

    return {
      products: imageResizerProducts,
      prices: relevantPrices,
    };
  } catch (error) {
    console.error('[Stripe Products] Error fetching Stripe products:', error);
    // Return empty results on error instead of throwing
    return {
      products: [],
      prices: [],
    };
  }
}

/**
 * Get product info including tiers
 * This is what the plugin should call to get all available tiers
 * Falls back to local tier configuration if Stripe products are not found
 */
export async function getProductInfo(): Promise<{
  tiers: TierConfig[];
  stripePublishableKey: string;
}> {
  // Fetch latest Stripe data
  const { products, prices } = await fetchStripeProducts();

  // Update tier configs with Stripe product/price IDs
  const updatedTiers = ALL_TIERS.map(tier => {
    if (tier.id === 'free') return tier; // Free tier has no Stripe product

    // Find matching product by multiple strategies:
    // 1. Exact tier match in metadata (most reliable)
    // 2. Name contains tier name
    // 3. Name contains display name
    const product = products.find(
      p =>
        p.metadata?.tier === tier.id ||
        p.name?.toLowerCase().includes(tier.name.toLowerCase()) ||
        p.name?.toLowerCase().includes(tier.displayName.toLowerCase())
    );

    if (product) {
      console.log(`[Stripe Products] Matched tier "${tier.id}" to product "${product.name}" (${product.id})`);

      // Find monthly price (preferred)
      let price = prices.find(
        p =>
          p.product === product.id &&
          p.recurring?.interval === 'month' &&
          (p.metadata?.tier === tier.id || !p.metadata?.tier) // Match tier metadata if present, or accept if not set
      );

      // If no monthly price with tier metadata, try without metadata requirement
      if (!price) {
        price = prices.find(
          p =>
            p.product === product.id &&
            p.recurring?.interval === 'month'
        );
      }

      // Also find yearly price if available
      const yearlyPrice = prices.find(
        p =>
          p.product === product.id &&
          p.recurring?.interval === 'year' &&
          (p.metadata?.tier === tier.id || !p.metadata?.tier)
      );

      if (price) {
        console.log(`[Stripe Products] Found monthly price for "${tier.id}": ${price.id} ($${(price.unit_amount || 0) / 100})`);
      } else {
        console.warn(`[Stripe Products] No monthly price found for tier "${tier.id}" (product: ${product.name})`);
      }

      if (yearlyPrice) {
        console.log(`[Stripe Products] Found yearly price for "${tier.id}": ${yearlyPrice.id} ($${(yearlyPrice.unit_amount || 0) / 100})`);
      }

      return {
        ...tier,
        stripeProductId: product.id,
        stripePriceId: price?.id,
        // Update yearly price if found
        yearlyPrice: yearlyPrice ? (yearlyPrice.unit_amount || undefined) : tier.yearlyPrice,
      };
    } else {
      console.warn(`[Stripe Products] No Stripe product found for tier "${tier.id}", using local configuration`);
    }

    // Return tier with local config if no Stripe product found
    return tier;
  });

  // If no products were found from Stripe, log a warning but still return tiers
  // This allows the plugin to work with local tier configuration as fallback
  if (products.length === 0) {
    console.warn('[Stripe Products] No image-resizer products found in Stripe - using local tier configuration');
  }

  return {
    tiers: updatedTiers,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  };
}

/**
 * Get tier info for API key validation
 * Called when plugin authenticates with an API key
 */
export async function getTierInfoForApiKey(apiKeyTier: string): Promise<TierConfig | null> {
  const tier = getTierById(apiKeyTier);
  if (!tier) return null;

  // For paid tiers, verify Stripe product still exists
  if (tier.stripeProductId) {
    const { products } = await fetchStripeProducts();
    const product = products.find(p => p.id === tier.stripeProductId);
    if (!product) {
      console.warn(`Stripe product not found for tier: ${apiKeyTier}`);
      return null;
    }
  }

  return tier;
}

/**
 * Get resize limit for a tier
 * Returns daily limit, or total one-time limit for free tier
 */
export function getResizeLimit(tier: TierConfig): {
  type: 'daily' | 'oneTime' | 'unlimited';
  limit?: number;
} {
  if (tier.id === 'free') {
    return {
      type: 'oneTime',
      limit: tier.resizesOneTime,
    };
  }

  if (tier.resizesPerDay === undefined) {
    return {
      type: 'unlimited',
    };
  }

  return {
    type: 'daily',
    limit: tier.resizesPerDay,
  };
}

/**
 * Format price for display
 */
export function formatPrice(cents?: number): string {
  if (!cents) return 'Free';
  return `$${(cents / 100).toFixed(2)}/month`;
}

/**
 * Clear the product cache (useful for testing or manual refresh)
 */
export function clearProductCache(): void {
  productCache = null;
}
