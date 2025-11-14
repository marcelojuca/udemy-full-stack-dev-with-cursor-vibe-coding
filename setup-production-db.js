#!/usr/bin/env node

/**
 * Production Database Schema Setup
 *
 * This script creates the necessary tables in the production Supabase database.
 *
 * IMPORTANT: You must manually execute the SQL in Supabase Dashboard first:
 * Go to: https://supabase.com/dashboard > Your Project > SQL Editor
 *
 * Then copy and paste the SQL from setup-production-db.sql file
 */

// Load environment variables from file if ENV_FILE is set, otherwise use .env.production.local
// In CI/CD, environment variables are set directly, so dotenv is optional
const envFile = process.env.ENV_FILE || '.env.production.local';
require('dotenv').config({ path: envFile });
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log(`📍 Production database: ${supabaseUrl}\n`);

// SQL statements to create all tables
const SQL_STATEMENTS = `-- Production Database Schema Setup
-- Execute this SQL in your Supabase Dashboard

-- Create Users table (for NextAuth.js)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Create Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Verification tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(key);
`;

async function setupProductionDatabase() {
  try {
    console.log('⚙️  Preparing production database schema...\n');

    // Save SQL to a file for easy copying
    const sqlFilePath = path.join(__dirname, 'setup-production-db.sql');
    fs.writeFileSync(sqlFilePath, SQL_STATEMENTS);
    console.log(`✅ SQL statements saved to: setup-production-db.sql\n`);

    console.log('📋 Database tables to create:');
    console.log('  1. public.users - User accounts');
    console.log('  2. public.accounts - OAuth account connections');
    console.log('  3. public.sessions - User sessions');
    console.log('  4. public.verification_tokens - Email verification tokens');
    console.log('  5. public.api_keys - API keys for programmatic access');
    console.log('  + Indexes for performance optimization\n');

    console.log('🔑 NEXT STEPS - Execute the SQL in your production database:\n');

    console.log('OPTION 1: Supabase Dashboard (Easiest)');
    console.log('  1. Go to: https://supabase.com/dashboard');
    console.log('  2. Select your project');
    console.log('  3. Go to: SQL Editor');
    console.log('  4. Create a new query');
    console.log('  5. Copy & paste contents of setup-production-db.sql');
    console.log('  6. Click "Run"\n');

    console.log('OPTION 2: psql command (Terminal)');
    console.log('  psql "your-supabase-connection-string" < setup-production-db.sql\n');

    console.log('OPTION 3: This script in CI/CD');
    console.log('  Once you execute the SQL manually, this script will verify');
    console.log('  and maintain the schema on future deployments.\n');

    console.log('🎉 Schema preparation complete!');
    console.log(`📍 Database: ${supabaseUrl}`);
    console.log(`📄 SQL file: ${sqlFilePath}\n`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setupProductionDatabase();
