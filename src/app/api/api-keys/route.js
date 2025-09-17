
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth-helpers';
import { supabaseAdmin } from '../../../lib/supabase';

// GET /api/api-keys - Fetch all API keys for authenticated user
export async function GET(request) {
  try {
    const { userId, error } = await requireAuth(request);
    if (error) return error;

    const { data, error: dbError } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Error fetching API keys:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /api/api-keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key for authenticated user
export async function POST(request) {
  try {
    const { userId, error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { name, description, permissions, keyType } = body;

    // Enforce usage limiting defaults and caps
    const parsedLimitUsage = true; // always limit usage for created keys
    // Default to 5, clamp to [1, 10]
    const requestedMonthlyLimit = typeof body.monthlyLimit === 'number' ? body.monthlyLimit : undefined;
    const defaultMonthlyLimit = 5;
    const maxMonthlyLimit = 10;
    const minMonthlyLimit = 1;
    const effectiveMonthlyLimit = Math.max(
      minMonthlyLimit,
      Math.min(maxMonthlyLimit, requestedMonthlyLimit ?? defaultMonthlyLimit)
    );

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate a new API key
    const generateApiKey = () => {
      const prefix = keyType === 'production' ? 'prod_sk_' : 'dev_sk_';
      const randomString = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
      return prefix + randomString;
    };

    const newApiKey = {
      user_id: userId,
      name,
      description: description || '',
      key: generateApiKey(),
      permissions: permissions || [],
      key_type: keyType || 'development',
      limit_usage: parsedLimitUsage,
      monthly_limit: effectiveMonthlyLimit
    };

    const { data, error: dbError } = await supabaseAdmin
      .from('api_keys')
      .insert([newApiKey])
      .select()
      .single();

    if (dbError) {
      console.error('Error creating API key:', dbError);
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('POST /api/api-keys error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
