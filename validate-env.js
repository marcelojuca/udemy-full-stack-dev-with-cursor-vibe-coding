#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables and external services are configured correctly
 * Supports both .env.local (development) and .env.production.local (production)
 */

require('dotenv').config({ path: process.env.ENV_FILE || '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const https = require('https')

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`)
}

let allTestsPassed = true

// Test 1: Environment Variables
log.section('1️⃣  CHECKING ENVIRONMENT VARIABLES')

const requiredEnvVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase Project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase Anon Key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase Service Role Key',
  'NEXTAUTH_SECRET': 'NextAuth Secret',
  'NEXTAUTH_URL': 'NextAuth URL',
  'GOOGLE_CLIENT_ID': 'Google OAuth Client ID',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth Client Secret',
  'OPENAI_API_KEY': 'OpenAI API Key'
}

const missingVars = []

for (const [key, description] of Object.entries(requiredEnvVars)) {
  if (process.env[key]) {
    const value = process.env[key]
    const maskedValue = maskSensitiveValue(value)
    log.success(`${key}: ${maskedValue}`)
  } else {
    log.error(`${key}: MISSING - ${description}`)
    missingVars.push(key)
    allTestsPassed = false
  }
}

if (missingVars.length > 0) {
  log.warning(`\n${missingVars.length} environment variable(s) missing. Please add them to .env.local`)
}

// Test 2: Supabase Connection
log.section('2️⃣  TESTING SUPABASE CONNECTION')

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    log.error('Supabase credentials missing - skipping connection test')
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Check connection by querying public schema
    const { data, error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      // Table might not exist yet, but if we got a connection, it's still a success
      if (error.code === 'PGRST116') {
        log.warning('Users table not found - this is OK if database is not set up yet')
        log.success('Supabase connection successful (query executed)')
        return true
      } else {
        log.error(`Supabase query failed: ${error.message}`)
        return false
      }
    }

    log.success('Supabase connection successful')
    return true
  } catch (error) {
    log.error(`Supabase connection failed: ${error.message}`)
    allTestsPassed = false
    return false
  }
}

// Test 3: Google OAuth Configuration
log.section('3️⃣  CHECKING GOOGLE OAUTH CONFIGURATION')

function validateGoogleAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL

  let passed = true

  if (!clientId) {
    log.error('GOOGLE_CLIENT_ID is missing')
    passed = false
  } else if (clientId.length < 20) {
    log.warning(`GOOGLE_CLIENT_ID seems too short (${clientId.length} chars) - may be invalid`)
  } else {
    log.success(`GOOGLE_CLIENT_ID configured (length: ${clientId.length})`)
  }

  if (!clientSecret) {
    log.error('GOOGLE_CLIENT_SECRET is missing')
    passed = false
  } else if (clientSecret.length < 20) {
    log.warning(`GOOGLE_CLIENT_SECRET seems too short (${clientSecret.length} chars) - may be invalid`)
  } else {
    log.success(`GOOGLE_CLIENT_SECRET configured (length: ${clientSecret.length})`)
  }

  if (!nextAuthUrl) {
    log.error('NEXTAUTH_URL is missing')
    passed = false
  } else {
    log.success(`NEXTAUTH_URL: ${nextAuthUrl}`)

    if (!nextAuthUrl.includes('localhost') && !nextAuthUrl.includes('vercel.app')) {
      log.warning(`NEXTAUTH_URL doesn't look like a local or Vercel URL: ${nextAuthUrl}`)
    }
  }

  // Validate redirect URI format
  log.info('Expected Google OAuth Callback URI:')
  console.log(`  ${nextAuthUrl}/api/auth/callback/google`)

  if (!passed) allTestsPassed = false
  return passed
}

// Test 4: OpenAI API Key
log.section('4️⃣  TESTING OPENAI API KEY')

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    log.error('OPENAI_API_KEY is missing')
    allTestsPassed = false
    return false
  }

  if (!apiKey.startsWith('sk-')) {
    log.warning('OPENAI_API_KEY does not start with "sk-" - may be invalid format')
  } else {
    log.success(`OPENAI_API_KEY format looks valid`)
  }

  // Test API connectivity
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    })

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': `Bearer ${apiKey}`
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          log.success('OpenAI API key is valid and accessible')
          resolve(true)
        } else if (res.statusCode === 401) {
          log.error('OpenAI API key is invalid or expired')
          allTestsPassed = false
          resolve(false)
        } else if (res.statusCode === 429) {
          log.warning('OpenAI API rate limit reached - key is valid but limited')
          resolve(true)
        } else {
          log.warning(`OpenAI API returned status ${res.statusCode} - key format may be invalid`)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      log.warning(`Could not connect to OpenAI API: ${error.message}`)
      log.info('This might be a network issue - key format looks OK')
      resolve(false)
    })

    req.write(postData)
    req.end()
  })
}

// Test 5: NextAuth Configuration
log.section('5️⃣  CHECKING NEXTAUTH CONFIGURATION')

function validateNextAuth() {
  const secret = process.env.NEXTAUTH_SECRET
  const url = process.env.NEXTAUTH_URL

  let passed = true

  if (!secret) {
    log.error('NEXTAUTH_SECRET is missing - session encryption will fail')
    passed = false
  } else if (secret.length < 32) {
    log.warning(`NEXTAUTH_SECRET is too short (${secret.length} chars) - should be at least 32`)
  } else {
    log.success(`NEXTAUTH_SECRET configured (length: ${secret.length})`)
  }

  if (!url) {
    log.error('NEXTAUTH_URL is missing')
    passed = false
  } else {
    log.success(`NEXTAUTH_URL: ${url}`)
  }

  if (!passed) allTestsPassed = false
  return passed
}

// Utility function to mask sensitive values
function maskSensitiveValue(value) {
  if (!value || value.length <= 8) return '***'
  return value.substring(0, 4) + '...' + value.substring(value.length - 4)
}

// Main execution
async function runAllTests() {
  try {
    // Run synchronous tests first
    validateGoogleAuth()
    validateNextAuth()

    // Then run async tests
    const supabaseOk = await testSupabase()
    const openaiOk = await testOpenAI()

    // Final summary
    log.section('📊 VALIDATION SUMMARY')

    if (allTestsPassed) {
      console.log(`${colors.green}✨ All validations passed! Your environment is ready.${colors.reset}`)
      console.log(`${colors.green}You can now run: npm run dev${colors.reset}\n`)
      process.exit(0)
    } else {
      console.log(`${colors.red}⚠️  Some validations failed or skipped.${colors.reset}`)
      console.log(`${colors.yellow}Please review the errors above and fix them.${colors.reset}`)
      console.log(`${colors.red}You may not be able to run the app until these are resolved.\n${colors.reset}`)
      process.exit(1)
    }
  } catch (error) {
    log.error(`Unexpected error during validation: ${error.message}`)
    process.exit(1)
  }
}

// Run validation
runAllTests()
