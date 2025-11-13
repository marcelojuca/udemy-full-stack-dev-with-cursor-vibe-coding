# Stripe Integration Implementation Plan

## Table of Contents

1. [Stack & Architecture Overview](#stack--architecture-overview)
2. [Removed Features (Intentional)](#removed-features-intentional)
3. [Canadian Tax & Invoice Considerations](#canadian-tax--invoice-considerations)
4. [CRA Compliance & Tax Configuration for SaaS](#cra-compliance--tax-configuration-for-saas)
5. [Cybersecurity for SaaS](#cybersecurity-for-saas)
6. [Refund & Reimbursement Handling](#refund--reimbursement-handling)
7. [Stripe Configuration](#stripe-configuration)
8. [Code Implementation](#code-implementation)
9. [Tax Reporting](#tax-reporting)

---

## Stack & Architecture Overview

### Current Tech Stack

| Layer             | Technology                                 | Purpose                                     |
| ----------------- | ------------------------------------------ | ------------------------------------------- |
| **Frontend**      | Next.js 15 (App Router), React, TypeScript | UI, routing, server/client components       |
| **Styling**       | Tailwind CSS 4, Shadcn/UI (Radix UI)       | Responsive design, accessible components    |
| **Backend**       | Next.js API Routes                         | Serverless functions for API endpoints      |
| **Auth**          | NextAuth v4 + Supabase Adapter             | Google OAuth, session management            |
| **Database**      | Supabase (PostgreSQL)                      | User data, API keys, sessions               |
| **AI/Analysis**   | LangChain + OpenAI (gpt-4-1-nano)          | GitHub repo analysis with structured output |
| **Forms**         | React Hook Form + Zod                      | Validation & type-safe form handling        |
| **Notifications** | Sonner (Toast library)                     | User feedback                               |
| **Deployment**    | Vercel + GitHub Actions                    | CI/CD, automated DB schema deployment       |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐        ┌──────────────────┐      │
│  │   Frontend       │        │   API Routes     │      │
│  │  (React Pages)   │        │  (/api/*)        │      │
│  │                  │        │                  │      │
│  │ • Dashboard      │        │ • Auth (NextAuth)│      │
│  │ • Auth pages     │  ◄───► │ • GitHub analysis│      │
│  │ • API Key UI     │        │ • API key CRUD   │      │
│  │ • Hero section   │        │ • Validation     │      │
│  └──────────────────┘        └──────────────────┘      │
│         │                            │                 │
│         │ (Fetch)                    │ (Query/Insert)  │
│         └────────────┬───────────────┘                 │
│                      ▼                                 │
│          ┌──────────────────────┐                      │
│          │   SUPABASE           │                      │
│          │  (PostgreSQL)        │                      │
│          │                      │                      │
│          │ • users              │                      │
│          │ • accounts (OAuth)   │                      │
│          │ • sessions           │                      │
│          │ • user_api_keys      │                      │
│          └──────────────────────┘                      │
│                      │                                 │
│         ┌────────────┼────────────┐                    │
│         ▼            ▼            ▼                    │
│    ┌─────────┐ ┌─────────┐ ┌─────────────┐            │
│    │ OpenAI  │ │ GitHub  │ │ NextAuth    │            │
│    │ API     │ │ API     │ │ Supabase    │            │
│    │ (LLM)   │ │ (Repo   │ │ Adapter     │            │
│    │         │ │  data)  │ │             │            │
│    └─────────┘ └─────────┘ └─────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Systems

#### 1. Authentication Flow

```
User clicks "Sign in with Google"
  ↓
NextAuth handles OAuth exchange
  ↓
Supabase adapter stores session (auth, accounts, sessions tables)
  ↓
AuthContext provides user state to entire app
  ↓
Protected pages (/dashboards, /protected) check authentication
```

#### 2. GitHub Analysis Flow

```
User submits GitHub repo URL
  ↓
API endpoint validates & rate-limits request
  ↓
get-repo-info.js fetches README from GitHub
  ↓
LangChain chain.js analyzes with OpenAI (structured output via Zod)
  ↓
Returns: summary + cool facts (JSON)
  ↓
Frontend displays results
```

#### 3. API Key Management

```
User creates API key (name, type: GitHub/OpenAI)
  ↓
Key hashed before storage in user_api_keys table
  ↓
Validation endpoint tests key validity
  ↓
Hashed keys tied to user_id for access control
```

---

## Removed Features (Intentional)

During development, two features were intentionally removed to streamline the MVP and focus on core functionality. These removals are documented for future reference.

### Feature 1: Formatted Response Preview (GitHub Analysis Flow)

**Location**: `/src/components/api-demo-section.tsx` (lines 180-202)

**What was removed:**

- A formatted preview panel that displayed the AI analysis results in a human-readable format
- Showed `summary` and `cool_facts` parsed and displayed separately from raw JSON
- Was commented out to simplify the API demo interface

**Why removed:**

- The API playground already shows raw JSON responses
- Users can parse JSON manually or use their own client libraries
- Reduced complexity in the demo UI
- Focus shifted to showcasing the API capability rather than interpretation

**Code location (if you want to restore it):**

```typescript
// Previously in api-demo-section.tsx lines 180-202
// Rendered the parsed summary and cool_facts in card components
// Can be restored from git history if needed
```

**Impact on current flow:**

- ✅ API endpoint still works perfectly
- ✅ Users still receive complete JSON response
- ✅ Raw response is displayed in the API demo panel
- ❌ No pre-parsed visual breakdown (users must parse JSON themselves)

**Restoration notes:**
If you want to bring this back later:

1. The parsing logic is simple: `JSON.parse(response).summary` and `JSON.parse(response).cool_facts`
2. Original components likely used Card components from Shadcn/UI
3. Would fit nicely in a tab next to the raw JSON display

---

### Feature 2: API Documentation Button (GitHub Analysis Flow)

**Location**: `/src/components/api-demo-section.tsx` (lines 216-222)

**What was removed:**

- A button linking to `/docs` (API documentation page)
- Was intended to help users understand the GitHub analyzer API endpoints
- Commented out when the `/docs` page was not implemented

**Why removed:**

- The documentation page was planned but never developed
- Broken link would confuse users
- Better to wait until proper documentation exists before showing the link
- Current sidebar already has a "Docs" navigation link (even if `/docs` page doesn't exist yet)

**Code location (if you want to restore it):**

```typescript
// Previously in api-demo-section.tsx lines 216-222
// <Button variant="outline" asChild>
//   <Link href="/docs">API Documentation</Link>
// </Button>
```

**Impact on current flow:**

- ✅ API still fully functional
- ❌ No quick link to documentation from playground
- ⚠️ Sidebar has docs link but the page doesn't exist yet

**Restoration notes:**
To bring this feature back:

1. Create `/src/app/docs/page.tsx` with comprehensive API documentation
2. Document all endpoints: `POST /api/github-summarizer`, `POST /api/api-keys`, etc.
3. Include: request/response examples, error codes, rate limiting info, authentication
4. Uncomment the button in `api-demo-section.tsx`

---

### Impact on Stripe Integration

These removed features do **NOT** affect Stripe implementation:

- ✅ Stripe payment flow is independent of GitHub analysis
- ✅ Invoice generation doesn't depend on API documentation
- ✅ Tax calculations work regardless of formatted previews
- ✅ Webhook handlers operate independently

You can safely proceed with Stripe implementation without worrying about these removed features.

---

## Canadian Tax & Invoice Considerations

### For a Calgary (Alberta) Business Selling Digital Services

⚠️ **IMPORTANT**: The following is technical guidance only. **Consult with a Canadian accountant/lawyer** for tax and legal compliance specific to your situation.

| Consideration                  | Notes                                                                                          | Action                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| **GST/HST Registration**       | Alberta uses 5% GST (not HST). Need to register if revenue > $30k/year                         | Register with CRA, collect 5% GST    |
| **Business Number (BN)**       | Required for GST registration and tax filings                                                  | Register with CRA online             |
| **PST**                        | Not applicable in Alberta (no provincial sales tax)                                            | No action needed                     |
| **Invoice Requirements (CRA)** | Must include: business name, date, GST number, itemized services, GST collected, customer name | Configure Stripe or custom invoicing |
| **Record Keeping**             | Keep all invoices and transaction records for 6 years                                          | Stripe provides transaction history  |
| **Income Tax**                 | Business income taxed federally (15-33%) + Alberta provincial (10-15%)                         | File annual corporate return         |
| **Quarterly Filings**          | If GST registered, file GST returns (quarterly, monthly, or annually)                          | Use CRA NETFILE                      |

### CRA-Compliant Invoice Requirements

Every invoice issued to Canadian customers **MUST include**:

1. **Invoice Identification**
   - Invoice number (sequential: INV-2025-001)
   - Issue date
   - Due date (if applicable)

2. **Your Business Information**
   - Legal business name
   - Business address (Calgary, AB, Canada)
   - GST/HST registration number (if registered)
   - Contact information (optional but recommended)

3. **Customer Information**
   - Customer name
   - Customer address

4. **Itemized Services**
   - Description of service/product
   - Quantity
   - Unit price
   - Line total

5. **Tax Breakdown**
   - Subtotal (before GST)
   - GST amount (5% for Alberta)
   - **Total amount due** (in CAD)

6. **Payment Terms**
   - Payment method accepted
   - Due date (e.g., Net 30)

### GST Collection Rules

**When to Charge GST:**

- ✅ All digital services to Canadian businesses
- ✅ All digital services to Canadian consumers
- ✅ Even if customer is outside Canada but delivering to Canada
- ❌ Services to non-Canadian businesses with valid HST/GST exemption certificate (rare)

**GST Rate for Alberta:**

- 5% (no provincial sales tax in Alberta)
- Example: $100 service = $100 + $5 GST = $105 total

**GST Remittance:**

- If registered: Must file GST return (quarterly/monthly/annually)
- Report: Total GST collected minus Input Tax Credits (ITCs)
- Payment due: As per filing frequency

---

## CRA Compliance & Tax Configuration for SaaS

### Is There an Issue Selling SaaS in Canada?

✅ **NO - it's perfectly legal.** However, there are **mandatory compliance requirements** with the Canada Revenue Agency (CRA).

⚠️ **This is not legal or tax advice.** Consult with a Canadian accountant/lawyer for your specific situation.

### CRA Requirements for SaaS Business

#### 1. GST/HST Registration (MANDATORY if revenue > $30,000)

| Revenue Level      | Action               | Timing                                |
| ------------------ | -------------------- | ------------------------------------- |
| **< $30,000/year** | Optional to register | Can register voluntarily              |
| **≥ $30,000/year** | **MUST register**    | Within 30 days of exceeding threshold |

**For SaaS context:** Revenue = all customer payments for your service (including subscriptions), not just profit.

#### 2. What You Must Do With CRA

| Item                           | Details                                          | Timeline                                |
| ------------------------------ | ------------------------------------------------ | --------------------------------------- |
| **Register for GST**           | Contact CRA, provide business details            | When revenue approaches $30k            |
| **Get Business Number (BN)**   | Used for all CRA communications                  | After registration                      |
| **Get GST/HST Account Number** | Enables tax filings                              | After registration                      |
| **Register for NETFILE**       | Electronic filing system                         | Before first GST return                 |
| **Set Filing Frequency**       | Choose: Quarterly (common), Monthly, or Annually | During registration                     |
| **File Quarterly Returns**     | Report GST collected, pay if owing               | Every quarter (or chosen frequency)     |
| **Annual Income Tax Return**   | Report net business income                       | By June 15 (or earlier if incorporated) |

### CRA Registration Process (Step-by-Step)

#### Phase 1: Before Launch

- [x] Determine: Will revenue likely exceed $30k/year?
- [x] Register business with Alberta (if not done): https://www.albertaregistry.ca
- [x] Set up business bank account
- [ ] Plan pricing structure (factor in 5% GST)

#### Phase 2: When Revenue Approaches $30,000

1. **Call CRA**: 1-800-959-5525
2. **Request**: GST/HST Registration
3. **Provide**:
   - Legal business name
   - Business address (Calgary, AB)
   - Ownership details
   - Revenue estimate
4. **Receive**:
   - Business Number (BN) - 9 digits
   - GST/HST Account Number - starts with BN + identifier

#### Phase 3: After Registration

1. **Register for NETFILE**: https://www.canada.ca/netfile
   - Allows electronic tax filing
   - Required for GST returns
2. **Set up CRA My Account**: https://www.canada.ca/myaccount
   - View communications from CRA
   - Make payments
   - View filing history
3. **Choose Filing Frequency**:
   - **Quarterly** (most common for small SaaS) - Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec
   - **Monthly** (for higher volume)
   - **Annually** (if very low volume, rare)

#### Phase 4: Ongoing Compliance (Quarterly)

- [ ] Calculate total GST collected (5% on all Canadian sales)
- [ ] Calculate Input Tax Credits (GST paid on business expenses)
- [ ] File GST return via NETFILE
- [ ] Pay net GST owing
- [ ] Keep all invoices and transaction records

#### Phase 5: Annually

- [ ] File corporate income tax return (T2 if incorporated, T1 if sole proprietor)
- [ ] Report net business income (revenue minus deductible expenses)
- [ ] File by June 15 (or earlier for corporations)
- [ ] Keep CPA records for 6 years (CRA audit requirement)

### Specific SaaS Tax Rules (CRA Perspective)

#### When to Charge GST (5% for Alberta)

**✅ ALWAYS charge GST to:**

- Canadian individuals (residents)
- Canadian businesses
- Canadian government entities
- Any Canadian entity

**❌ Typically NO GST for:**

- Non-residents of Canada (foreign companies, US customers)
- **BUT:** Must document proof of non-residency for CRA audit

#### Special Considerations for Cloud/SaaS

1. **Cloud-based software** (like Xpto)
   - Classified as "supply of services" not goods
   - Same GST rules as other services
   - Location of customer matters

2. **Subscription model** (monthly/yearly)
   - GST applies to EACH billing period
   - Example: $19/month subscription = $19 + $0.95 GST = $19.95
   - Report cumulative GST in quarterly filing

3. **Free tier with paid premium**
   - Only PAID services subject to GST
   - Free tier = No GST

4. **API access / Programmatic usage**
   - Still treated as supply of services
   - Same GST rules apply

#### International Customers (US/Non-Residents)

**General rule:** No GST charged if customer is outside Canada

**Documentation required:** Must keep proof of non-residency:

- Customer's tax ID (US EIN, IRS number)
- Address in country
- Business registration in foreign country
- Attestation of non-residence

**Important:** If you claim customer is non-resident but can't prove it, CRA can assess you for GST + penalties.

### Practical Example: Your SaaS Pricing

#### Canadian Customer (Alberta resident)

```
Monthly subscription (base):     $19.00
GST (5%):                        $ 0.95
Customer charged:                $19.95

Quarterly reporting (3 months, 10 customers):
  Total revenue: $19 × 10 × 3 = $570
  GST collected: $570 × 5% = $28.50

File to CRA: Report $28.50 GST collected
  - Minus Input Tax Credits (your business expenses with GST)
  - Pay remainder to CRA
```

#### US Customer (Non-resident)

```
Monthly subscription (base):     $19.00
GST (0%):                        $ 0.00
Customer charged:                $19.00

Required: Keep documentation proving US residency
  - Tax ID number
  - Business address in US
  - Written attestation
```

### Potential Tax Issues & Red Flags

⚠️ **CRA will investigate if:**

| Issue                               | Risk                              | Prevention                              |
| ----------------------------------- | --------------------------------- | --------------------------------------- |
| No GST collection on Canadian sales | Penalties + back taxes + interest | Always collect GST, use proper invoices |
| Under-reporting revenue             | Audit, harsh penalties            | Stripe/payment records are CRA records  |
| Falsely claiming non-residents      | Significant penalties (50%+)      | Document ALL non-resident claims        |
| Missing GST returns                 | Interest charges, penalties       | File on time, use NETFILE               |
| No business registration            | Fines, business shut down         | Register with Alberta + CRA             |
| No records for 6 years              | Can't prove deductions            | Keep Stripe reports + invoices          |

### Professional Help (Strongly Recommended)

For a Canadian SaaS business, consider hiring:

#### 1. **CPA/Accountant** (Essential)

- Cost: $150-300/hour initial, or flat fee for SaaS setup (~$500-1500)
- Handles: GST/HST filings, income tax, deductions, CRA correspondence
- Find: Search "SaaS accountant Calgary" or "Canadian accountant Alberta"
- Timeline: Hire before first revenue to plan properly

#### 2. **Tax Lawyer** (Optional but helpful)

- Cost: $250-400/hour
- Use for: Privacy laws (PIPEDA), terms of service, international tax strategy
- Helpful if: Expanding to US, selling to enterprises

#### 3. **Bookkeeper** (Nice to have)

- Cost: $500-2000/month or flat fee
- Handles: Transaction recording, invoice management, GST tracking, expense categorization
- Helpful if: You want to focus on development, not accounting

### Summary: SaaS Tax Compliance in Canada

| Aspect                 | Requirement                | Your Action                                         |
| ---------------------- | -------------------------- | --------------------------------------------------- |
| **GST Registration**   | Mandatory at $30k+ revenue | Register with CRA when revenue approaches threshold |
| **GST Collection**     | 5% on all Canadian sales   | Calculate GST in Stripe, invoice separately         |
| **GST Filing**         | Quarterly (default)        | File via CRA NETFILE every quarter                  |
| **Record Keeping**     | 6 years minimum            | Keep Stripe reports, invoices, receipts             |
| **Income Tax**         | Annual T1/T2 filing        | Hire CPA for tax return                             |
| **Invoicing**          | CRA-compliant format       | Use invoice generator with GST breakdown            |
| **Non-resident Sales** | Document non-residency     | Keep tax IDs, attestations for US/international     |
| **Input Tax Credits**  | Claim GST paid on expenses | Save all receipts for business expenses             |

---

## Cybersecurity for SaaS

### Critical Security Areas for Your Application

#### **1. Authentication & Access Control** ⭐ Most Important

**Current Status:**

- ✅ DONE: Google OAuth via NextAuth (industry standard)
- ✅ DONE: Session management with Supabase adapter
- ⚠️ TODO: Multi-Factor Authentication (MFA) for users
- ⚠️ TODO: Role-based access control (RBAC) for admin functions

**Actions to take:**

1. Keep NextAuth + Google OAuth (very secure, actively maintained)
2. Add optional MFA (TOTP apps like Google Authenticator) for paid tier users
3. Implement API key rotation (users can refresh/revoke keys)
4. Rate limit login attempts (prevent brute force attacks)
5. Log all authentication attempts (success and failure)

**Example: Rate limiting login attempts**

```javascript
// Add to auth endpoint
const maxAttempts = 5;
const timeWindow = 15 * 60 * 1000; // 15 minutes

const recentAttempts = await getFailedLoginAttempts(email, timeWindow);
if (recentAttempts >= maxAttempts) {
  return Response.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
}
```

---

#### **2. Data Protection in Transit** ⭐ Very Important

**Current Status:**

- ✅ DONE: HTTPS enforced (Vercel handles this)
- ✅ DONE: Secure database with Supabase (encrypted at rest)
- ⚠️ TODO: Encrypt sensitive data in database
- ⚠️ TODO: Add security headers

**Actions to take:**

1. Enable Supabase encryption for `api_keys` table
2. Hash API keys before storage (never store plaintext)
3. Use `bcrypt` or `argon2` for hashing
4. Add security headers to all responses

**Implementation: Hash API Keys**

```javascript
// When creating an API key
import bcrypt from 'bcrypt';

const plainKey = generateRandomKey(); // e.g., "sk_prod_abc123xyz789"
const hashedKey = await bcrypt.hash(plainKey, 10);

// Store ONLY hashedKey in database, return plainKey to user once
await supabase.from('api_keys').insert({
  user_id,
  hashed_key: hashedKey,
  key_prefix: plainKey.slice(0, 8), // Show: sk_prod_abc1
  created_at: new Date(),
});

// Return to user (show only once!)
return { apiKey: plainKey, message: "Save this key securely, you won't see it again" };
```

**Add Security Headers to Next.js**

```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },
};
```

---

#### **3. API Key Security** ⭐ Very Important

**Current Issues:**

- Keys visible in dashboard (standard but risky if compromised)
- No tracking of key usage
- No key expiration

**Improvements needed:**

1. [ ] Hash keys before storage (see above)
2. [ ] Show key only ONCE on creation (like GitHub, like AWS)
3. [ ] Implement key rotation/expiration
4. [ ] Add "last used" tracking to detect compromised keys
5. [ ] Log all API key usage (audit trail)
6. [ ] Allow users to revoke keys immediately

**Database schema update:**

```sql
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS (
  hashed_key TEXT NOT NULL,           -- bcrypt hash of actual key
  key_prefix TEXT,                    -- Show users: sk_prod_abc1...
  last_used_at TIMESTAMP,             -- Track usage for security
  last_used_ip TEXT,                  -- Track which IP used it
  expires_at TIMESTAMP,               -- Optional expiration
  rotated_at TIMESTAMP,               -- Track rotations
  revoked_at TIMESTAMP                -- When revoked (if applicable)
);

CREATE TABLE IF NOT EXISTS api_key_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  action TEXT, -- "created", "used", "rotated", "revoked", "deleted"
  ip_address TEXT,
  user_agent TEXT,
  status TEXT, -- "success", "failed"
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### **4. Database Security** ⭐ Very Important

**Current Status:**

- ✅ DONE: Supabase handles most security
- ✅ DONE: Foreign key constraints, cascade delete
- ⚠️ TODO: Row-level security (RLS) policies
- ⚠️ TODO: Audit logging of sensitive operations

**Actions to take:**

1. Enable Supabase Row-Level Security (RLS)
2. Example: User can only see their own API keys
3. Log all sensitive database changes
4. Never expose database details in error messages

**Enable RLS on api_keys table:**

```sql
-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own keys
CREATE POLICY "Users can only view their own API keys"
ON api_keys FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only create keys for themselves
CREATE POLICY "Users can only create their own API keys"
ON api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own keys
CREATE POLICY "Users can only update their own API keys"
ON api_keys FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own keys
CREATE POLICY "Users can only delete their own API keys"
ON api_keys FOR DELETE
USING (auth.uid() = user_id);
```

---

#### **5. Payment Security** ⭐ Very Important (for Stripe)

**Current Status:**

- ✅ DONE: Stripe PCI-DSS compliant (Level 1)
- ✅ DONE: Use Stripe payment intents (not raw CC)
- ✅ DONE: Never handle raw credit card data
- ⚠️ TODO: Webhook signature verification
- ⚠️ TODO: Idempotency keys for payment operations

**Actions to take:**

1. Always use Stripe Elements (never raw card input) ✅ Already planned
2. Verify webhook signatures (already in code examples)
3. Use idempotency keys to prevent duplicate charges
4. Store minimal payment info (only what CRA needs for invoices)
5. Stripe handles PCI-DSS compliance, not your app

**Implement idempotency for payments:**

```javascript
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  const { amountCents, description, userId } = await request.json();
  const idempotencyKey = uuidv4(); // Unique key per request

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: 'cad',
        description,
        metadata: { userId },
      },
      {
        idempotencyKey, // Stripe prevents duplicate charges with same key
      }
    );

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // If error, client can retry with same idempotencyKey
    // Stripe will return same paymentIntent, preventing double-charge
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

---

#### **6. Code & Dependency Security**

**Current Status:**

- ✅ DONE: `.env` files in `.gitignore` (no secrets in git)
- ⚠️ TODO: Dependency scanning
- ⚠️ TODO: Regular security updates

**Actions to take:**

1. Use `npm audit` regularly to check for vulnerabilities

   ```bash
   npm audit              # Check for issues
   npm audit fix          # Auto-fix compatible issues
   npm audit fix --force  # Fix everything (may break things)
   ```

2. Enable GitHub Dependabot for automatic updates
   - Go to Settings → Code security & analysis → Enable Dependabot
   - Dependabot will create PRs for security updates automatically

3. Rotate secrets regularly
   - Stripe API keys: Rotate every 90 days
   - Database passwords: Every 6 months
   - NextAuth secret: Every year

4. Use GitHub branch protection with required status checks
   - Already implemented in your workflow ✅

---

#### **7. Logging & Monitoring**

**Current Status:**

- ⚠️ TODO: Security logging
- ⚠️ TODO: Alerts on suspicious activity

**What to log:**

```javascript
// Authentication
- All login attempts (success + failure)
- Login source (IP, user agent)
- Password changes
- Session creations/terminations

// API Keys
- Key creation/deletion/rotation
- All API key usage
- Failed API authentication attempts
- Unusual usage patterns (10x normal volume)

// Payments
- All refunds initiated
- Large payments (> $500)
- Payment failures
- Webhook processing errors

// Admin Actions
- Permission changes
- Configuration changes
- Data exports
```

**Example: Log security events**

```javascript
async function logSecurityEvent(
  eventType: string,
  userId: string,
  details: object
) {
  await supabase.from('security_audit_log').insert({
    event_type: eventType,
    user_id: userId,
    ip_address: getClientIP(),
    user_agent: navigator.userAgent,
    details,
    created_at: new Date(),
  });

  // Alert admin if suspicious
  if (isSuspicious(eventType, details)) {
    await sendAdminAlert(`[SECURITY] ${eventType} from ${userId}`);
  }
}
```

---

#### **8. PIPEDA Compliance** (Canada - Very Important!)

**What is PIPEDA?**

- Personal Information Protection and Electronic Documents Act
- Canada's federal privacy law
- Applies to all Canadian businesses collecting personal data

**Required actions for your SaaS:**

1. **Privacy Policy**
   - What personal data do you collect? (email, name, usage patterns)
   - How do you use it? (authentication, billing, service delivery)
   - How long do you keep it? (Until account deletion or 6 years for CRA)
   - Who has access? (Your team, Stripe, OpenAI, Supabase)
   - Where is it stored? (Supabase - Canada)

2. **Terms of Service**
   - Define data usage rights
   - State what users agree to
   - Include limitation of liability
   - Include data breach notification policy

3. **Data Processing**
   - Only collect what's needed (don't over-collect)
   - Be transparent about collection
   - Get explicit consent for optional data

4. **User Rights**
   - Allow users to access their data
   - Allow users to delete their account (with data deletion)
   - Allow users to export their data
   - Provide data in portable format (JSON/CSV)

5. **Data Breach Incident Response**
   - Have a plan BEFORE breach happens
   - Know who to notify (affected users, PIPEDA commissioner, etc.)
   - Keep incident logs
   - Test incident response plan annually

**Example: Add PIPEDA compliance endpoint**

```javascript
// POST /api/user/data-export
// Allow user to download their data as JSON

export async function POST(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Fetch all user data
  const [user, apiKeys, orders, invoices] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('api_keys').select('*').eq('user_id', userId),
    supabase.from('orders').select('*').eq('user_id', userId),
    supabase.from('invoices').select('*').eq('user_id', userId),
  ]);

  // Return as JSON
  const userData = {
    user: user.data,
    apiKeys: apiKeys.data.map((k) => ({ ...k, hashed_key: '***REDACTED***' })),
    orders: orders.data,
    invoices: invoices.data,
    exportedAt: new Date().toISOString(),
  };

  return Response.json(userData);
}

// DELETE /api/user/delete-account
// Allow user to delete their account and all data

export async function DELETE(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Delete cascades to api_keys, orders, invoices via foreign keys
  await supabase.from('users').delete().eq('id', userId);

  return Response.json({ message: 'Account and all data deleted' });
}
```

---

### Cybersecurity Checklist

Before launching your SaaS:

1. [ ] Enable NextAuth + Google OAuth (already done ✅)
1. [ ] Hash all sensitive data in database (API keys, etc.)
1. [ ] Add security headers to Next.js config
1. [ ] Enable Row-Level Security (RLS) on Supabase tables
1. [ ] Implement rate limiting on login endpoint
1. [ ] Add idempotency keys to payment operations
1. [ ] Enable Stripe webhook signature verification
1. [ ] Set up audit logging for sensitive operations
1. [ ] Create privacy policy (PIPEDA and LGPD compliant)
1. [ ] Create terms of service
1. [ ] Implement data export endpoint
1. [ ] Implement account deletion endpoint
1. [ ] Enable GitHub Dependabot for dependency scanning
1. [ ] Set up security.txt file: https://yourdomain.com/.well-known/security.txt
1. [ ] Configure Content-Security-Policy headers
1. [ ] Test all security features before launch

---

## Refund & Reimbursement Handling

### Payment Refund Types

#### **Full Refund** (Customer gets 100% back)

- Example: Wrong credit card charged, customer requests refund
- Stripe processes: Refund → Original payment method
- Timeline: 5-10 business days

#### **Partial Refund** (Customer gets % back)

- Example: Customer used service for 2 weeks out of 4-week month, requests prorated refund
- Stripe processes: Refund → Original payment method
- Timeline: 5-10 business days

#### **No Refund** (Service delivered)

- Example: Monthly subscription completed, customer used service
- Policy: Clearly state in terms of service

---

### Stripe Refund Rules (Canada)

| Rule                  | Details                                                           |
| --------------------- | ----------------------------------------------------------------- |
| **Refund Timeline**   | Can refund within 120 days of original charge (industry standard) |
| **Currency**          | Refunds processed in original currency (CAD)                      |
| **Processing Time**   | Takes 5-10 business days to appear in customer account            |
| **Processing Fees**   | Stripe may retain processing fees (check your agreement)          |
| **GST Treatment**     | GST collected must be refunded proportionally with service        |
| **CRA Documentation** | Must document reason for refund for audit trail                   |
| **Reversal**          | Can be reversed if customer disputes (chargeback)                 |

---

### Database Schema for Refunds

Add to `setup-database.js`:

```sql
-- Refunds Table: Track all refunds for compliance
CREATE TABLE IF NOT EXISTS refunds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_refund_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,           -- Amount refunded (in cents)
  gst_refunded_cents INTEGER,              -- GST portion of refund
  reason TEXT NOT NULL,                    -- "duplicate", "customer_request", "service_issue", "other"
  status TEXT DEFAULT 'pending',           -- pending, completed, failed, rejected
  refund_date DATE,                        -- Date refund was initiated
  processed_date DATE,                     -- Date refund hit customer account
  notes TEXT,                              -- Internal notes about refund
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Refund audit log: Track all refund actions for CRA
CREATE TABLE IF NOT EXISTS refund_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  refund_id UUID NOT NULL REFERENCES refunds(id) ON DELETE CASCADE,
  action TEXT,                    -- "initiated", "processed", "reversed", etc.
  status_before TEXT,
  status_after TEXT,
  changed_by TEXT,                -- User ID or "system"
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance and querying
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_stripe_id ON refunds(stripe_refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_date ON refunds(refund_date);
```

---

### Refund API Endpoint Implementation

**File**: `src/app/api/refunds/create-refund.js`

```javascript
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { calculateGST } from '@/lib/stripe';

/**
 * POST /api/refunds/create-refund
 * Creates a refund for a completed charge
 *
 * Request body:
 * {
 *   orderId: string,
 *   amountCents?: number,  // Optional, partial refund. If omitted = full refund
 *   reason: "duplicate" | "customer_request" | "service_issue" | "other",
 *   notes?: string
 * }
 *
 * Response: { refundId, stripeRefundId, amount, gstRefunded, status }
 */
export async function POST(request) {
  try {
    const { orderId, amountCents, reason, notes } = await request.json();

    // Validate inputs
    if (!orderId || !reason) {
      return Response.json({ error: 'Missing required fields: orderId, reason' }, { status: 400 });
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Can only refund completed orders
    if (order.status !== 'completed') {
      return Response.json(
        { error: 'Can only refund completed orders. Current status: ' + order.status },
        { status: 400 }
      );
    }

    // Determine refund amount
    const refundAmount = amountCents || order.amount_cents; // Full refund if not specified

    // Validate refund amount doesn't exceed original charge
    if (refundAmount > order.amount_cents) {
      return Response.json(
        {
          error: `Refund amount (${refundAmount / 100}) exceeds charge amount (${order.amount_cents / 100})`,
        },
        { status: 400 }
      );
    }

    if (refundAmount <= 0) {
      return Response.json({ error: 'Refund amount must be greater than 0' }, { status: 400 });
    }

    // Calculate GST to refund (proportional)
    const gstRefunded = Math.round(
      (refundAmount / order.amount_cents) * (order.amount_cents * 0.05)
    );

    // Create refund in Stripe
    const stripeRefund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount: refundAmount,
      reason: mapReasonToStripeReason(reason),
      metadata: {
        order_id: orderId,
        reason: reason,
        notes: notes,
        gst_refunded: gstRefunded,
      },
    });

    // Store refund in database
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        user_id: order.user_id,
        order_id: orderId,
        stripe_refund_id: stripeRefund.id,
        amount_cents: refundAmount,
        gst_refunded_cents: gstRefunded,
        reason,
        status: stripeRefund.status === 'succeeded' ? 'completed' : 'pending',
        refund_date: new Date().toISOString().split('T')[0],
        notes,
      })
      .select()
      .single();

    if (refundError) throw refundError;

    // Log refund action
    await supabase.from('refund_audit_log').insert({
      refund_id: refund.id,
      action: 'initiated',
      status_before: 'N/A',
      status_after: refund.status,
      changed_by: order.user_id,
      reason: reason,
    });

    // Update order status if full refund
    if (refundAmount === order.amount_cents) {
      await supabase.from('orders').update({ status: 'refunded' }).eq('id', orderId);
    }

    return Response.json({
      refundId: refund.id,
      stripeRefundId: stripeRefund.id,
      amountRefunded: refundAmount,
      gstRefunded: gstRefunded,
      totalRefunded: refundAmount + gstRefunded,
      status: stripeRefund.status,
      message: `Refund of ${formatCAD(refundAmount + gstRefunded)} initiated successfully. Will appear in 5-10 business days.`,
    });
  } catch (error) {
    console.error('Refund creation error:', error);
    return Response.json({ error: error.message || 'Refund failed' }, { status: 500 });
  }
}

/**
 * Map our reason codes to Stripe's accepted values
 */
function mapReasonToStripeReason(reason) {
  const mapping = {
    duplicate: 'duplicate',
    customer_request: 'requested_by_customer',
    service_issue: 'requested_by_customer', // Closest match
    other: 'requested_by_customer',
  };
  return mapping[reason] || 'requested_by_customer';
}

function formatCAD(cents) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}
```

---

### Refund Webhook Handler

**Add to**: `src/app/api/webhooks/stripe.js`

```javascript
// Add to webhook event handlers

case 'charge.refunded':
  await handleRefundWebhook(event.data.object);
  break;

case 'charge.dispute.created':
  await handleDisputeCreated(event.data.object);
  break;

case 'charge.dispute.closed':
  await handleDisputeClosed(event.data.object);
  break;

// Handler functions

async function handleRefundWebhook(charge) {
  // Stripe confirms refund was processed
  const { error } = await supabase
    .from('refunds')
    .update({
      status: 'completed',
      processed_date: new Date().toISOString().split('T')[0],
    })
    .eq('stripe_refund_id', charge.refunds?.data?.[0]?.id);

  if (error) throw error;
  console.log(`✅ Refund confirmed: ${charge.refunds?.data?.[0]?.id}`);
}

async function handleDisputeCreated(dispute) {
  // Customer disputed the charge (chargeback)
  console.warn(`⚠️ Dispute created: ${dispute.id} - Amount: ${dispute.amount / 100}`);

  // TODO: Send admin alert
  // TODO: Log for investigation
}

async function handleDisputeClosed(dispute) {
  // Dispute was resolved
  console.log(`✅ Dispute closed: ${dispute.id} - Status: ${dispute.status}`);

  // TODO: Update order status if lost
}
```

---

### Refund Management UI Component

**File**: `src/components/payment/refund-modal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface RefundModalProps {
  orderId: string;
  orderAmount: number; // in cents
  orderDescription: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  orderId,
  orderAmount,
  orderDescription,
  onSuccess,
  onClose,
}) => {
  const { toast } = useToast();
  const [refundAmount, setRefundAmount] = useState(orderAmount);
  const [reason, setReason] = useState('customer_request');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/refunds/create-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amountCents: refundAmount,
          reason,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: 'Refund Initiated ✅',
        description: `${formatCAD(refundAmount)} refund (including ${formatCAD(data.gstRefunded)} GST) will appear in 5-10 business days.`,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: 'Refund Failed ❌',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCAD = (cents: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(
      cents / 100
    );

  const isPartialRefund = refundAmount < orderAmount;
  const gstRefund = Math.round((refundAmount / orderAmount) * (orderAmount * 0.05));
  const totalRefund = refundAmount + gstRefund;

  return (
    <Card className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Process Refund</h2>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <p className="font-semibold text-blue-900">Order Details:</p>
        <p className="text-blue-800">{orderDescription}</p>
        <p className="text-blue-800">Original charge: {formatCAD(orderAmount)}</p>
      </div>

      <div className="space-y-4">
        {/* Refund Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Refund Amount</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={refundAmount / 100}
              onChange={(e) =>
                setRefundAmount(Math.round(e.target.valueAsNumber * 100))
              }
              max={orderAmount / 100}
              step="0.01"
              className="flex-1 px-3 py-2 border rounded"
            />
            <span className="text-sm text-gray-600">CAD</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Maximum: {formatCAD(orderAmount)}
            {isPartialRefund && ` (Partial refund selected)`}
          </p>
        </div>

        {/* GST Breakdown */}
        <div className="p-3 bg-gray-50 rounded space-y-1">
          <div className="flex justify-between text-sm">
            <span>Refund Amount:</span>
            <span>{formatCAD(refundAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST (5%) to refund:</span>
            <span>{formatCAD(gstRefund)}</span>
          </div>
          <div className="border-t pt-1 flex justify-between text-sm font-semibold">
            <span>Total to refund:</span>
            <span>{formatCAD(totalRefund)}</span>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">Reason for Refund</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="customer_request">Customer Request</option>
            <option value="service_issue">Service Issue / Complaint</option>
            <option value="duplicate">Duplicate Charge</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Notes (Required for CRA audit)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain why refund is being issued (for tax records)..."
            className="w-full px-3 py-2 border rounded text-sm"
            rows={3}
            required
          />
        </div>

        {/* Warning */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ Important:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Refunds appear in customer account within 5-10 business days</li>
            <li>GST will be refunded proportionally</li>
            <li>All refunds are logged for CRA audit trail</li>
            <li>Document reason clearly for tax compliance</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={loading || !notes.trim()}
            className="flex-1"
          >
            {loading ? 'Processing...' : `Refund ${formatCAD(totalRefund)}`}
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

---

### Refund Policy (For Terms of Service)

**Include in your TOS:**

```markdown
## Refund & Reimbursement Policy

### Full Refund (100%)

- Available within **7 days** of purchase for any reason
- No questions asked
- Refund appears in customer account within 5-10 business days

### Partial Refund (Prorated)

- **Monthly subscriptions**: Cancel mid-month and receive prorated refund for unused days
- Example: Cancel on day 15 of 30-day month = 50% refund
- Must request within the current billing period

### No Refund

- After 7-day full refund period
- For services fully delivered and used
- Non-refundable purchases clearly marked at checkout

### GST Treatment

- All refunds include proportional GST refund
- Example: $100 purchase + $5 GST refunded = $105 refunded total
- GST is not a separate charge; it's included in the refund

### Processing

- Refunds issued to original payment method used
- **Takes 5-10 business days** to appear in customer account
- Appears as a credit on customer's credit card/bank statement
- Contact support to check refund status

### How to Request

- Email: support@yourdomain.com
- Provide: Order ID, reason for refund, any relevant details
- Response time: 24 business hours

### Chargebacks & Disputes

- If customer initiates chargeback/dispute with payment processor
- We will investigate and respond to bank
- Fraudulent chargebacks may result in account suspension
- Valid disputes will be refunded

### Special Cases

- **Service outage**: Automatic credit issued for affected period
- **Billing error**: Immediate refund + credit for future usage
- **Upgrade/downgrade**: Prorated credit applied to next billing cycle
```

---

### CRA Compliance for Refunds

**Important for Canadian tax purposes:**

#### Document All Refunds

```sql
-- Your refunds table tracks:
- refund_id: Unique identifier
- amount_cents: What was refunded
- gst_refunded_cents: GST portion
- reason: Why refunded
- notes: Details for audit
- refund_date: When initiated
- Keep for 6 years per CRA requirement
```

#### GST Adjustment in Quarterly Filings

```
Example:

Month 1 - Sales:
  Total sales: $1,000
  GST collected: $50

Month 2 - Sales + Refund:
  Total sales: $800
  Refunds issued: $200 (with $10 GST)
  Net GST collected this month: $40 - $10 = $30

Quarterly GST Return (Jan-Mar):
  Total GST collected (Jan): $50
  Total GST collected (Feb): $30
  Total GST collected (Mar): $40
  -----------
  Total GST to report: $120
  File with CRA via NETFILE
```

#### Calculate Net GST for Filing

```javascript
// Monthly: Calculate net GST (collected minus refunded)
const salesGST = totalSales * 0.05;
const refundsGST = totalRefunds * 0.05;
const netGST = salesGST - refundsGST;

// Example:
const totalSales = 10000; // $10,000 in sales
const totalRefunds = 1500; // $1,500 refunded
const salesGST = 10000 * 0.05; // $500
const refundsGST = 1500 * 0.05; // $75
const netGST = 500 - 75; // $425 to report/pay

// Quarterly filing: Sum all monthly net GST
```

---

### Refund Processing Checklist

- [ ] User requests refund (email or dashboard form)
- [ ] Admin reviews order and reason
- [ ] Admin verifies refund is eligible
- [ ] Admin initiates refund via dashboard/modal
- [ ] System creates refund record in database
- [ ] Stripe processes refund to customer
- [ ] System logs refund in audit trail (for CRA)
- [ ] Customer receives notification email
- [ ] Refund appears in customer account (5-10 business days)
- [ ] Monthly: Calculate refunds for GST adjustment
- [ ] Quarterly: Report net GST to CRA (including refunds)
- [ ] Annually: Keep all refund records for CPA/audit

---

## Stripe Configuration

### Phase 1: Stripe Account Setup (No Code Yet)

#### Step 1: Create Stripe Canada Account

1. Go to https://stripe.com/ca
2. Sign up as "Business" (not individual)
3. Complete business verification:
   - Legal business name
   - Business registration (Alberta)
   - Ownership details
   - GST/HST number (once you have it from CRA)

#### Step 2: Configure Business Details in Stripe Dashboard

1. Navigate to **Settings → Business Details**
2. Add:
   - Business legal name
   - Business address (Calgary, AB, Canada)
   - GST # (once registered with CRA)
3. Enable:
   - **Stripe Tax** - Helps automatically calculate and remit GST
   - Tax registration in Canada/Alberta
4. Create API Keys:
   - Go to **Developers → API Keys**
   - Copy: **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - Copy: **Secret Key** (starts with `sk_test_` or `sk_live_`)

#### Step 3: Set Up Webhook Endpoints

1. Go to **Developers → Webhooks**
2. Click **Add Endpoint**
3. Webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded` - Payment completed successfully
   - `payment_intent.payment_failed` - Payment failed
   - `charge.succeeded` - Charge successfully processed
   - `invoice.created` - Invoice generated
   - `invoice.payment_succeeded` - Invoice paid
5. Copy **Signing Secret** (starts with `whsec_`)

#### Step 4: Test Mode vs. Live Mode

- **Development**: Use Test keys (`pk_test_*`, `sk_test_*`)
- **Production**: Switch to Live keys (`pk_live_*`, `sk_live_*`)
  - Requires identity verification
  - Requires business verification
  - GST/HST number must be in account

### Phase 2: Code Implementation

---

## Code Implementation

### Step 1: Install Dependencies

```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

### Step 2: Update Environment Variables

Create/update `.env.local` (development) and `.env.production.local` (production):

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # From Stripe Dashboard (safe for frontend)
STRIPE_SECRET_KEY=sk_test_... # NEVER expose to frontend
STRIPE_WEBHOOK_SECRET=whsec_... # From Webhook settings

# Business Info for Invoices (CRA Compliance)
NEXT_PUBLIC_BUSINESS_NAME=Your Company Legal Name
NEXT_PUBLIC_BUSINESS_GST_NUMBER=GST/HST XXXXXXXXXX
NEXT_PUBLIC_BUSINESS_ADDRESS=Your Address
NEXT_PUBLIC_BUSINESS_CITY=Calgary
NEXT_PUBLIC_BUSINESS_PROVINCE=AB
NEXT_PUBLIC_BUSINESS_POSTAL_CODE=T2X 1A1
NEXT_PUBLIC_BUSINESS_COUNTRY=Canada
NEXT_PUBLIC_BUSINESS_EMAIL=contact@yourbusiness.com
```

### Step 3: Update Database Schema

Add these tables to `setup-database.js` and `setup-production-db.js`:

```sql
-- Orders Table: Tracks all payments
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL, -- Store in cents (e.g., $10.50 = 1050)
  currency TEXT DEFAULT 'CAD',
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  metadata JSONB, -- Store additional data (service type, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices Table: CRA-compliant invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE NOT NULL, -- Auto-generated: INV-2025-001, INV-2025-002, etc.
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  subtotal_cents INTEGER NOT NULL, -- Amount before GST
  gst_collected_cents INTEGER NOT NULL, -- 5% of subtotal for Alberta
  total_cents INTEGER NOT NULL, -- subtotal + gst_collected
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Line Items Table: Individual services on invoice
CREATE TABLE IF NOT EXISTS line_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL, -- Service description
  quantity INTEGER DEFAULT 1,
  unit_price_cents INTEGER NOT NULL, -- Price per unit (in cents)
  total_cents INTEGER NOT NULL, -- quantity * unit_price
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tax Summary Table: Monthly/quarterly tax tracking
CREATE TABLE IF NOT EXISTS tax_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue_cents INTEGER NOT NULL,
  gst_collected_cents INTEGER NOT NULL,
  gst_remitted_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'unreported', -- unreported, reported, remitted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_summary_user_id ON tax_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_summary_period ON tax_summary(period_start, period_end);
```

### Step 4: Create Stripe Service Library

**File**: `src/lib/stripe.js`

```javascript
import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20',
});

/**
 * Calculate GST for Alberta (5%)
 * @param {number} amountCents - Amount in cents
 * @returns {number} GST amount in cents
 */
export const calculateGST = (amountCents) => {
  return Math.round(amountCents * 0.05);
};

/**
 * Generate invoice number (CRA compliant format)
 * @returns {string} Invoice number like INV-2025-001
 */
export const generateInvoiceNumber = async (supabase, userId) => {
  const year = new Date().getFullYear();

  // Get highest invoice number for this year
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .like('invoice_number', `INV-${year}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].invoice_number.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
};

/**
 * Format money for display (CAD)
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted string like $10.50
 */
export const formatCAD = (cents) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
};
```

### Step 5: Create Invoice Service

**File**: `src/lib/invoice-service.js`

```javascript
import { stripe, generateInvoiceNumber, calculateGST } from './stripe';
import { supabase } from './supabase';

/**
 * Create an invoice (called after successful payment)
 * @param {Object} params - Invoice parameters
 * @returns {Promise<Object>} Created invoice record
 */
export const createInvoice = async ({
  userId,
  orderId,
  stripeInvoiceId,
  customerName,
  customerEmail,
  customerAddress,
  lineItems, // Array of { description, quantity, unitPriceCents }
  notes = '',
}) => {
  // Calculate totals
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );
  const gstCents = calculateGST(subtotalCents);
  const totalCents = subtotalCents + gstCents;

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(supabase, userId);

  // Get today's date and add 30 days for due date
  const issueDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Create invoice record
  const { data: invoiceData, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      order_id: orderId,
      stripe_invoice_id: stripeInvoiceId,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_address: customerAddress,
      subtotal_cents: subtotalCents,
      gst_collected_cents: gstCents,
      total_cents: totalCents,
      issue_date: issueDate,
      due_date: dueDate,
      status: 'sent',
      notes,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Create line items
  const lineItemsForDB = lineItems.map((item) => ({
    invoice_id: invoiceData.id,
    description: item.description,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    total_cents: item.quantity * item.unitPriceCents,
  }));

  const { error: lineError } = await supabase.from('line_items').insert(lineItemsForDB);

  if (lineError) throw lineError;

  return invoiceData;
};

/**
 * Get invoice HTML for PDF generation (CRA compliant)
 * @param {Object} invoice - Invoice record from database
 * @returns {string} HTML invoice
 */
export const generateInvoiceHTML = async (invoice) => {
  // Fetch line items
  const { data: lineItems } = await supabase
    .from('line_items')
    .select('*')
    .eq('invoice_id', invoice.id);

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME;
  const businessGST = process.env.NEXT_PUBLIC_BUSINESS_GST_NUMBER;
  const businessAddress = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS;
  const businessCity = process.env.NEXT_PUBLIC_BUSINESS_CITY;
  const businessProvince = process.env.NEXT_PUBLIC_BUSINESS_PROVINCE;
  const businessPostal = process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE;

  const formatCents = (cents) => (cents / 100).toFixed(2);

  const lineItemsHTML = lineItems
    .map(
      (item) =>
        `
    <tr>
      <td>${item.description}</td>
      <td style="text-align: right;">${item.quantity}</td>
      <td style="text-align: right;">$${formatCents(item.unit_price_cents)}</td>
      <td style="text-align: right;">$${formatCents(item.total_cents)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .business-info h1 { margin: 0; font-size: 24px; }
          .invoice-title { font-size: 32px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .totals { margin: 20px 0; width: 300px; margin-left: auto; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-amount { display: flex; justify-content: space-between; padding: 12px; background: #f9f9f9; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="business-info">
              <h1>${businessName}</h1>
              <p>${businessAddress}</p>
              <p>${businessCity}, ${businessProvince} ${businessPostal}</p>
              <p>GST/HST #: ${businessGST}</p>
            </div>
            <div class="invoice-title">${invoice.invoice_number}</div>
          </div>

          <!-- Dates -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <p><strong>Invoice Date:</strong> ${invoice.issue_date}</p>
              <p><strong>Due Date:</strong> ${invoice.due_date}</p>
            </div>
          </div>

          <!-- Bill To -->
          <div style="margin-bottom: 30px;">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer_name}</strong></p>
            <p>${invoice.customer_email}</p>
            ${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
          </div>

          <!-- Line Items -->
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${formatCents(invoice.subtotal_cents)}</span>
            </div>
            <div class="totals-row">
              <span>GST (5%):</span>
              <span>$${formatCents(invoice.gst_collected_cents)}</span>
            </div>
            <div class="total-amount">
              <span>Total Due (CAD):</span>
              <span>$${formatCents(invoice.total_cents)}</span>
            </div>
          </div>

          <!-- Notes -->
          ${invoice.notes ? `<div style="margin-top: 30px; padding: 15px; background: #f9f9f9;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}

          <!-- Footer -->
          <div class="footer">
            <p>Payment Terms: Net 30</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
```

### Step 6: Create Payment API Endpoint

**File**: `src/app/api/payments/create-payment.js`

```javascript
import { stripe, calculateGST } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/payments/create-payment
 * Creates a Stripe payment intent
 *
 * Request body:
 * {
 *   userId: string,
 *   amountCents: number,
 *   description: string,
 *   customerName: string,
 *   customerEmail: string,
 *   metadata?: object
 * }
 */
export async function POST(request) {
  try {
    const {
      userId,
      amountCents,
      description,
      customerName,
      customerEmail,
      metadata = {},
    } = await request.json();

    // Validate inputs
    if (!userId || !amountCents || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amountCents <= 0) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Calculate GST (5% for Alberta)
    const gstCents = calculateGST(amountCents);
    const totalCents = amountCents + gstCents;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'cad',
      description,
      metadata: {
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        gst_amount_cents: gstCents,
        subtotal_cents: amountCents,
        ...metadata,
      },
    });

    // Store order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents: totalCents,
        currency: 'CAD',
        description,
        status: 'pending',
        metadata: {
          customer_name: customerName,
          customer_email: customerEmail,
        },
      })
      .select()
      .single();

    if (orderError) throw orderError;

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      totalAmount: totalCents,
      gstAmount: gstCents,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json({ error: error.message || 'Payment creation failed' }, { status: 500 });
  }
}
```

### Step 7: Create Webhook Handler

**File**: `src/app/api/webhooks/stripe.js`

```javascript
import { stripe } from '@/lib/stripe';
import { createInvoice } from '@/lib/invoice-service';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events
 */
export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  const { user_id, customer_name, customer_email, gst_amount_cents, subtotal_cents } =
    paymentIntent.metadata;

  // Find order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (orderError) throw orderError;

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', order.id);

  if (updateError) throw updateError;

  // Create invoice
  const invoice = await createInvoice({
    userId: user_id,
    orderId: order.id,
    stripeInvoiceId: paymentIntent.id,
    customerName: customer_name,
    customerEmail: customer_email,
    customerAddress: '',
    lineItems: [
      {
        description: order.description,
        quantity: 1,
        unitPriceCents: subtotal_cents,
      },
    ],
  });

  // TODO: Send invoice email to customer
  console.log(`Invoice created: ${invoice.invoice_number}`);

  // TODO: Update tax summary (monthly/quarterly tracking)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) throw error;
  console.log(`Payment failed: ${paymentIntent.id}`);
}

/**
 * Handle refund
 */
async function handleRefund(charge) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('stripe_payment_intent_id', charge.payment_intent);

  if (error) throw error;
  console.log(`Refund processed: ${charge.id}`);
}
```

### Step 8: Create Checkout Form Component

**File**: `src/components/payment/checkout-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  amount: number; // in cents
  description: string;
  customerName: string;
  customerEmail: string;
  onSuccess?: (orderId: string) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  description,
  customerName,
  customerEmail,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({ title: 'Error', description: 'Stripe not loaded' });
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on backend
      const createRes = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // TODO: Get from auth context
          amountCents: amount,
          description,
          customerName,
          customerEmail,
        }),
      });

      const { clientSecret, orderId, totalAmount, gstAmount } =
        await createRes.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: { name: customerName, email: customerEmail },
          },
        }
      );

      if (error) {
        toast({ title: 'Payment failed', description: error.message });
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Success',
          description: 'Payment completed. Invoice sent to your email.',
        });
        onSuccess?.(orderId);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCAD = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const gst = Math.round(amount * 0.05);
  const total = amount + gst;

  return (
    <Card className="p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>{formatCAD(amount)}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span>GST (5%):</span>
          <span>{formatCAD(gst)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total (CAD):</span>
          <span>{formatCAD(total)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded">
          <CardElement
            options={{
              style: {
                base: { fontSize: '16px', color: '#333' },
                invalid: { color: '#dc2626' },
              },
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full"
        >
          {loading ? 'Processing...' : `Pay ${formatCAD(total)}`}
        </Button>
      </form>

      <p className="text-xs text-gray-600 mt-4">
        Your payment is processed securely by Stripe. GST is collected as per
        Canadian tax regulations.
      </p>
    </Card>
  );
};
```

### Step 9: Wrap App with Stripe Provider

Update `src/app/providers.tsx`:

```typescript
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AuthProvider } from '@/contexts/auth-context';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProvider>
        <Elements stripe={stripePromise}>
          {children}
        </Elements>
      </AuthProvider>
    </SessionProvider>
  );
};
```

### Step 10: Create Tax Dashboard Component

**File**: `src/components/tax-dashboard.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface TaxSummary {
  period_start: string;
  period_end: string;
  total_revenue_cents: number;
  gst_collected_cents: number;
  gst_remitted_cents: number;
  status: string;
}

export const TaxDashboard: React.FC = () => {
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxData = async () => {
      const userId = 'current-user-id'; // TODO: Get from auth context

      // Fetch current month tax summary
      const { data: taxData } = await supabase
        .from('tax_summary')
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      setSummary(taxData);

      // Fetch recent invoices
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('issue_date', { ascending: false })
        .limit(10);

      setInvoices(invoiceData || []);
      setLoading(false);
    };

    fetchTaxData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const formatCAD = (cents: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(cents / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold">
            {summary ? formatCAD(summary.total_revenue_cents) : '$0.00'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-sm text-gray-600">GST Collected</h3>
          <p className="text-2xl font-bold">
            {summary ? formatCAD(summary.gst_collected_cents) : '$0.00'}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-sm text-gray-600">
            GST Remitted
          </h3>
          <p className="text-2xl font-bold">
            {summary ? formatCAD(summary.gst_remitted_cents) : '$0.00'}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Invoice #</th>
              <th className="text-left py-2">Customer</th>
              <th className="text-right py-2">Amount</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b">
                <td className="py-2">{inv.invoice_number}</td>
                <td className="py-2">{inv.customer_name}</td>
                <td className="text-right py-2">
                  {formatCAD(inv.total_cents)}
                </td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
```

---

## File Structure

After implementation, your project structure will look like:

```
src/
├── lib/
│   ├── stripe.js                  # Stripe utilities & helpers
│   ├── invoice-service.js         # Invoice generation & management
│   └── tax-calculator.js          # GST calculations (future)
├── components/
│   ├── payment/
│   │   ├── checkout-form.tsx      # Stripe card payment form
│   │   ├── invoice-viewer.tsx     # Display/download invoices
│   │   └── payment-status.tsx     # Order status display
│   ├── tax-dashboard.tsx          # Tax/revenue reporting
│   └── ...existing components
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── create-payment.js      # Create payment intent
│   │   │   └── list-invoices.js       # Get user invoices (optional)
│   │   ├── webhooks/
│   │   │   └── stripe.js             # Webhook handler
│   │   └── ...existing routes
│   ├── checkout/                  # New checkout page
│   ├── invoices/                  # Invoice list/view pages
│   └── ...existing pages
└── types/
    └── payment.ts                 # Payment TypeScript interfaces
```

---

## Tax Reporting

### Monthly GST Tracking

The `tax_summary` table tracks:

- Monthly revenue total
- GST collected (5%)
- GST remitted to CRA
- Filing status

### CRA GST Return Filing

**Frequency:**

- Quarterly (most common for small businesses)
- Monthly (optional if preferred)
- Annually (if low revenue)

**What to report:**

- Total GST collected (from invoices)
- Input Tax Credits (expenses with GST)
- Net GST owing

**How to file:**

1. Log into CRA NETFILE: https://www.canada.ca/netfile
2. Select: GST/HST Return (RT8)
3. Enter: Monthly/quarterly summary from tax dashboard
4. Submit electronically
5. Make payment within deadline

### Annual Income Tax

**File:** T1 General (personal) or T2 (corporation)

- Report net business income
- Claim business expenses
- Attach: Schedule 8 (Business Income)

**Keep records for:** 6 years (CRA requirement)

---

## Implementation Checklist

**Setup Phase:**

- [ ] Create Stripe Canada business account
- [ ] Register with CRA for GST number
- [ ] Get Stripe API keys (test & live)
- [ ] Configure webhook in Stripe dashboard

**Development Phase:**

- [ ] Install Stripe dependencies
- [ ] Update `.env.local` with Stripe keys
- [ ] Update `setup-database.js` with payment tables
- [ ] Create Stripe service library
- [ ] Create invoice service
- [ ] Create payment endpoint
- [ ] Create webhook handler
- [ ] Create checkout form component
- [ ] Wrap app with Stripe provider
- [ ] Create tax dashboard

**Testing Phase:**

- [ ] Test payment flow with Stripe test card
- [ ] Verify invoice generation
- [ ] Test webhook events
- [ ] Verify GST calculation (5%)
- [ ] Test refund handling

**Production Phase:**

- [ ] Switch Stripe keys to live mode
- [ ] Update `.env.production.local` with live keys
- [ ] Run full payment flow test
- [ ] Deploy to production
- [ ] Monitor for webhook errors
- [ ] Start tracking GST for CRA filing

---

## Next Steps

**Which parts would you like to implement first?**

1. Database schema & environment setup
2. Payment endpoints & webhook handlers
3. Checkout form UI component
4. Invoice generation & PDF export
5. Tax dashboard for reporting

Let me know and I can help implement any of these in detail!
