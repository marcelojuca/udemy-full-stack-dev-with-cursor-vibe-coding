# TypeScript Coding Patterns

These patterns ensure type safety and consistency across all agents.

---

## Interface vs Type

- **Use `interface`** for object shapes that may be extended
- **Use `type`** for unions, intersections, primitives, and fixed objects
- Prefer interfaces for API request/response types (extensible)

### Example

```typescript
// ✅ Interface for extensible objects
interface User {
  id: string;
  email: string;
  name: string;
}

interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// ✅ Type for unions and fixed shapes
type Plan = 'free' | 'basic' | 'pro' | 'enterprise';

type ApiResponse<T> = {
  data: T;
  error?: string;
  timestamp: number;
};

// ❌ Avoid: Type for extendable objects
type UserType = {
  id: string;
  email: string;
};
```

---

## Naming Conventions

### Boolean Variables

Use auxiliary verbs to make logic obvious:

```typescript
// ✅ Good
const isLoading = true;
const hasError = false;
const canDelete = user.role === 'admin';
const isAuthenticated = !!token;
const shouldRetry = attempts < maxAttempts;

// ❌ Bad
const loading = true;
const error = false;
const delete_allowed = true;
const auth = !!token;
```

### Event Handlers

Prefix with `handle` followed by the action:

```typescript
// ✅ Good
const handleLogin = () => {};
const handleLogout = () => {};
const handleFormSubmit = (e: FormEvent) => {};
const handleInputChange = (value: string) => {};
const handleTokenExpiry = () => {};

// ❌ Bad
const login = () => {};
const onSubmit = () => {};
const processClick = () => {};
```

### Async Functions

Use verb that describes the action:

```typescript
// ✅ Good
async function fetchUser(id: string): Promise<User> {}
async function createToken(userId: string): Promise<string> {}
async function validateToken(token: string): Promise<boolean> {}
async function updateSubscription(userId: string, plan: string): Promise<void> {}

// ❌ Bad
async function getUser(id: string): Promise<User> {} // fetch is clearer for async
async function makeToken(userId: string): Promise<string> {}
async function check(token: string): Promise<boolean> {}
```

### Constants

Use UPPER_SNAKE_CASE for module-level constants:

```typescript
// ✅ Good
const API_BASE_URL = 'https://api.example.com';
const JWT_EXPIRY = '7d';
const MAX_RETRIES = 3;
const ALLOWED_ORIGINS = ['https://www.figma.com'];

// ❌ Bad
const apiBaseUrl = 'https://api.example.com';
const jwtExpiry = '7d';
const maxRetries = 3;
```

---

## Type Safety

### Explicit Return Types

Always specify return type for functions (especially public ones):

```typescript
// ✅ Good
async function getUserSubscription(userId: string): Promise<Subscription> {
  // Implementation
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ❌ Bad
async function getUserSubscription(userId: string) {
  // Implementation (return type inferred)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### Avoid `any`

Never use `any`. Use `unknown` if type is truly uncertain:

```typescript
// ✅ Acceptable: Type is unknown from external source
function processWebhookData(data: unknown): void {
  if (typeof data === 'object' && data !== null && 'type' in data) {
    // Now we can safely access data.type
  }
}

// ✅ Better: Define the expected shape
interface WebhookData {
  type: string;
  payload: Record<string, unknown>;
}

function processWebhookData(data: WebhookData): void {
  // Implementation
}

// ❌ Never use any
function processWebhookData(data: any): void {}
```

### Use `as const` for Literals

When you need literal types:

```typescript
// ✅ Good
const PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
} as const;

type Plan = (typeof PLANS)[keyof typeof PLANS]; // 'free' | 'basic' | 'pro'

// ❌ Less ideal
const PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
};

type Plan = 'free' | 'basic' | 'pro'; // Duplicates values
```

---

## Optional vs Required Fields

Be explicit about what's optional:

```typescript
// ✅ Good
interface UserData {
  id: string; // Required
  name: string; // Required
  email: string; // Required
  avatar?: string; // Optional
  bio?: string; // Optional
}

// ❌ Bad
interface UserData {
  id: string | null; // Should use optional instead
  name: string | null;
  avatar: string | null;
}
```

---

## Generics

Use generics to make code reusable without sacrificing type safety:

```typescript
// ✅ Good
interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: number;
}

async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  // Implementation
}

// Usage
const userResponse = await fetchData<User>('/api/users/123');
const subscriptionResponse = await fetchData<Subscription>('/api/subscription');

// ❌ Bad
interface UserApiResponse {
  data: User;
  error?: string;
}

interface SubscriptionApiResponse {
  data: Subscription;
  error?: string;
}
```

---

## Strict Mode Consideration

Even though project has `strict: false`, follow strict principles:

- Always provide explicit types for function parameters
- Always provide explicit return types for functions
- Use non-null assertions (`!`) sparingly and document why
- Treat `null` and `undefined` as distinct types

```typescript
// ✅ Good: Even in non-strict mode
function processUser(user: User | null): void {
  if (!user) {
    console.log('User is null');
    return;
  }

  // Now we know user is non-null
  console.log(user.id);
}

// ❌ Bad: Ignoring null possibility
function processUser(user: User): void {
  // Assumes user is always defined, will crash if null
  console.log(user.id);
}
```

---

## Common Patterns

### API Request/Response Types

```typescript
interface ApiRequest {
  // Common properties all requests share
  timestamp: number;
  version: string;
}

interface TokenGenerationRequest extends ApiRequest {
  userId: string;
  expiresIn: string;
}

interface TokenGenerationResponse {
  token: string;
  expiresAt: string;
}

interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
```

### Status Union Types

```typescript
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface LoadingState {
  status: 'loading';
}

interface SuccessState<T> {
  status: 'success';
  data: T;
}

interface ErrorState {
  status: 'error';
  error: string;
}

type RequestState<T> = LoadingState | SuccessState<T> | ErrorState;
```

---

## Summary

- Use `interface` for objects, `type` for unions
- Name booleans with `is`, `has`, `can`, `should`
- Name handlers with `handle` prefix
- Always specify return types
- Avoid `any`; use `unknown` if needed
- Use `as const` for literal type definitions
- Make optional fields explicit with `?`
