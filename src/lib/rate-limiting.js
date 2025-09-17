import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validates an API key and returns the key data if valid
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<{valid: boolean, data?: object, error?: string}>}
 */
export async function validateApiKey(apiKey) {
  try {
    if (!apiKey) {
      return {
        valid: false,
        error: 'API key is required'
      };
    }

    // Query the database to find the API key
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey);

    if (error) {
      console.error('Database error during API key validation:', error);
      return {
        valid: false,
        error: 'Database error'
      };
    }

    // Check if no API key was found
    if (!data || data.length === 0) {
      return {
        valid: false,
        error: 'Invalid API key'
      };
    }

    // Return the API key data
    return {
      valid: true,
      data: data[0]
    };

  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      valid: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Checks if the API key has exceeded its usage limit and increments usage if within limit
 * @param {string} apiKey - The API key to check
 * @returns {Promise<{allowed: boolean, error?: string, usage?: number, limit?: number}>}
 */
export async function checkAndIncrementUsage(apiKey) {
  try {
    // First validate the API key
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      return {
        allowed: false,
        error: validation.error
      };
    }

    const apiKeyData = validation.data;

    // If usage limiting is not enabled, allow the request
    if (!apiKeyData.limit_usage) {
      return {
        allowed: true,
        usage: 0,
        limit: 0
      };
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentUsage = apiKeyData.current_usage || 0;
    const monthlyLimit = Math.max(1, Math.min(10, apiKeyData.monthly_limit || 10));
    const lastResetMonth = apiKeyData.last_reset_month;

    // Check if we need to reset usage for a new month
    let newUsage;
    if (!lastResetMonth || lastResetMonth !== currentMonth) {
      // New month - reset usage to 1 (0 + 1 for this request)
      newUsage = 1;
    } else {
      // Same month - increment by 1
      newUsage = currentUsage + 1;
    }

    // Check if the new usage would exceed the limit
    if (newUsage > monthlyLimit) {
      return {
        allowed: false,
        error: `Rate limit exceeded. Usage: ${currentUsage}/${monthlyLimit} requests this month`,
        usage: currentUsage,
        limit: monthlyLimit
      };
    }
    
    // Update the usage count and reset month
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({
        current_usage: newUsage,
        last_reset_month: currentMonth,
        updated_at: new Date().toISOString()
      })
      .eq('key', apiKey);

    if (updateError) {
      console.error('Error updating API key usage:', updateError);
      return {
        allowed: false,
        error: 'Failed to update usage count'
      };
    }

    return {
      allowed: true,
      usage: newUsage,
      limit: monthlyLimit
    };

  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Gets the current usage information for an API key
 * @param {string} apiKey - The API key to check
 * @returns {Promise<{usage?: number, limit?: number, error?: string}>}
 */
export async function getUsageInfo(apiKey) {
  try {
    const validation = await validateApiKey(apiKey);
    if (!validation.valid) {
      return {
        error: validation.error
      };
    }

    const apiKeyData = validation.data;
    const currentUsage = apiKeyData.current_usage || 0;
    const monthlyLimit = Math.max(1, Math.min(10, apiKeyData.monthly_limit || 10));

    return {
      usage: currentUsage,
      limit: monthlyLimit
    };

  } catch (error) {
    console.error('Error getting usage info:', error);
    return {
      error: 'Internal server error'
    };
  }
}
