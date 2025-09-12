import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth-helpers';
import { supabaseAdmin } from '../../../../lib/supabase';

// GET /api/api-keys/[id] - Fetch a specific API key for authenticated user
export async function GET(request, { params }) {
  try {
    const { userId, error } = await requireAuth(request);
    if (error) return error;

    const { id } = params;
    const { data, error: dbError } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching API key:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch API key' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/api-keys/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    );
  }
}

// PUT /api/api-keys/[id] - Update a specific API key for authenticated user
export async function PUT(request, { params }) {
  try {
    const { userId, error } = await requireAuth(request);
    if (error) return error;

    const { id } = params;
    const body = await request.json();
    const { name, description, permissions, keyType, limitUsage, monthlyLimit } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Update the API key
    const updates = {
      name,
      description: description || '',
      permissions: permissions || [],
      key_type: keyType || 'development',
      limit_usage: limitUsage || false,
      monthly_limit: monthlyLimit || 1000
    };

    const { data, error: dbError } = await supabaseAdmin
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (dbError) {
      console.error('Error updating API key:', dbError);
      return NextResponse.json(
        { error: 'Failed to update API key' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('PUT /api/api-keys/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys/[id] - Delete a specific API key for authenticated user
export async function DELETE(request, { params }) {
  try {
    const { userId, error } = await requireAuth(request);
    if (error) return error;

    const { id } = params;
    const { data, error: dbError } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (dbError) {
      console.error('Error deleting API key:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'API key deleted successfully', deletedKey: data[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/api-keys/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
