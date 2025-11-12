/**
 * Stripe Products Service for Image Resizer Plugin
 *
 * Architecture:
 * Plugin → Website API (/api/plugin/products) → Stripe API
 *
 * Why this approach?
 * - Figma plugins run in sandboxed iframe with null origin
 * - Stripe REST API blocks null-origin requests
 * - Website backend has proper domain origin whitelisted with Stripe
 * - Backend can securely use Stripe secret key
 * - This is the same implementation your website uses
 *
 * Tier Association (Plugin Limits):
 * - Free: 10 one-time resizes (never resets)
 * - Basic: 25 resizes per day
 * - Pro: 100 resizes per day
 */

export interface StripeProduct {
  id: string
  displayName: string
  monthlyPrice: number
  stripeProductId: string | null
  stripePriceId: string | null
  resizesPerDay?: number
  resizesOneTime?: number
  maxBatchSize: number
  hasApiAccess: boolean
  hasWatermark: boolean
  supportedFormats: string[]
}

export interface TierLimits {
  tier: 'free' | 'basic' | 'pro' | 'enterprise'
  displayName: string
  limit: number
  isDaily: boolean
  monthlyPrice: number
  stripeProductId: string | null
  stripePriceId: string | null
}

/**
 * Tier Limits Configuration
 * This defines the resize limits for each tier in the Figma plugin
 * These are the SOURCE OF TRUTH for how many resizes users get
 */
export const TIER_LIMITS: Record<'free' | 'basic' | 'pro' | 'enterprise', { limit: number; isDaily: boolean }> = {
  free: { limit: 10, isDaily: false }, // One-time, never resets
  basic: { limit: 25, isDaily: true }, // Per day
  pro: { limit: 100, isDaily: true }, // Per day
  enterprise: { limit: 0, isDaily: false }, // Unlimited (0 = unlimited)
}

// Cache key for storing products
const CACHE_KEY = 'stripe_products_cache'
const CACHE_TTL = 3600000 // 1 hour in milliseconds

/**
 * Determine the website API URL based on the environment
 * This is the same approach used by the website to determine its own domain
 */
function getWebsiteApiUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  // In development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'
  }

  // In production, use the current domain
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}`
}

/**
 * Fetch stripe products from the website's backend API endpoint
 *
 * The website backend:
 * 1. Uses the Stripe Node SDK with the secret key
 * 2. Fetches products and prices from Stripe
 * 3. Filters for image-resizer products
 * 4. Maps them to tier configuration
 * 5. Returns formatted data
 *
 * The plugin calls this endpoint instead of Stripe directly because:
 * - Plugin runs in sandboxed iframe with null origin
 * - Stripe API rejects null-origin requests
 * - Website backend has proper domain origin whitelisted
 */
async function fetchStripeProducts(): Promise<StripeProduct[]> {
  try {
    const apiUrl = getWebsiteApiUrl() + '/api/plugin/products'

    console.log(`[Plugin Stripe Products] Fetching from website API: ${apiUrl}`)

    // Fetch products from website API endpoint
    // This endpoint uses the server-side secret key to authenticate with Stripe
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Plugin Stripe Products] API error ${response.status}: ${errorText}`)
      throw new Error(`Website API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[Plugin Stripe Products] Fetched product info from website API:`, {
      hasTiers: !!data.tiers,
      tiersCount: data.tiers?.length || 0,
      hasError: !!data.error,
      errorMessage: data.error || data.message
    })

    // Check for API errors
    if (data.error) {
      console.error('[Plugin Stripe Products] API returned error:', data.error, data.message)
      throw new Error(data.message || data.error || 'Failed to fetch products')
    }

    // Extract tiers from the response
    if (!data.tiers || !Array.isArray(data.tiers)) {
      console.error('[Plugin Stripe Products] Invalid response format - no tiers array', data)
      throw new Error('Invalid API response: missing tiers array')
    }

    const tiers = data.tiers as Array<any>
    console.log(`[Plugin Stripe Products] Found ${tiers.length} tiers from website API`)
    
    if (tiers.length === 0) {
      console.warn('[Plugin Stripe Products] API returned empty tiers array - this might indicate no Stripe products are configured')
    }

    // Map tiers to StripeProduct format
    const mappedProducts: StripeProduct[] = tiers.map((tier: any) => {
      console.log(`[Plugin Stripe Products] Mapping tier:`, tier.id, tier.displayName)

      return {
        id: tier.id,
        displayName: tier.displayName,
        monthlyPrice: tier.monthlyPrice || 0,
        stripeProductId: tier.stripeProductId || null,
        stripePriceId: tier.stripePriceId || null,
        resizesPerDay: tier.resizesPerDay,
        resizesOneTime: tier.resizesOneTime,
        maxBatchSize: tier.maxBatchSize || 1,
        hasApiAccess: tier.hasApiAccess ?? false,
        hasWatermark: tier.hasWatermark ?? false,
        supportedFormats: tier.supportedFormats || ['jpg', 'png']
      }
    })

    console.log(`[Plugin Stripe Products] Mapped ${mappedProducts.length} products successfully`)

    return mappedProducts
  } catch (error) {
    console.error('[Plugin Stripe Products] Error fetching from website API:', error)
    // Return empty array - only display products retrieved from website
    // This will trigger fallback to default tiers
    return []
  }
}

/**
 * Get default tiers (fallback when API is unavailable)
 * These match the configuration in TIER_LIMITS
 */
function getDefaultTiers(): StripeProduct[] {
  return [
    {
      id: 'free',
      displayName: 'Free',
      monthlyPrice: 0,
      stripeProductId: null,
      stripePriceId: null,
      resizesOneTime: 10,
      maxBatchSize: 1,
      hasApiAccess: false,
      hasWatermark: true,
      supportedFormats: ['PNG', 'JPEG', 'SVG']
    },
    {
      id: 'basic',
      displayName: 'Basic',
      monthlyPrice: 499, // $4.99
      stripeProductId: null,
      stripePriceId: null,
      resizesPerDay: 25,
      maxBatchSize: 5,
      hasApiAccess: true,
      hasWatermark: false,
      supportedFormats: ['PNG', 'JPEG', 'SVG', 'WebP']
    },
    {
      id: 'pro',
      displayName: 'Pro',
      monthlyPrice: 999, // $9.99
      stripeProductId: null,
      stripePriceId: null,
      resizesPerDay: 100,
      maxBatchSize: 50,
      hasApiAccess: true,
      hasWatermark: false,
      supportedFormats: ['PNG', 'JPEG', 'SVG', 'WebP', 'GIF', 'TIFF']
    }
  ]
}

/**
 * Get cached products or fetch fresh ones
 * Uses figma.clientStorage for persistence across plugin sessions
 */
async function getCachedProducts(): Promise<StripeProduct[]> {
  try {
    // Try to get from figma.clientStorage
    if (typeof figma !== 'undefined' && figma.clientStorage) {
      const cached = await figma.clientStorage.getAsync(CACHE_KEY)

      if (cached) {
        try {
          const data = JSON.parse(cached)
          if (data.timestamp && Date.now() - data.timestamp < CACHE_TTL) {
            console.log('[Stripe Products] Using cached data')
            return data.products
          }
        } catch (parseError) {
          console.error('[Stripe Products] Error parsing cached products:', parseError)
        }
      }
    }
  } catch (storageError) {
    console.error('[Stripe Products] Error accessing clientStorage:', storageError)
  }

  // Fetch fresh products
  console.log('[Stripe Products] Fetching fresh data from API')
  const products = await fetchStripeProducts()

  // Cache the products
  try {
    if (typeof figma !== 'undefined' && figma.clientStorage) {
      await figma.clientStorage.setAsync(CACHE_KEY, JSON.stringify({
        products,
        timestamp: Date.now()
      }))
    }
  } catch (cacheError) {
    console.error('[Stripe Products] Error caching products:', cacheError)
    // Continue anyway, caching is not critical
  }

  return products
}

/**
 * Get tier information based on plan
 * Combines API data with local TIER_LIMITS configuration
 * Matches website implementation that fetches from /api/plugin/products
 */
async function getTierInfo(plan: string): Promise<TierLimits> {
  console.log(`[Plugin Stripe Products] Getting tier info for: ${plan}`)
  const products = await getCachedProducts()
  console.log(`[Plugin Stripe Products] Available products:`, products.map(p => ({ id: p.id, displayName: p.displayName })))
  const product = products.find(p => p.id === plan)

  if (!product) {
    console.warn(`[Plugin Stripe Products] Product not found for tier: ${plan}, API may be unavailable or tier not configured`)
    // Don't throw - the API should return all tiers from ALL_TIERS
    // If we can't find it, there's likely a connection issue
    throw new Error(`Product not found for tier: ${plan}`)
  }

  // Get limits from TIER_LIMITS if available, otherwise use product data
  const limits = TIER_LIMITS[plan as keyof typeof TIER_LIMITS]

  console.log(`[Plugin Stripe Products] Found product for ${plan}:`, {
    displayName: product.displayName,
    monthlyPrice: product.monthlyPrice,
    stripeProductId: product.stripeProductId,
    stripePriceId: product.stripePriceId
  })

  return {
    tier: plan as 'free' | 'basic' | 'pro',
    displayName: product.displayName,
    limit: limits?.limit || product.resizesPerDay || product.resizesOneTime || 0,
    isDaily: limits?.isDaily ?? (!!product.resizesPerDay),
    monthlyPrice: product.monthlyPrice,
    stripeProductId: product.stripeProductId,
    stripePriceId: product.stripePriceId
  }
}

/**
 * Get all available tiers with pricing and limits
 * Fetches all defined tiers from the API (matching website implementation)
 * Returns all tiers that are available in the system
 * Includes fallback tier definitions when API unavailable
 */
async function getAllTiers(): Promise<TierLimits[]> {
  try {
    console.log('[Plugin Stripe Products] Fetching all available tiers from API')

    // Get all products from Stripe (via the API endpoint)
    const products = await getCachedProducts()
    console.log(`[Plugin Stripe Products] Retrieved ${products.length} products from cache`)

    // Define all tier IDs that should be fetched
    // This mirrors the server-side ALL_TIERS configuration
    const tierIds = ['free', 'basic', 'pro', 'enterprise']

    // Try to get tier info for each tier
    const tiers: TierLimits[] = []

    for (const tierId of tierIds) {
      try {
        const tierInfo = await getTierInfo(tierId)
        tiers.push(tierInfo)
        console.log(`[Plugin Stripe Products] Successfully loaded tier: ${tierId}`)
      } catch (error) {
        console.warn(`[Plugin Stripe Products] Failed to load tier "${tierId}":`, error instanceof Error ? error.message : error)
        // Continue to next tier instead of failing completely
      }
    }

    // If we got some tiers, return them
    if (tiers.length > 0) {
      console.log(`[Plugin Stripe Products] Successfully fetched ${tiers.length} tiers`)
      return tiers
    }

    // Fallback: return default tier configuration if API returned no products
    console.warn('[Plugin Stripe Products] No tiers loaded from API, using fallback default tiers')
    return getDefaultTiers().map(product => ({
      tier: product.id as 'free' | 'basic' | 'pro' | 'enterprise',
      displayName: product.displayName,
      limit: product.resizesPerDay || product.resizesOneTime || 0,
      isDaily: !!product.resizesPerDay,
      monthlyPrice: product.monthlyPrice,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId
    }))
  } catch (error) {
    console.error('[Plugin Stripe Products] Error fetching all tiers:', error)
    // Return fallback tiers instead of empty array
    console.warn('[Plugin Stripe Products] Using fallback default tiers due to error')
    return getDefaultTiers().map(product => ({
      tier: product.id as 'free' | 'basic' | 'pro' | 'enterprise',
      displayName: product.displayName,
      limit: product.resizesPerDay || product.resizesOneTime || 0,
      isDaily: !!product.resizesPerDay,
      monthlyPrice: product.monthlyPrice,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId
    }))
  }
}

/**
 * Get resize limit for a specific plan
 * Returns the limit number (either one-time or daily)
 */
async function getResizeLimit(plan: 'free' | 'basic' | 'pro'): Promise<number> {
  const tierInfo = await getTierInfo(plan)
  return tierInfo.limit
}

/**
 * Check if limit is daily or one-time
 */
function isLimitDaily(plan: 'free' | 'basic' | 'pro'): boolean {
  return TIER_LIMITS[plan].isDaily
}

/**
 * Format price for display
 * Input: cents (e.g., 499 for $4.99)
 * Output: "$4.99"
 */
function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Get pricing display text
 * Input: plan ('free', 'basic', 'pro')
 * Output: "Free" or "$4.99/month" etc
 */
async function getPricingDisplay(plan: 'free' | 'basic' | 'pro'): Promise<string> {
  const tierInfo = await getTierInfo(plan)
  return formatPrice(tierInfo.monthlyPrice) + (tierInfo.monthlyPrice > 0 ? '/month' : '')
}

/**
 * Clear the products cache (for testing or manual refresh)
 */
async function clearCache(): Promise<void> {
  try {
    if (typeof figma !== 'undefined' && figma.clientStorage) {
      await figma.clientStorage.deleteAsync(CACHE_KEY)
      console.log('[Stripe Products] Cache cleared')
    }
  } catch (error) {
    console.error('[Stripe Products] Error clearing cache:', error)
  }
}

/**
 * Get tier description text for UI display
 */
function getTierDescription(plan: 'free' | 'basic' | 'pro'): string {
  const limits = TIER_LIMITS[plan]
  if (plan === 'free') {
    return `${limits.limit} one-time resizes`
  }
  return `${limits.limit} resizes per day`
}

/**
 * Get tier info with current usage (if applicable)
 * Useful for displaying to users in plugin UI
 */
async function getTierWithFeatures(plan: 'free' | 'basic' | 'pro'): Promise<{
  tier: TierLimits
  description: string
  pricing: string
}> {
  const tier = await getTierInfo(plan)
  const description = getTierDescription(plan)
  const pricing = await getPricingDisplay(plan)

  return {
    tier,
    description,
    pricing
  }
}

export {
  fetchStripeProducts,
  getCachedProducts,
  getTierInfo,
  getAllTiers,
  getResizeLimit,
  isLimitDaily,
  formatPrice,
  getPricingDisplay,
  getTierDescription,
  getTierWithFeatures,
  clearCache
}
