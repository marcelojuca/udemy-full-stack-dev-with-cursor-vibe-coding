# Next.js App Router API Patterns

Patterns for building secure, consistent API routes in Next.js 15 App Router.

---

## HTTP Status Codes

Use correct status codes for all responses:

```typescript
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 200 - Success (default)
  return NextResponse.json({ data }, { status: 200 });

  // 400 - Bad Request (invalid input format)
  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  // 401 - Unauthorized (missing/invalid token)
  if (!token || !isValidToken(token)) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization' },
      { status: 401 }
    );
  }

  // 403 - Forbidden (authenticated but lacks permission)
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // 404 - Not Found (resource doesn't exist)
  const user = await findUser(id);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // 429 - Too Many Requests (rate limited)
  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: 60 },
      { status: 429 }
    );
  }

  // 500 - Internal Server Error (unexpected error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Basic Route Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Validation (early returns for errors)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // 2. Authentication
    const auth = await getServerSession(authOptions);
    if (!auth?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 3. Main logic
    const data = await fetchData(id);
    if (!data) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: 404 }
      );
    }

    // 4. Success response
    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## CORS Handling

Always add OPTIONS handler for CORS preflight requests:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://www.figma.com',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string): Record<string, string> {
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || '';
    const data = await fetchData();

    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';

  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}
```

---

## Request Body Parsing

Safely parse and validate JSON requests:

```typescript
import { z } from 'zod';

// Define schema with Zod
const CreateTokenSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  expiresIn: z.string().default('7d'),
  metadata: z.record(z.unknown()).optional(),
});

type CreateTokenRequest = z.infer<typeof CreateTokenSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse JSON
    const body = await request.json();

    // Validate with schema
    const validatedData = CreateTokenSchema.parse(body);

    // Use validated data
    const token = await generateToken(validatedData);

    return NextResponse.json({ token }, { status: 200 });

  } catch (error) {
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // JSON parse error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // Other errors
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Authorization Header Validation

Safely extract and validate Bearer tokens:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Validate Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
      return NextResponse.json(
        { error: 'Empty token' },
        { status: 401 }
      );
    }

    // Validate token
    const validation = await validateToken(token);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid token' },
        { status: 401 }
      );
    }

    // Proceed with request
    const data = await fetchUserData(validation.userId);
    return NextResponse.json({ data }, { status: 200 });

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

## Response Format Consistency

Keep response structure consistent across all endpoints:

```typescript
// ✅ Success response
interface SuccessResponse<T> {
  data: T;
  timestamp: string;
}

// ✅ Error response
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch data',
      code: 'FETCH_ERROR',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
```

---

## Middleware Pattern

Handle shared concerns (auth, logging) in middleware, not routes:

```typescript
// ❌ Anti-pattern: Auth in every route
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Rest of route...
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Rest of route...
}

// ✅ Better: Auth in middleware
// /src/middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

// Routes don't need auth check
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json({ data });
}
```

---

## Error Logging

Log errors with context but never expose internals to clients:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Implementation
  } catch (error) {
    // ✅ Good: Log full details, return generic message
    console.error('Error in POST /api/tokens:', {
      error: error instanceof Error ? error.message : String(error),
      endpoint: '/api/tokens',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}

// ❌ Bad: Expose internal error details
console.error('Error in POST /api/tokens:', error);
return NextResponse.json(
  { error: error.message || 'Something went wrong' },
  { status: 500 }
);
```

---

## Async/Await Pattern

Always use async/await, never mix promises:

```typescript
// ✅ Good
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// ❌ Bad
export function GET(request: NextRequest) {
  return fetchData()
    .then(data => NextResponse.json({ data }))
    .catch(error => NextResponse.json({ error: 'Failed' }, { status: 500 }));
}
```

---

## Summary

- Return correct HTTP status codes (200, 400, 401, 404, 429, 500)
- Use early returns for validation errors
- Add OPTIONS handler for CORS preflight
- Always include Authorization header validation
- Use Zod schemas for request validation
- Keep response structure consistent
- Log with context, return generic errors
- Handle CORS origins explicitly
- Use try-catch for all async operations
