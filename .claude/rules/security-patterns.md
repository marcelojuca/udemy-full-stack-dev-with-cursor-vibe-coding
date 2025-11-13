# Security Patterns

Security best practices for authentication, data protection, and safe API design.

---

## Never Log Secrets

Never log tokens, passwords, API keys, or sensitive user data to console or logs:

```typescript
// ❌ NEVER - Exposes token in logs
const token = generateToken(userId);
console.log('Generated token:', token); // SECURITY RISK

// ❌ NEVER - Exposes user secrets
console.log('User data:', userData); // May contain passwords, tokens, etc.

// ✅ GOOD - Log only non-sensitive context
const token = generateToken(userId);
console.log('Token generated for user:', userId);

const tokenId = token.substring(0, 10) + '...'; // Show only partial for tracing
console.log('Token ID:', tokenId);

// ✅ GOOD - Log what you need, not the secrets
console.log('Authentication successful', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  // Never include: password, token, apiKey, etc.
});
```

### Sensitive Fields to Never Log

```typescript
// ❌ Never log these
- token
- password
- api_key
- secret
- refresh_token
- access_token
- stripe_customer_id (with payment info)
- credit_card_number
- cvv
- oauth_code
- webhook_signature
```

---

## Validate postMessage Origin

Always verify the origin of postMessage events to prevent XSS and data theft:

```typescript
// ✅ GOOD: Always validate origin
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://myapp.com'
  : 'http://localhost:3000';

window.addEventListener('message', (event: MessageEvent) => {
  // CRITICAL: Verify origin before processing
  if (event.origin !== API_BASE_URL) {
    console.warn('Rejected message from untrusted origin:', event.origin);
    return; // Exit immediately
  }

  // Now safe to process event.data
  if (event.data.type === 'AUTH_SUCCESS') {
    const token = event.data.token;
    // Process token
  }
});

// ❌ DANGEROUS: No origin validation
window.addEventListener('message', (event: MessageEvent) => {
  // Accepts messages from ANY origin!
  if (event.data.type === 'AUTH_SUCCESS') {
    const token = event.data.token;
    // Token stolen from malicious site
  }
});

// ❌ DANGEROUS: Checking event.data instead of event.origin
window.addEventListener('message', (event: MessageEvent) => {
  if (event.data.origin === 'https://myapp.com') {
    // This is user-controlled, can be spoofed
    // Always check event.origin, not event.data
  }
});
```

### postMessage Security Pattern

```typescript
// Auth success page (trusted origin)
export async function handleAuthSuccess() {
  const token = getTokenFromSession();

  // Send token ONLY to known parent window
  window.opener.postMessage(
    {
      type: 'PLUGIN_AUTH_SUCCESS',
      token: token,
    },
    'https://www.figma.com' // Explicit allowed origin
  );

  window.close();
}

// Plugin (in Figma iframe)
function startAuthFlow() {
  const authWindow = window.open(
    '/plugin/auth',
    'auth',
    'width=500,height=600'
  );

  window.addEventListener('message', (event) => {
    // ✅ Verify origin before processing
    if (event.origin !== API_BASE_URL) {
      console.warn('Rejected auth message from:', event.origin);
      return;
    }

    if (event.data.type === 'PLUGIN_AUTH_SUCCESS') {
      const token = event.data.token;
      // Store securely
      figma.clientStorage.setAsync('auth_token', token);
    }
  });
}
```

---

## Authorization Header Validation

Always validate Authorization headers strictly:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Step 1: Check header exists
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Step 2: Validate Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 }
      );
    }

    // Step 3: Extract token
    const token = authHeader.substring(7);
    if (!token) {
      return NextResponse.json(
        { error: 'Empty token' },
        { status: 401 }
      );
    }

    // Step 4: Validate token format
    if (token.length < 20) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Step 5: Verify token (signature, expiration, database)
    const validation = await validateToken(token);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Token is valid, proceed with request
    const user = await getUser(validation.userId);
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## JWT Validation

Always validate JWT tokens properly:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.PLUGIN_JWT_SECRET!;

// ✅ GOOD: Complete JWT validation
async function validateJWT(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    // Step 1: Verify signature
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Step 2: Check expiration (jwt.verify handles this)
    // But also check custom expiration in database if needed

    // Step 3: Verify token still exists in database
    const { data: tokenRecord } = await supabase
      .from('plugin_tokens')
      .select('id, revoked, expires_at')
      .eq('token', token)
      .single();

    if (!tokenRecord) {
      return { valid: false, error: 'Token not found in database' };
    }

    if (tokenRecord.revoked) {
      return { valid: false, error: 'Token has been revoked' };
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return { valid: false, error: 'Token expired' };
    }

    // Token is valid
    return { valid: true, userId: decoded.userId };

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token signature' };
    }

    return { valid: false, error: 'Token validation failed' };
  }
}

// ❌ BAD: Only checking JWT without database verification
function validateJWT_Bad(token: string): { valid: boolean } {
  try {
    jwt.verify(token, JWT_SECRET);
    return { valid: true };
  } catch {
    return { valid: false };
  }
  // Doesn't check if token was revoked, doesn't use database
}
```

---

## Environment Variables

Always use environment variables for sensitive configuration:

```typescript
// ✅ GOOD: Use environment variables
const JWT_SECRET = process.env.PLUGIN_JWT_SECRET;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!JWT_SECRET) {
  throw new Error('PLUGIN_JWT_SECRET is required');
}

// ✅ GOOD: Validate on startup
if (!STRIPE_KEY || !JWT_SECRET || !API_URL) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// ❌ BAD: Hardcoded secrets
const JWT_SECRET = 'my-secret-key-123'; // NEVER

// ❌ BAD: Secrets in comments
// STRIPE_KEY='sk_test_...'

// ❌ BAD: Secrets in code files
const config = {
  jwtSecret: 'hardcoded-secret',
  stripeKey: 'sk_test_...',
};

// ❌ BAD: Secrets in git
git add .env.local // WRONG - this file should be .gitignored
```

### Environment Setup

```bash
# .env.local (NEVER commit this)
PLUGIN_JWT_SECRET=<generated-with-openssl-rand-base64-32>
STRIPE_SECRET_KEY=sk_test_<your-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# .gitignore (MUST include)
.env.local
.env.production.local
```

---

## Input Validation

Validate all user input, especially in API routes:

```typescript
import { z } from 'zod';

// ✅ GOOD: Schema-based validation with Zod
const ResizeImageSchema = z.object({
  imageId: z.string().uuid('Invalid image ID'),
  width: z.number().int().positive().max(4000),
  height: z.number().int().positive().max(4000),
  aspectRatio: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ResizeImageSchema.parse(body);

    // Now we know the data shape is correct
    const result = await resizeImage(validatedData);
    return NextResponse.json({ result });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// ❌ BAD: No validation
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await resizeImage(body); // Assumes body is correct
  return NextResponse.json({ result });
}
```

---

## SQL Injection Prevention

Use parameterized queries (Supabase/ORMs handle this):

```typescript
// ✅ GOOD: Parameterized query (Supabase)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail) // Value is parameterized
  .single();

// ✅ GOOD: Zod validation before query
const userEmail = z.string().email().parse(input);
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)
  .single();

// ❌ BAD: String interpolation (DO NOT DO THIS)
// This would be vulnerable if you were building SQL strings:
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
// Never do this! Supabase doesn't allow this, but avoid it everywhere.
```

---

## CORS and Origins

Always specify allowed origins explicitly:

```typescript
// ✅ GOOD: Explicit origin whitelist
const ALLOWED_ORIGINS = [
  'https://www.figma.com',
  'https://myapp.com',
  'http://localhost:3000', // Development only
];

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Proceed with request
  const data = await fetchData();
  return NextResponse.json(
    { data },
    {
      headers: {
        'Access-Control-Allow-Origin': origin,
      },
    }
  );
}

// ❌ BAD: Allow all origins
response.headers.set('Access-Control-Allow-Origin', '*'); // Dangerous
```

---

## Rate Limiting

Protect against brute force and DoS attacks:

```typescript
// Use rate limiting library (example with simple in-memory approach)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(userId);

  if (!record || record.resetTime < now) {
    // Reset window
    requestCounts.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!checkRateLimit(userId, 10, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process request
}
```

---

## Summary

- Never log tokens, passwords, or secrets
- Always validate postMessage origins
- Validate Authorization headers strictly
- Verify JWT tokens AND check database
- Use environment variables for secrets
- Validate all user input with schemas
- Use parameterized queries (not string interpolation)
- Specify CORS origins explicitly
- Implement rate limiting
- Rotate secrets regularly
- Clear sensitive data on logout
