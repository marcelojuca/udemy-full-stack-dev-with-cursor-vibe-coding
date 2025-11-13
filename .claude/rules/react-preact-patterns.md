# React/Preact Component Patterns

Best practices for building robust, maintainable React and Preact components.

---

## Functional Components

Use functional components with TypeScript interfaces:

```typescript
// ✅ GOOD: Functional component with props interface
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile = ({ userId, onUpdate }: UserProfileProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => onUpdate?.(user)}>Update</button>
    </div>
  );
};

// ✅ GOOD: Export with memo for performance
export const MemoizedUserProfile = memo(UserProfile);

// ❌ BAD: Class components (outdated)
class UserProfile extends React.Component {
  render() {
    return <div>Old pattern</div>;
  }
}

// ❌ BAD: No props interface
const UserProfile = (props) => {
  const { userId, onUpdate } = props;
  // No type safety
};
```

---

## Event Handler Naming

Use `handle` prefix for event handlers:

```typescript
// ✅ GOOD: Clear handler names
interface LoginFormProps {
  onSuccess?: (token: string) => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json();
        throw new Error(apiError || 'Login failed');
      }

      const { token } = await response.json();
      onSuccess?.(token);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

// ❌ BAD: Generic handler names
const handleChange = () => { }; // Which field?
const onClick = () => { };       // What action?

// ❌ BAD: Using 'on' prefix for internal handlers
const onUpdate = () => { };      // Confuse callback with handler
const onFetch = () => { };       // Should be 'fetch' or 'handleFetch'
```

---

## State Management

Use hooks for clean state management:

```typescript
// ✅ GOOD: useState with proper typing
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [errors, setErrors] = useState<string[]>([]);

// ✅ GOOD: useReducer for complex state
interface State {
  isLoading: boolean;
  data: User | null;
  error: string | null;
}

type Action =
  | { type: 'START_LOADING' }
  | { type: 'SUCCESS'; payload: User }
  | { type: 'ERROR'; payload: string };

const initialState: State = {
  isLoading: false,
  data: null,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SUCCESS':
      return { isLoading: false, data: action.payload, error: null };
    case 'ERROR':
      return { isLoading: false, data: null, error: action.payload };
  }
}

const [state, dispatch] = useReducer(reducer, initialState);

// ✅ GOOD: Custom hooks to encapsulate logic
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(data => {
        setUser(data);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
};

// Usage
const MyComponent = () => {
  const { user, loading, error } = useUser('123');
  // Clean, reusable logic
};

// ❌ BAD: Excessive state
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [emailTouched, setEmailTouched] = useState(false);
const [emailFocused, setEmailFocused] = useState(false);
// Use useReducer instead

// ❌ BAD: State that can be computed
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const [fullName, setFullName] = useState('John Doe'); // Unnecessary!
// Use derived: const fullName = `${firstName} ${lastName}`;
```

---

## useEffect Patterns

Always include cleanup and proper dependencies:

```typescript
// ✅ GOOD: useEffect with cleanup
useEffect(() => {
  // Setup
  const listener = (event: MessageEvent) => {
    if (event.origin !== API_URL) return;
    // Handle message
  };

  window.addEventListener('message', listener);

  // Cleanup
  return () => {
    window.removeEventListener('message', listener);
  };

  // Dependencies
}, [API_URL]); // Only re-run if API_URL changes

// ✅ GOOD: useEffect for data fetching
useEffect(() => {
  let isMounted = true; // Prevent memory leak

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      if (isMounted) {
        setUser(data);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  fetchData();

  // Cleanup
  return () => {
    isMounted = false;
  };

}, [userId]); // Re-run when userId changes

// ✅ GOOD: Multiple useEffect for separation of concerns
// Effect 1: Initialize auth
useEffect(() => {
  checkAuthentication();
}, []);

// Effect 2: Handle user changes
useEffect(() => {
  if (user) {
    trackUserActivity(user.id);
  }
}, [user]);

// ❌ BAD: Missing cleanup
useEffect(() => {
  window.addEventListener('message', handleMessage);
  // Memory leak! Listener not removed
}, []);

// ❌ BAD: Empty dependencies (always runs)
useEffect(() => {
  fetchUser(); // Infinite loop!
}, []); // Wrong: [] should be dependencies

// ❌ BAD: Everything in one effect
useEffect(() => {
  checkAuthentication();
  trackPageView();
  initializeAnalytics();
  setupEventListeners();
  // Too many responsibilities
}, []);

// ❌ BAD: Dependencies missing
useEffect(() => {
  fetchUser(userId); // Depends on userId but not listed
}, []); // Should be [userId]
```

---

## Storage in Figma Plugins

Use figma.clientStorage for persistent data:

```typescript
// ✅ GOOD: Use figma.clientStorage
const AUTH_TOKEN_KEY = 'plugin_auth_token';
const USER_DATA_KEY = 'plugin_user_data';

// Store token
const storeToken = async (token: string) => {
  try {
    await figma.clientStorage.setAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

// Retrieve token
const getToken = async (): Promise<string | null> => {
  try {
    return await figma.clientStorage.getAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

// Clear token
const clearToken = async () => {
  try {
    await figma.clientStorage.deleteAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
};

// ✅ GOOD: Custom hook for auth token
const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  const saveToken = async (newToken: string) => {
    await figma.clientStorage.setAsync(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const removeToken = async () => {
    await figma.clientStorage.deleteAsync(AUTH_TOKEN_KEY);
    setToken(null);
  };

  useEffect(() => {
    // Load token on mount
    figma.clientStorage.getAsync(AUTH_TOKEN_KEY).then(setToken);
  }, []);

  return { token, saveToken, removeToken };
};

// Usage
const MyPlugin = () => {
  const { token, saveToken, removeToken } = useAuthToken();

  const handleLogin = async (newToken: string) => {
    await saveToken(newToken);
  };

  const handleLogout = async () => {
    await removeToken();
  };

  return (
    <div>
      {token ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={() => handleLogin('token')}>Login</button>
      )}
    </div>
  );
};

// ❌ BAD: Use localStorage in Figma plugin (not available)
localStorage.setItem('token', token); // DOESN'T WORK

// ❌ BAD: No error handling
const token = await figma.clientStorage.getAsync('token');
// Could throw error if storage is corrupted
```

---

## Error Boundaries

Catch errors to prevent white screens:

```typescript
// ✅ GOOD: Error boundary component
interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: Error) {
    this.setState({ hasError: true, error });
    console.error('Error caught by boundary:', error);
  }

  render(props: ErrorBoundaryProps, state: ErrorBoundaryState) {
    if (state.hasError) {
      return props.fallback || (
        <div style={{ color: 'red', padding: '16px' }}>
          <h2>Something went wrong</h2>
          <p>{state.error?.message}</p>
        </div>
      );
    }

    return props.children;
  }
}

// Usage
const App = () => (
  <ErrorBoundary fallback={<div>Plugin failed to load</div>}>
    <MainComponent />
  </ErrorBoundary>
);
```

---

## Styling in Figma Plugins

Use Tailwind or inline Preact style objects:

```typescript
// ✅ GOOD: Tailwind classes
const LoginButton = () => (
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Login
  </button>
);

// ✅ GOOD: Preact style objects (for dynamic styles)
const StatusBadge = ({ status }: { status: 'active' | 'inactive' }) => (
  <div
    style={{
      padding: '4px 8px',
      backgroundColor: status === 'active' ? '#10b981' : '#ef4444',
      color: 'white',
      borderRadius: '4px',
    }}
  >
    {status}
  </div>
);

// ❌ BAD: Inline styles when Tailwind exists
const LoginButton = () => (
  <button
    style={{
      padding: '8px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      borderRadius: '4px',
    }}
  >
    Login
  </button>
);

// ❌ BAD: Global CSS (conflicts in Figma)
const GlobalStyle = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      button { background: blue; }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};
```

---

## TypeScript with Preact

Define proper types for all props and events:

```typescript
import { h, FunctionComponent } from 'preact';
import { ChangeEvent, FormEvent } from 'preact/compat';

// ✅ GOOD: Typed component
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: string;
}

const Button: FunctionComponent<ButtonProps> = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

// ✅ GOOD: Typed form events
interface FormData {
  email: string;
  password: string;
}

const LoginForm: FunctionComponent = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      email: e.currentTarget.value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // formData is typed
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={formData.email} onChange={handleEmailChange} />
      <button type="submit">Login</button>
    </form>
  );
};

// ❌ BAD: No types
const Button = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled}>{children}</button>
);

// ❌ BAD: Any types
const handleChange = (e: any) => {
  // No type safety
};
```

---

## Summary

- Use functional components with TypeScript
- Name event handlers with `handle` prefix
- Use useState and useReducer properly
- Always include useEffect cleanup
- List all dependencies in useEffect
- Use custom hooks to share logic
- Use figma.clientStorage (not localStorage)
- Add error boundaries for safety
- Use Tailwind classes for styling
- Type all props and events with TypeScript
