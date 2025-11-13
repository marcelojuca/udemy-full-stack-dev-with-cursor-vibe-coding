# Error Handling Patterns

Consistent error handling patterns for robust, maintainable code.

---

## Guard Clauses (Early Returns)

Use guard clauses to handle errors early and reduce nesting:

```typescript
// ✅ Good: Guard clauses with early returns
async function processUserData(input: unknown): Promise<Result> {
  // Guard 1: Check input exists
  if (!input) {
    return { success: false, error: 'Input required' };
  }

  // Guard 2: Check input type
  if (typeof input !== 'object') {
    return { success: false, error: 'Input must be an object' };
  }

  // Guard 3: Check required fields
  const data = input as Record<string, unknown>;
  if (!data.userId || typeof data.userId !== 'string') {
    return { success: false, error: 'Missing or invalid userId' };
  }

  // Guard 4: Check constraints
  if (data.email && typeof data.email !== 'string') {
    return { success: false, error: 'Invalid email' };
  }

  // Main logic - no nesting needed
  const result = await updateUser(data.userId, data);
  return { success: true, data: result };
}

// ❌ Bad: Deeply nested conditionals
async function processUserData(input: unknown): Promise<Result> {
  if (input) {
    if (typeof input === 'object') {
      const data = input as Record<string, unknown>;
      if (data.userId && typeof data.userId === 'string') {
        if (!data.email || typeof data.email === 'string') {
          // Main logic here - deeply nested
          const result = await updateUser(data.userId, data);
          return { success: true, data: result };
        }
      }
    }
  }
  return { success: false, error: 'Invalid input' };
}
```

### Pattern Template

```typescript
async function processData(input: InputType): Promise<Output> {
  // Guard clause 1: Null/undefined check
  if (!input) {
    return { error: 'Input required' };
  }

  // Guard clause 2: Type validation
  if (typeof input !== 'expected-type') {
    return { error: 'Invalid input type' };
  }

  // Guard clause 3: Field validation
  if (!input.requiredField) {
    return { error: 'Missing required field' };
  }

  // Guard clause 4: Business logic validation
  if (input.value < 0 || input.value > 100) {
    return { error: 'Value must be between 0 and 100' };
  }

  // Main logic executes only after all guards pass
  return processWithValidInput(input);
}
```

---

## Try-Catch for Async Operations

Always wrap async calls in try-catch:

```typescript
// ✅ Good: Proper try-catch structure
async function fetchUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    // Check Supabase-specific errors
    if (error) {
      console.error('Database error fetching user:', {
        userId,
        error: error.message,
      });
      return null;
    }

    return data as User;
  } catch (error) {
    // Catch unexpected errors
    console.error('Unexpected error fetching user:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ❌ Bad: Missing error handling
async function fetchUser(userId: string): Promise<User> {
  const { data } = await supabase.from('users').select('*').eq('id', userId).single();

  return data as User; // Will crash if data is null or error occurs
}
```

### Async/Await vs Promises

```typescript
// ✅ Good: Async/await with try-catch
async function processData() {
  try {
    const user = await fetchUser('123');
    const settings = await fetchUserSettings(user.id);
    return { user, settings };
  } catch (error) {
    console.error('Error processing data:', error);
    return null;
  }
}

// ❌ Bad: Promise chains (harder to read)
function processData() {
  return fetchUser('123')
    .then((user) => {
      return fetchUserSettings(user.id).then((settings) => ({ user, settings }));
    })
    .catch((error) => {
      console.error('Error processing data:', error);
      return null;
    });
}
```

---

## Descriptive Error Messages

Make error messages specific and actionable:

```typescript
// ✅ Good: Specific error messages
const authHeader = request.headers.get('authorization');

if (!authHeader) {
  return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
}

if (!authHeader.startsWith('Bearer ')) {
  return NextResponse.json(
    { error: 'Invalid authorization header format. Expected: Bearer <token>' },
    { status: 401 }
  );
}

const token = authHeader.substring(7);

if (!token) {
  return NextResponse.json({ error: 'Empty token provided' }, { status: 401 });
}

// ❌ Bad: Generic error messages
if (!authHeader || !authHeader.startsWith('Bearer ') || !authHeader.substring(7)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### API Error Response Format

```typescript
interface ApiError {
  error: string; // User-friendly message
  code?: string; // Machine-readable code
  details?: unknown; // Additional context (development only)
  timestamp: string; // When error occurred
}

// ✅ Correct error responses
return NextResponse.json(
  {
    error: 'User not found',
    code: 'USER_NOT_FOUND',
    timestamp: new Date().toISOString(),
  },
  { status: 404 }
);

return NextResponse.json(
  {
    error: 'Daily limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    details: { limit: 10, used: 10, resetAt: '2025-11-14' },
    timestamp: new Date().toISOString(),
  },
  { status: 429 }
);

// ❌ Vague error responses
return NextResponse.json({ error: 'Error' }, { status: 400 });
return NextResponse.json({ error: 'Failed' }, { status: 500 });
```

---

## Null Coalescing vs Fallbacks

Use appropriate techniques for handling missing values:

```typescript
// ✅ Good: Explicit null checks
const email = user?.email;
if (!email) {
  return { error: 'User has no email address' };
}

const name = user?.name || 'Anonymous'; // Fallback value
const age = user?.age ?? 0; // Only if truly null/undefined

// ❌ Bad: Implicit falsy checks
const name = user && user.name ? user.name : 'Anonymous'; // Too verbose

// ❌ Confusing: Mixing techniques
const description = user?.bio || user?.tagline || 'No description'; // Ambiguous intent
```

---

## Validation Error Handling

Handle validation errors with context:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(0, 'Age must be non-negative'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UserSchema.parse(body);

    // Process valid data
    return NextResponse.json({ success: true, data: validatedData });
  } catch (error) {
    // ✅ Good: Return validation details
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        },
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
```

---

## Database Error Handling

Handle Supabase/database errors gracefully:

```typescript
import { createClient } from '@supabase/supabase-js';

async function createUser(email: string, name: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, name }])
      .select()
      .single();

    // ✅ Good: Check for errors explicitly
    if (error) {
      console.error('Database error creating user:', {
        email,
        code: error.code,
        message: error.message,
      });

      // Return null or throw, depending on context
      if (error.code === '23505') {
        // Unique constraint violation
        return null;
      }

      throw error;
    }

    return data as User;
  } catch (error) {
    console.error('Unexpected error creating user:', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // Re-throw for caller to handle
  }
}

// ❌ Bad: Ignoring error
const { data } = await supabase.from('users').insert([{ email, name }]).select().single();

return data as User;
```

---

## Logging with Context

Always log errors with enough context to debug:

```typescript
// ✅ Good: Include context
async function processWebhook(event: StripeEvent) {
  try {
    const customerId = event.data.object.customer as string;
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ status: 'active' })
      .eq('stripe_customer_id', customerId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to process webhook:', {
      eventType: event.type,
      eventId: event.id,
      customerId: event.data.object?.customer,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    throw error; // Re-throw for retry
  }
}

// ❌ Bad: No context
console.error('Error:', error);
throw error;
```

---

## Async Error Handling in Hooks

Handle errors in React/Preact hooks:

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  setLoading(true);
  setError(null); // Clear previous errors

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const { error: apiError } = await response.json();
      throw new Error(apiError || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(message);
    console.error('Login error:', message);
  } finally {
    setLoading(false);
  }
};
```

---

## Summary

- Use guard clauses for early returns
- Wrap async operations in try-catch
- Provide specific error messages
- Check Supabase error objects explicitly
- Log errors with full context
- Return appropriate HTTP status codes
- Handle validation errors with details
- Clear previous errors before new operations
- Never expose internal errors to users
