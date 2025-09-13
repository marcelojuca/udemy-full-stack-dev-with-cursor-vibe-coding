import { NextResponse } from 'next/server';
import { validateApiKey } from '../../../lib/rateLimiting';

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Use the reusable validation function
    const validation = await validateApiKey(apiKey);

    if (!validation.valid) {
      const statusCode = validation.error === 'Invalid API key' ? 401 : 500;
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: statusCode }
      );
    }

    // API key is valid, return the key data (excluding the actual key for security)
    const { key, ...keyData } = validation.data;
    
    return NextResponse.json({
      valid: true,
      apiKeyData: {
        ...keyData,
        key: validation.data.key // Include the key for the protected page
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
