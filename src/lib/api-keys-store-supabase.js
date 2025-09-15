import { supabaseAdmin } from './supabase';

export const getApiKeys = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getApiKeys:', error);
    throw error;
  }
};

export const addApiKey = async (apiKey) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert([apiKey])
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addApiKey:', error);
    throw error;
  }
};

export const updateApiKey = async (id, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating API key:', error);
      throw error;
    }

    // Return the first (and should be only) updated record, or null if none found
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in updateApiKey:', error);
    throw error;
  }
};

export const deleteApiKey = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }

    // Return the first (and should be only) deleted record, or null if none found
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in deleteApiKey:', error);
    throw error;
  }
};

export const getApiKeyById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error fetching API key by ID:', error);
      throw error;
    }

    // Return the first (and should be only) API key, or null if none found
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getApiKeyById:', error);
    throw error;
  }
};
