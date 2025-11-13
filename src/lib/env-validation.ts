/**
 * Environment Variable Validation Utilities
 *
 * Validates required environment variables at runtime (not build time)
 * to allow builds to succeed while ensuring runtime safety.
 */

/**
 * Checks if a value is a placeholder (used during build time)
 */
function isPlaceholder(value: string | undefined, type: 'supabase' | 'stripe' = 'supabase'): boolean {
  if (!value) return true;
  
  const placeholders = {
    supabase: {
      url: 'https://placeholder.supabase.co',
      key: 'placeholder-anon-key',
      serviceKey: 'placeholder-service-key',
    },
    stripe: {
      secretKey: 'sk_test_placeholder_key_for_build_time_only',
    },
  };
  
  if (type === 'supabase') {
    return (
      value === placeholders.supabase.url ||
      value === placeholders.supabase.key ||
      value === placeholders.supabase.serviceKey
    );
  }
  
  if (type === 'stripe') {
    return value === placeholders.stripe.secretKey;
  }
  
  return false;
}

/**
 * Validates Supabase environment variables at runtime
 * @throws {Error} If required Supabase env vars are missing or are placeholders
 */
export function validateSupabaseEnv(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || isPlaceholder(supabaseUrl, 'supabase')) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
      'Please set this variable in your environment configuration.'
    );
  }

  if (!supabaseAnonKey || isPlaceholder(supabaseAnonKey, 'supabase')) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please set this variable in your environment configuration.'
    );
  }

  if (!supabaseServiceKey || isPlaceholder(supabaseServiceKey, 'supabase')) {
    throw new Error(
      'Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY. ' +
      'Please set this variable in your environment configuration.'
    );
  }
}

/**
 * Validates Stripe environment variables at runtime
 * @throws {Error} If required Stripe env vars are missing or are placeholders
 */
export function validateStripeEnv(): void {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey || isPlaceholder(stripeSecretKey, 'stripe')) {
    throw new Error(
      'Missing required environment variable: STRIPE_SECRET_KEY. ' +
      'Please set this variable in your environment configuration.'
    );
  }
}

/**
 * Validates all required environment variables at runtime
 * @throws {Error} If any required env vars are missing or are placeholders
 */
export function validateAllEnvVars(): void {
  validateSupabaseEnv();
  validateStripeEnv();
  
  // Add other validations as needed
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret || nextAuthSecret.length < 32) {
    throw new Error(
      'Missing or invalid environment variable: NEXTAUTH_SECRET. ' +
      'Must be at least 32 characters long.'
    );
  }
  
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl) {
    throw new Error(
      'Missing required environment variable: NEXTAUTH_URL. ' +
      'Please set this variable in your environment configuration.'
    );
  }
}

