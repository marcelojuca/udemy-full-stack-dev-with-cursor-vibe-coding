'use client';

/**
 * API Keys Service - Handles all CRUD operations for API keys
 * Uses NextAuth session for authentication
 */

// Base API URL
const API_BASE = '/api/api-keys';

/**
 * Get all API keys for the authenticated user
 * @returns {Promise<Array>} Array of API keys
 */
export async function getApiKeys() {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch API keys');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw error;
  }
}

/**
 * Get a specific API key by ID
 * @param {string} id - API key ID
 * @returns {Promise<Object>} API key data
 */
export async function getApiKey(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch API key');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw error;
  }
}

/**
 * Create a new API key
 * @param {Object} apiKeyData - API key data
 * @param {string} apiKeyData.name - API key name
 * @param {string} [apiKeyData.description] - API key description
 * @param {Array} [apiKeyData.permissions] - Array of permissions
 * @param {string} [apiKeyData.keyType] - Key type (development/production)
 * @param {boolean} [apiKeyData.limitUsage] - Whether to limit usage
 * @param {number} [apiKeyData.monthlyLimit] - Monthly usage limit
 * @returns {Promise<Object>} Created API key data
 */
export async function createApiKey(apiKeyData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiKeyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create API key');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

/**
 * Update an existing API key
 * @param {string} id - API key ID
 * @param {Object} apiKeyData - Updated API key data
 * @returns {Promise<Object>} Updated API key data
 */
export async function updateApiKey(id, apiKeyData) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiKeyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update API key');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
}

/**
 * Delete an API key
 * @param {string} id - API key ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteApiKey(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete API key');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
}

/**
 * Validate an API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateApiKey(apiKey) {
  try {
    const response = await fetch('/api/validate-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to validate API key');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating API key:', error);
    throw error;
  }
}
