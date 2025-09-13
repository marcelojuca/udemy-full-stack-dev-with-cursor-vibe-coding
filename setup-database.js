const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Setting up NextAuth.js database schema...')
    
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          email_verified TIMESTAMP WITH TIME ZONE,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (usersError) {
      console.log('Users table already exists or error:', usersError.message)
    } else {
      console.log('✅ Users table created')
    }

    // Create accounts table
    const { error: accountsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(255) NOT NULL,
          provider VARCHAR(255) NOT NULL,
          provider_account_id VARCHAR(255) NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type VARCHAR(255),
          scope VARCHAR(255),
          id_token TEXT,
          session_state VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(provider, provider_account_id)
        );
      `
    })
    
    if (accountsError) {
      console.log('Accounts table already exists or error:', accountsError.message)
    } else {
      console.log('✅ Accounts table created')
    }

    // Create sessions table
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (sessionsError) {
      console.log('Sessions table already exists or error:', sessionsError.message)
    } else {
      console.log('✅ Sessions table created')
    }

    // Create verification_tokens table
    const { error: verificationTokensError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS verification_tokens (
          identifier VARCHAR(255) NOT NULL,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (identifier, token)
        );
      `
    })
    
    if (verificationTokensError) {
      console.log('Verification tokens table already exists or error:', verificationTokensError.message)
    } else {
      console.log('✅ Verification tokens table created')
    }

    // Create api_keys table
    const { error: apiKeysError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS api_keys (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          key VARCHAR(255) UNIQUE NOT NULL,
          permissions JSONB DEFAULT '[]',
          key_type VARCHAR(50) DEFAULT 'development',
          limit_usage BOOLEAN DEFAULT false,
          monthly_limit INTEGER DEFAULT 1000,
          current_usage INTEGER DEFAULT 0,
          last_reset_month VARCHAR(7),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (apiKeysError) {
      console.log('API keys table already exists or error:', apiKeysError.message)
    } else {
      console.log('✅ API keys table created')
    }

    // Add usage tracking columns to existing api_keys table if they don't exist
    const { error: addUsageColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE api_keys 
        ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_reset_month VARCHAR(7);
      `
    })
    
    if (addUsageColumnsError) {
      console.log('Usage tracking columns already exist or error:', addUsageColumnsError.message)
    } else {
      console.log('✅ Usage tracking columns added to api_keys table')
    }

    // Create indexes
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
        CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
      `
    })
    
    if (indexesError) {
      console.log('Indexes already exist or error:', indexesError.message)
    } else {
      console.log('✅ Indexes created')
    }

    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()
