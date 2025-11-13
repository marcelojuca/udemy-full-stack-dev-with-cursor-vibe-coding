const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Setting up NextAuth.js database schema...');

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
      `,
    });

    if (usersError) {
      console.log('Users table already exists or error:', usersError.message);
    } else {
      console.log('✅ Users table created');
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
      `,
    });

    if (accountsError) {
      console.log('Accounts table already exists or error:', accountsError.message);
    } else {
      console.log('✅ Accounts table created');
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
      `,
    });

    if (sessionsError) {
      console.log('Sessions table already exists or error:', sessionsError.message);
    } else {
      console.log('✅ Sessions table created');
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
      `,
    });

    if (verificationTokensError) {
      console.log(
        'Verification tokens table already exists or error:',
        verificationTokensError.message
      );
    } else {
      console.log('✅ Verification tokens table created');
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
          monthly_limit INTEGER DEFAULT 5,
          current_usage INTEGER DEFAULT 0,
          last_reset_month VARCHAR(7),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (apiKeysError) {
      console.log('API keys table already exists or error:', apiKeysError.message);
    } else {
      console.log('✅ API keys table created');
    }

    // Add usage tracking columns to existing api_keys table if they don't exist
    const { error: addUsageColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE api_keys 
        ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_reset_month VARCHAR(7);
      `,
    });

    if (addUsageColumnsError) {
      console.log('Usage tracking columns already exist or error:', addUsageColumnsError.message);
    } else {
      console.log('✅ Usage tracking columns added to api_keys table');
    }

    // Create subscription_plans table
    const { error: plansError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          plan_slug VARCHAR(50) UNIQUE NOT NULL,
          stripe_product_id VARCHAR(255),
          stripe_price_id VARCHAR(255),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price_monthly INTEGER DEFAULT 0,
          limits JSONB NOT NULL DEFAULT '{"resizesPerDay": 2, "batchSize": 1, "isDaily": false}'::jsonb,
          features TEXT[],
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (plansError) {
      console.log('Subscription plans table already exists or error:', plansError.message);
    } else {
      console.log('✅ Subscription plans table created');
    }

    // Seed subscription plans
    const { error: seedPlansError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO subscription_plans (plan_slug, name, price_monthly, limits, features) VALUES
          ('free', 'Free', 0, '{"resizesPerDay": 2, "batchSize": 1, "isDaily": false}'::jsonb, ARRAY['basic_resize']),
          ('basic', 'Basic', 1900, '{"resizesPerDay": 4, "batchSize": 5, "isDaily": true}'::jsonb, ARRAY['batch_resize', 'aspect_ratio']),
          ('pro', 'Pro', 3500, '{"resizesPerDay": 6, "batchSize": 20, "isDaily": true}'::jsonb, ARRAY['unlimited_batch', 'priority_support']),
          ('enterprise', 'Enterprise', 0, '{"resizesPerDay": -1, "batchSize": -1, "isDaily": false}'::jsonb, ARRAY['custom_limits', 'dedicated_support'])
        ON CONFLICT (plan_slug) DO NOTHING;
      `,
    });

    if (seedPlansError) {
      console.log('Subscription plans already seeded or error:', seedPlansError.message);
    } else {
      console.log('✅ Subscription plans seeded');
    }

    // Create plugin_tokens table
    const { error: pluginTokensError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS plugin_tokens (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(500) UNIQUE NOT NULL,
          refresh_token VARCHAR(500),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_used_at TIMESTAMP WITH TIME ZONE,
          revoked BOOLEAN DEFAULT false
        );
      `,
    });

    if (pluginTokensError) {
      console.log('Plugin tokens table already exists or error:', pluginTokensError.message);
    } else {
      console.log('✅ Plugin tokens table created');
    }

    // Create plugin_usage table
    const { error: pluginUsageError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS plugin_usage (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          action VARCHAR(100) NOT NULL,
          plan VARCHAR(50),
          metadata JSONB DEFAULT '{}',
          limit_enforced BOOLEAN DEFAULT false,
          daily_count INTEGER,
          limit_remaining INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (pluginUsageError) {
      console.log('Plugin usage table already exists or error:', pluginUsageError.message);
    } else {
      console.log('✅ Plugin usage table created');
    }

    // Create daily_usage_summary table
    const { error: dailyUsageError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS daily_usage_summary (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          action VARCHAR(100) NOT NULL,
          usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
          count INTEGER DEFAULT 0,
          last_incremented TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, action, usage_date)
        );
      `,
    });

    if (dailyUsageError) {
      console.log('Daily usage summary table already exists or error:', dailyUsageError.message);
    } else {
      console.log('✅ Daily usage summary table created');
    }

    // Create increment_daily_usage function
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION increment_daily_usage(
          p_user_id UUID,
          p_action VARCHAR,
          p_date DATE DEFAULT CURRENT_DATE
        )
        RETURNS INTEGER AS $$
        DECLARE
          current_count INTEGER;
        BEGIN
          INSERT INTO daily_usage_summary (user_id, action, usage_date, count)
          VALUES (p_user_id, p_action, p_date, 1)
          ON CONFLICT (user_id, action, usage_date)
          DO UPDATE SET
            count = daily_usage_summary.count + 1,
            last_incremented = NOW()
          RETURNING count INTO current_count;

          RETURN current_count;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    if (funcError) {
      console.log('increment_daily_usage function already exists or error:', funcError.message);
    } else {
      console.log('✅ increment_daily_usage function created');
    }

    // Create user_subscriptions table
    const { error: userSubsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          plan VARCHAR(50) NOT NULL DEFAULT 'free',
          stripe_customer_id VARCHAR(255),
          stripe_subscription_id VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          limits JSONB DEFAULT '{"resizesPerDay": 2, "batchSize": 1, "isDaily": false}'::jsonb,
          current_period_start TIMESTAMP WITH TIME ZONE,
          current_period_end TIMESTAMP WITH TIME ZONE,
          payment_failed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (userSubsError) {
      console.log('User subscriptions table already exists or error:', userSubsError.message);
    } else {
      console.log('✅ User subscriptions table created');
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
        CREATE INDEX IF NOT EXISTS idx_plugin_tokens_user_id ON plugin_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_plugin_tokens_token ON plugin_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_plugin_usage_user_id ON plugin_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_plugin_usage_created_at ON plugin_usage(created_at);
        CREATE INDEX IF NOT EXISTS idx_daily_usage_user_action_date ON daily_usage_summary(user_id, action, usage_date);
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
      `,
    });

    if (indexesError) {
      console.log('Indexes already exist or error:', indexesError.message);
    } else {
      console.log('✅ Indexes created');
    }

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
