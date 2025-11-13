# Claude Code Rules Directory

This directory contains reusable coding patterns and best practices that Claude agents reference to maintain consistency across the codebase.

**Philosophy**: Each pattern type exists in ONE place. Agents reference these files instead of duplicating rules.

---

## Quick Reference Guide

### For Database Schema Work
👉 **Read**: [`database-patterns.md`](./database-patterns.md)

**Covers**:
- Idempotent operations (IF NOT EXISTS)
- Foreign keys with CASCADE DELETE
- TIMESTAMP WITH TIME ZONE
- JSONB for configuration
- Strategic indexing
- Unique constraints
- Row-level security

**Used by**: `backend-database-engineer` agent

---

### For Next.js API Routes
👉 **Read**: [`nextjs-api-patterns.md`](./nextjs-api-patterns.md)

**Covers**:
- HTTP status codes (200, 400, 401, 404, 429, 500)
- Route structure with error handling
- CORS handling (OPTIONS handler)
- Request body validation
- Authorization headers
- Response consistency
- Middleware patterns

**Used by**: `backend-api-developer`, `stripe-integration-specialist` agents

---

### For TypeScript Code
👉 **Read**: [`typescript-patterns.md`](./typescript-patterns.md)

**Covers**:
- Interface vs type decisions
- Naming conventions (isLoading, handleClick, fetchUser)
- Type safety best practices
- Avoiding `any` type
- Generic patterns
- Explicit return types

**Used by**: All agents (applies everywhere TypeScript is written)

---

### For Error Handling
👉 **Read**: [`error-handling-patterns.md`](./error-handling-patterns.md)

**Covers**:
- Guard clauses (early returns)
- Try-catch blocks for async
- Descriptive error messages
- Validation error handling
- Database error handling
- Logging with context

**Used by**: All agents

---

### For Security
👉 **Read**: [`security-patterns.md`](./security-patterns.md)

**Covers**:
- Never log secrets
- Validate postMessage origins
- Authorization header validation
- JWT validation
- Environment variables
- Input validation
- SQL injection prevention
- CORS handling
- Rate limiting

**Used by**: All agents

---

### For React/Preact Components
👉 **Read**: [`react-preact-patterns.md`](./react-preact-patterns.md)

**Covers**:
- Functional components
- Event handler naming (handle prefix)
- State management with hooks
- Custom hooks for logic
- useEffect with cleanup
- Figma plugin storage (figma.clientStorage)
- Error boundaries
- Styling with Tailwind

**Used by**: `plugin-frontend-developer` agent

---

## Rule Files at a Glance

| File | Focus | Lines | Used By |
|------|-------|-------|---------|
| `typescript-patterns.md` | Type safety, naming | 70 | All agents |
| `nextjs-api-patterns.md` | API routes, CORS | 80 | Backend agents |
| `error-handling-patterns.md` | Error management | 70 | All agents |
| `security-patterns.md` | Security, validation | 80 | All agents |
| `database-patterns.md` | SQL, schema design | 75 | Database agent |
| `react-preact-patterns.md` | Components, hooks | 80 | Frontend agent |

**Total**: 290 lines of reusable patterns

---

## How Agents Use These Rules

### Example: `backend-api-developer` Agent

The agent reads this section in its spec:

```markdown
### Code Style & Patterns

**Follow these shared coding standards:**
- `.claude/rules/typescript-patterns.md`
- `.claude/rules/nextjs-api-patterns.md`
- `.claude/rules/error-handling-patterns.md`
- `.claude/rules/security-patterns.md`

**API-Specific Patterns:**
- Return correct HTTP status codes
- Validate Authorization header
- Fetch limits from database (NEVER hardcode)
- Add OPTIONS handler for CORS
```

When creating API routes, the agent:
1. References each rule file for decisions
2. Applies TypeScript patterns (interfaces, naming)
3. Applies API patterns (status codes, CORS)
4. Applies error handling patterns (try-catch, guards)
5. Applies security patterns (header validation, secrets)

---

## Adding New Rules

### Process

1. **Identify the Pattern**
   - Comes from multiple occurrences in codebase
   - Solves a common problem
   - Worth standardizing

2. **Choose or Create a Rule File**
   - Add to existing file if related to that category
   - Create new file if new category entirely

3. **Document with Examples**
   - Show ✅ GOOD examples
   - Show ❌ BAD examples
   - Explain WHY the pattern matters

4. **Update Agent References**
   - Add reference in relevant agents' "Code Style" section
   - Or create new rule file and reference from agents

### Example: Adding a Validation Pattern

**Location**: `error-handling-patterns.md`

```markdown
## Input Validation

**Use Zod for all request validation:**

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateUserSchema.parse(body);
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
  }
}
```
```

Then update agent: ✏️ Add to their Code Style section reference list.

---

## Maintenance Guidelines

### Quarterly Review
- [ ] Review each rule file
- [ ] Remove unused patterns
- [ ] Add new patterns discovered
- [ ] Update examples with real code
- [ ] Check agent references are current

### Deprecation Process
1. Mark rule as "DEPRECATED" with reason
2. Document suggested replacement
3. Remove from agent references
4. Remove in next quarterly review (after 3 months notice)

### Conflict Resolution
If two rules conflict:
1. Discuss in comment section
2. Choose single authoritative pattern
3. Add note explaining conflict
4. Ensure all agents follow chosen pattern

---

## File Navigation

### Need help with a specific decision?

**"Should I use interface or type?"**
→ See `typescript-patterns.md` → "Interface vs Type"

**"What HTTP status code for invalid input?"**
→ See `nextjs-api-patterns.md` → "HTTP Status Codes"

**"How should I log errors?"**
→ See `error-handling-patterns.md` → "Logging with Context"

**"How do I store data in Figma plugin?"**
→ See `react-preact-patterns.md` → "Storage in Figma Plugins"

**"What's the idempotency pattern for SQL?"**
→ See `database-patterns.md` → "Idempotent Operations"

**"How do I validate a token?"**
→ See `security-patterns.md` → "JWT Validation"

---

## Integration with Agents

### How Agents Read These Rules

When an agent is executing, it:

1. **Parses its agent specification** (e.g., `backend-api-developer.md`)
2. **Finds Code Style & Patterns section**:
   ```markdown
   **Follow these shared coding standards:**
   - `.claude/rules/typescript-patterns.md`
   - `.claude/rules/nextjs-api-patterns.md`
   ```
3. **Reads each referenced rule file** for guidance
4. **Applies patterns** when generating code
5. **Produces consistent output** matching all referenced rules

---

## Examples: Before vs After

### Before (Scattered Rules)

```markdown
# backend-api-developer.md
### Code Standards
- Use interfaces for extendable objects
- Name event handlers with handleXxx
- Return correct HTTP status codes
- Always validate Authorization header
- Never log tokens
- Use try-catch for async
[15+ more rules scattered here...]

# stripe-integration-specialist.md
### Code Standards
- Use interfaces for extendable objects (duplicate!)
- Always verify Stripe signature
- Never log secrets (duplicate!)
- Log all changes for audit
- Handle errors gracefully
[15+ more rules scattered here...]

# plugin-frontend-developer.md
### Code Standards
- Use interfaces for extendable objects (duplicate!)
- Name handlers with handleXxx (duplicate!)
- Use figma.clientStorage not localStorage
- Validate postMessage origin
- Never log tokens (duplicate!)
[15+ more rules scattered here...]
```

❌ Problems:
- Same rules in 3+ places (maintenance nightmare)
- Easy to miss updating one file
- Inconsistent explanations
- 50+ total lines of duplicated content

### After (Centralized Rules)

```markdown
# backend-api-developer.md
### Code Style & Patterns

**Follow these shared coding standards:**
- `.claude/rules/typescript-patterns.md`
- `.claude/rules/nextjs-api-patterns.md`
- `.claude/rules/error-handling-patterns.md`
- `.claude/rules/security-patterns.md`

**API-Specific Patterns:**
- Return correct HTTP status codes
- Fetch limits from database (NEVER hardcode)
[Agent-specific rules only, ~10 lines]

# stripe-integration-specialist.md
### Code Style & Patterns

**Follow these shared coding standards:**
- `.claude/rules/typescript-patterns.md`
- `.claude/rules/nextjs-api-patterns.md`
- `.claude/rules/error-handling-patterns.md`
- `.claude/rules/security-patterns.md`

**Webhook-Specific Patterns:**
- Always verify Stripe signature with constructEvent()
- Idempotent operations
[Agent-specific rules only, ~10 lines]

# plugin-frontend-developer.md
### Code Style & Patterns

**Follow these shared coding standards:**
- `.claude/rules/typescript-patterns.md`
- `.claude/rules/react-preact-patterns.md`
- `.claude/rules/error-handling-patterns.md`
- `.claude/rules/security-patterns.md`

**Plugin-Specific Patterns:**
- Validate postMessage origins
- Use figma.clientStorage not localStorage
[Agent-specific rules only, ~10 lines]
```

✅ Benefits:
- Shared rules in ONE place (typescript-patterns.md covers all interfaces)
- Easy to maintain (update once, benefits all agents)
- Consistent explanations (one source of truth)
- ~30 total lines of agent specs (vs 50+ before)
- No duplication

---

## Quick Links

- **Agent Specifications**: [`.claude/agents/`](..
/agents/)
- **Commands**: [`../commands/`](../commands/)
- **Implementation Summary**: [`../../docs/CURSOR_RULES_IMPLEMENTATION_SUMMARY.md`](../../docs/CURSOR_RULES_IMPLEMENTATION_SUMMARY.md)
- **Plan Documentation**: [`../../docs/FIGMA_PLUGIN_AUTH_PLAN.md`](../../docs/FIGMA_PLUGIN_AUTH_PLAN.md)

---

## Questions?

Refer to this README, review specific rule files, or check agent specifications for context on which rules apply where.

Last Updated: 2025-11-13
