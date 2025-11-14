# Database Design Patterns

PostgreSQL and Supabase best practices for reliable, performant database schemas.

---

## Idempotent Operations

All database operations must be safe to run multiple times without side effects:

```sql
-- ✅ GOOD: Idempotent (safe to run multiple times)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Updating constraints is idempotent too
ALTER TABLE IF EXISTS users
ADD CONSTRAINT unique_email UNIQUE (email)
ON CONFLICT DO NOTHING;

-- ❌ BAD: Not idempotent (fails on second run)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### Why Idempotency Matters

- Database setup scripts can be run multiple times safely
- CI/CD pipelines can run without checking if tables exist
- Zero-downtime deployments work correctly
- Recovery from partial failures is safe

---

## Foreign Keys with CASCADE DELETE

Always use CASCADE DELETE to maintain referential integrity:

```sql
-- ✅ GOOD: Cascade delete
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE plugin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- CASCADE DELETE: When user is deleted, tokens are too
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- CASCADE DELETE: Subscription deleted when user is deleted
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ❌ BAD: No cascade (orphaned records)
CREATE TABLE plugin_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) -- No ON DELETE clause
);

-- ❌ BAD: RESTRICT (prevents user deletion)
CREATE TABLE plugin_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
```

---

## Timestamp Columns

Always use TIMESTAMP WITH TIME ZONE for global compatibility:

```sql
-- ✅ GOOD: WITH TIME ZONE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- ✅ GOOD: Set created_at immutable
ALTER TABLE users ADD CONSTRAINT created_at_immutable
CHECK (created_at = 'initial_value'); -- Or use BEFORE INSERT trigger

-- ❌ BAD: Without time zone (timezone issues)
CREATE TABLE users (
  created_at TIMESTAMP DEFAULT NOW() -- Lost timezone info
);

-- ❌ BAD: Using DATE when time matters
CREATE TABLE users (
  created_at DATE -- Loses time component
);
```

### Timestamp Trigger Pattern

```sql
-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tables
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

## JSONB for Flexible Configuration

Use JSONB columns for configuration that may evolve:

```sql
-- ✅ GOOD: JSONB for flexible limits
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price_monthly INTEGER,

  -- Flexible limits - can add new fields without migration
  limits JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed with different limit structures
INSERT INTO subscription_plans (plan_slug, name, limits) VALUES
  ('free', 'Free', '{"resizesPerDay": 2, "batchSize": 1}'),
  ('basic', 'Basic', '{"resizesPerDay": 10, "batchSize": 5, "priority": false}'),
  ('pro', 'Pro', '{"resizesPerDay": 100, "batchSize": 50, "priority": true, "apiAccess": true}');

-- Query JSONB
SELECT plan_slug, limits->>'resizesPerDay' as daily_limit
FROM subscription_plans;

-- ❌ BAD: Separate columns (requires migration to add fields)
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  plan_slug VARCHAR(50),
  resizes_per_day INTEGER,
  batch_size INTEGER,
  priority BOOLEAN -- Adding new fields requires ALTER TABLE
);
```

---

## Indexing Strategy

Strategic indexes improve query performance dramatically:

```sql
-- ✅ GOOD: Index foreign keys
CREATE TABLE plugin_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index foreign key
CREATE INDEX idx_plugin_tokens_user_id ON plugin_tokens(user_id);

-- Index for lookups
CREATE INDEX idx_plugin_tokens_token ON plugin_tokens(token);

-- ✅ GOOD: Index WHERE clauses
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE
);

-- Index for filtering active subscriptions
CREATE INDEX idx_subscriptions_active ON user_subscriptions(status)
WHERE status = 'active';

-- ✅ GOOD: Multi-column index for queries
CREATE TABLE daily_usage_summary (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR(100),
  usage_date DATE,
  count INTEGER,
  UNIQUE(user_id, action, usage_date)
);

-- Single query uses this index
CREATE INDEX idx_daily_usage_user_action_date
ON daily_usage_summary(user_id, action, usage_date);

-- ❌ BAD: Over-indexing (slows inserts)
CREATE INDEX idx_all_columns ON users(id, email, name, created_at);

-- ❌ BAD: Missing index on foreign key
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id)
  -- No index on user_id = slow queries
);
```

### When to Index

- **Always**: Foreign key columns
- **Always**: Columns in WHERE clauses
- **Always**: Unique columns
- **Sometimes**: Columns in ORDER BY
- **Rarely**: Low-cardinality columns (gender, status with few values)
- **Never**: High-write, low-read columns

---

## Unique Constraints

Use UNIQUE constraints to prevent duplicates:

```sql
-- ✅ GOOD: Unique email
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ GOOD: Composite unique constraint
CREATE TABLE daily_usage_summary (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR(100),
  usage_date DATE,
  count INTEGER DEFAULT 0,

  -- Prevent duplicate entries for same user/action/date
  UNIQUE(user_id, action, usage_date)
);

-- ✅ GOOD: Unique with condition (partial unique)
CREATE TABLE plugin_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  revoked BOOLEAN DEFAULT false,

  -- Only one active token per user
  UNIQUE(user_id) WHERE NOT revoked
);

-- ❌ BAD: Duplicate entries
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan VARCHAR(50)
  -- Multiple subscriptions per user possible
);
```

---

## Primary Key Strategy

Use UUID for better distributed systems and privacy:

```sql
-- ✅ GOOD: UUID with auto-generation
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert without specifying ID
INSERT INTO users (email) VALUES ('user@example.com');

-- ✅ GOOD: Explicit UUIDs for testing
INSERT INTO users (id, email) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com'
);

-- ❌ BAD: Sequential integers (privacy issue, guessable)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);
-- Users can guess other user IDs (1, 2, 3...)

-- ❌ BAD: No default (requires inserting ID)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Must specify ID on every insert
  email VARCHAR(255) NOT NULL
);
```

---

## Default Values

Use sensible defaults to maintain consistency:

```sql
-- ✅ GOOD: Default values
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  status VARCHAR(50) DEFAULT 'active',
  limits JSONB DEFAULT '{"resizesPerDay": 2}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ GOOD: Expressions as defaults
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- ❌ BAD: No defaults (nulls everywhere)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan VARCHAR(50), -- Could be NULL
  status VARCHAR(50), -- Could be NULL
  created_at TIMESTAMP WITH TIME ZONE -- Could be NULL
);
```

---

## Database Migrations Pattern

Safe migration pattern for production:

```sql
-- Step 1: Create table with IF NOT EXISTS
BEGIN;

CREATE TABLE IF NOT EXISTS plugin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plugin_tokens_user_id
ON plugin_tokens(user_id);

COMMIT;

-- Step 2: Add new column safely
BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

COMMIT;

-- Step 3: Drop old column safely (with backup)
BEGIN;

-- First, verify data is backed up elsewhere
ALTER TABLE users
DROP COLUMN IF EXISTS legacy_field CASCADE;

COMMIT;
```

---

## Row-Level Security (RLS)

Use RLS for multi-tenant safety:

```sql
-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Only users can see their own subscription
CREATE POLICY "Users see own subscription"
ON user_subscriptions
FOR SELECT
USING (user_id = auth.uid());

-- Only system can update subscriptions (via webhook)
CREATE POLICY "System updates subscriptions"
ON user_subscriptions
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Only system can insert subscriptions
CREATE POLICY "System inserts subscriptions"
ON user_subscriptions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

---

## Summary

- Use IF NOT EXISTS for idempotency
- CASCADE DELETE for referential integrity
- TIMESTAMP WITH TIME ZONE for all times
- JSONB for flexible configuration
- Index foreign keys and WHERE clauses
- UNIQUE constraints for duplicate prevention
- UUID for primary keys (not SERIAL)
- Sensible defaults to maintain consistency
- Safe migration patterns for production
- Enable RLS for multi-tenant safety
