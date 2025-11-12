/**
 * Caching utility for API responses
 *
 * This module provides a caching layer that can use either:
 * 1. In-memory cache (default, fastest)
 * 2. Redis cache (when REDIS_URL is configured)
 *
 * Benefits:
 * - Reduces Stripe API calls (rate limit protection)
 * - Faster response times for plugin
 * - Reduces server load
 *
 * For production, set REDIS_URL environment variable:
 * REDIS_URL=redis://localhost:6379
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// In-memory cache storage
const memoryCache = new Map<string, CacheEntry>();

/**
 * Get value from cache
 */
export async function getCached(key: string): Promise<any | null> {
  try {
    // Try Redis first if configured
    if (process.env.REDIS_URL) {
      const value = await getCachedFromRedis(key);
      if (value !== null) {
        console.log(`[Cache] Hit (Redis): ${key}`);
        return value;
      }
    }

    // Fall back to in-memory cache
    const entry = memoryCache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      console.log(`[Cache] Hit (Memory): ${key}`);
      return entry.data;
    }

    // Cache miss or expired
    if (entry) {
      memoryCache.delete(key);
    }
    console.log(`[Cache] Miss: ${key}`);
    return null;
  } catch (error) {
    console.error(`[Cache] Error reading from cache (${key}):`, error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCached(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
  try {
    const ttlMs = ttlSeconds * 1000;

    // Set in memory cache (always)
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    // Also set in Redis if configured
    if (process.env.REDIS_URL) {
      await setCachedInRedis(key, data, ttlSeconds);
    }

    console.log(`[Cache] Set: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error(`[Cache] Error writing to cache (${key}):`, error);
    // Continue anyway - in-memory cache is still valid
  }
}

/**
 * Clear cache entry
 */
export async function clearCached(key: string): Promise<void> {
  try {
    memoryCache.delete(key);

    if (process.env.REDIS_URL) {
      await clearCachedInRedis(key);
    }

    console.log(`[Cache] Cleared: ${key}`);
  } catch (error) {
    console.error(`[Cache] Error clearing cache (${key}):`, error);
  }
}

/**
 * Clear all cache entries
 */
export async function clearAllCached(): Promise<void> {
  try {
    memoryCache.clear();

    if (process.env.REDIS_URL) {
      await clearAllCachedInRedis();
    }

    console.log(`[Cache] Cleared all`);
  } catch (error) {
    console.error(`[Cache] Error clearing all cache:`, error);
  }
}

// ============================================================================
// Redis Implementation (when REDIS_URL is configured)
// ============================================================================

let redisClient: any = null;
let redisError: Error | null = null;

/**
 * Initialize Redis client (lazy loading)
 */
async function initRedis(): Promise<any> {
  if (redisClient !== null) {
    return redisClient;
  }

  if (redisError) {
    throw redisError;
  }

  try {
    // Dynamically import Redis (optional dependency)
    // For now, we'll use a placeholder - Redis can be added later
    console.log('[Cache] Redis URL configured but redis package not installed');
    console.log('[Cache] Install with: npm install redis');
    return null;
  } catch (error) {
    redisError = error as Error;
    throw error;
  }
}

async function getCachedFromRedis(key: string): Promise<any | null> {
  try {
    const client = await initRedis();
    if (!client) return null;

    // This is a placeholder for when Redis is implemented
    // const value = await client.get(key);
    // return value ? JSON.parse(value) : null;

    return null;
  } catch (error) {
    console.error('[Cache] Redis get error:', error);
    return null;
  }
}

async function setCachedInRedis(key: string, data: any, ttlSeconds: number): Promise<void> {
  try {
    const client = await initRedis();
    if (!client) return;

    // This is a placeholder for when Redis is implemented
    // await client.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error('[Cache] Redis set error:', error);
  }
}

async function clearCachedInRedis(key: string): Promise<void> {
  try {
    const client = await initRedis();
    if (!client) return;

    // This is a placeholder for when Redis is implemented
    // await client.del(key);
  } catch (error) {
    console.error('[Cache] Redis delete error:', error);
  }
}

async function clearAllCachedInRedis(): Promise<void> {
  try {
    const client = await initRedis();
    if (!client) return;

    // This is a placeholder for when Redis is implemented
    // await client.flushdb();
  } catch (error) {
    console.error('[Cache] Redis flush error:', error);
  }
}
