# Image Resizer Pro - Publishing Guide

## ✅ Status: READY TO PUBLISH

Your Figma plugin has been successfully built and is 100% ready for publication to the Figma Community Marketplace.

---

## Quick Summary

| Item | Value |
|------|-------|
| **Plugin Name** | Image Resizer Pro |
| **Plugin ID** | 1055271383487263589 |
| **Version** | 1.0.0 |
| **Package Size** | 3.4 KB |
| **Build Status** | ✅ Successful |
| **Ready to Publish** | ✅ Yes |

---

## Build Artifacts

```
dist/
├── main.js           (5.0 KB)  - Compiled plugin code
├── manifest.json     (208 B)   - Plugin metadata
└── ui.html           (1.9 KB)  - UI panel HTML

image_resizer_pro.zip (3.4 KB)  - Ready-to-upload archive
```

---

## Step-by-Step Publishing Instructions

### Step 1: Create Your Thumbnail Image

Create a promotional image for your plugin:
- **Size:** 1200 × 800 pixels (required)
- **Format:** PNG
- **Content:** Show the plugin in action or design mockup

**Use the AI prompt:** See `THUMBNAIL_PROMPT.md` for ready-to-use prompts for Leonardo.ai, Midjourney, or DALL-E

**Quick DIY template:**
```
+----------------------------------+
|  Image Resizer Pro               |
|                                  |
|  Free: 10 resizes                |
|  Basic: 25/day - $4.99/mo        |
|  Pro: 100/day - $9.99/mo         |
|                                  |
|  Create responsive variants      |
|  automatically                   |
+----------------------------------+
```

### Step 2: Go to Figma Community

1. Navigate to: https://www.figma.com/community/publish
2. Sign in with your Figma account
3. Click **"Publish"** → **"Plugin"**

### Step 3: Fill in Plugin Details

**Field: Name**
```
Image Resizer Pro
```

**Field: Thumbnail**
- Click upload area
- Select your 1200×800 PNG image
- Preview appears automatically

**Field: Description**
```
Free: 10 resizes (one-time).
Basic: 25 resizes/day – $4.99/month.
Pro: 100 resizes/day – $9.99/month.

Create responsive image variants at any size. Perfect for:
- Icon sets (64×64, 128×128, 256×256, etc.)
- Thumbnail images
- Multi-size assets

Free tier includes 10 one-time resizes to try.
Paid tiers unlock daily limits.

Features:
- Fit-inside scaling (preserves aspect ratio)
- Automatic centering
- Batch variant generation
- Instant image refresh in Figma
```

**Field: Tags**
```
image, resize, variants, responsive, icons, thumbnail
```

**Field: Categories** (select both)
```
✓ Design tools
✓ Productivity
```

**Field: Permissions**
```
✓ Payments     (for subscription tiers)
✓ Client Store (for usage tracking)
```

**Field: Network Access**
```
⚪ No (keep OFF)
```

**Field: Support Email** (optional)
```
your-email@example.com
```

### Step 4: Upload Plugin ZIP

1. Locate: `image_resizer_pro.zip` in your project root
2. Drag onto upload area OR click "Select a file"
3. File validates automatically:
   - ✓ manifest.json found
   - ✓ main.js found
   - ✓ ui.html found
   - ✓ Plugin ID matches

### Step 5: Choose Pricing Model

#### Option A: Free Plugin (Fastest)

- **Approval:** Usually < 24 hours
- **Revenue:** None (can upgrade later)
- **Users:** Get full access to all tiers
- **Best for:** Building initial user base

**Steps:**
1. Go to https://www.figma.com/community/publish
2. Upload `image_resizer_pro.zip`
3. Select **"Free plugin"**
4. Submit for review

#### Option B: Paid Plugin (Recommended)

- **Approval:** 1-3 days
- **Revenue:** Immediate monthly payouts
- **Users:** Tier-based access enforcement
- **Best for:** Professional appearance & monetization

**If choosing Paid:**

1. **Connect Stripe:**
   - Click "Connect Stripe Account"
   - Complete Stripe verification
   - Link your bank account

2. **Add Payment Plans:**

   **Plan 1 - Basic:**
   ```
   ID:    basic
   Name:  Basic
   Price: $4.99/month
   ```

   **Plan 2 - Pro:**
   ```
   ID:    pro
   Name:  Pro
   Price: $9.99/month
   ```

### Step 6: Review & Submit

1. Review all details on summary page
2. Verify everything is correct:
   - Name: Image Resizer Pro
   - Thumbnail: Visible preview
   - Description: Readable
   - Tags: Relevant
   - Pricing: Correct plans

3. Check legal agreement box:
   ```
   ☑ I agree to Figma's Community Resource License
   ```

4. Click **"Submit for Review"**

5. Confirmation: You'll see success message

---

## ⚠️ CRITICAL: Payment Plan ID Configuration

**Your payment plan IDs MUST match in two places:**

**In Figma Community Dashboard:**
```
Plan 1:
  ID: basic          ← MUST be exactly "basic"
  Name: Basic
  Price: $4.99/month

Plan 2:
  ID: pro            ← MUST be exactly "pro"
  Name: Pro
  Price: $9.99/month
```

**In Your Code (src/main.ts):**
```typescript
if (plan === 'basic') {
  // Allows 25 resizes per day
}

if (plan === 'pro') {
  // Allows 100 resizes per day
}
```

**If they don't match:** Payment won't work and limits won't enforce!

---

## After Submission

### Timeline

| Event | Time |
|-------|------|
| You submit plugin | Day 0 |
| Initial Figma review | Day 1-2 |
| Email approval/rejection | Day 1-3 |
| Plugin live in Community | Day 1-3 |

### If Approved ✅

1. Email confirmation arrives
2. Plugin appears in Figma Community search
3. Users can install immediately
4. Monthly payouts begin (if paid)

### If Rejected ❌

1. Email explains the reason
2. Common issues:
   - Unclear description → Use template from Step 3
   - Missing permissions explanation → Clarify why needed
   - Security concerns → Review code
3. Fix and resubmit (no penalty)

---

## Plugin Details & Features

### Permissions

```json
"permissions": [
  "payments",      // Subscription tier detection
  "clientstorage"  // Usage counter persistence
]
```

Both are necessary and safe for the freemium model.

### Capabilities

| Feature | Status |
|---------|--------|
| Free Tier (10 uses) | ✅ Enabled |
| Basic Tier (25/day) | ✅ Enabled |
| Pro Tier (100/day) | ✅ Enabled |
| Payment Integration | ✅ Enabled |
| Usage Tracking | ✅ Enabled |
| Daily Reset Logic | ✅ Enabled |

### Free Tier (Always Available)

```typescript
const FREE_ONE_TIME_LIMIT = 10;  // Never resets
```

Free users always get 10 one-time resizes, even if you publish as paid.

---

## Revenue & Pricing

### Figma's Fee Structure

| Your Price | Figma Takes | You Get |
|-----------|------------|---------|
| $4.99/mo | $0.75 (15%) | $4.24/mo per subscriber |
| $9.99/mo | $1.50 (15%) | $8.49/mo per subscriber |

Figma takes 15% flat. You receive monthly payouts via Stripe.

### Estimated Revenue Example

With average users:
- 100 free tier users → $0 (free)
- 50 basic subscribers → $212/mo
- 20 pro subscribers → $169.80/mo
- **Total:** ~$382/mo

---

## Managing Your Plugin

### Update the Plugin

When you fix bugs or add features:

1. Make changes in `src/main.ts` or `src/ui.html`
2. Run: `npm run build`
3. Re-zip: `cd dist && zip -r ../image_resizer_pro.zip *`
4. Go to Figma Community dashboard
5. Click "Edit" on your plugin
6. Upload new ZIP
7. Changes live in ~10 minutes

### Monitor Performance

1. Go to: https://www.figma.com/community
2. Click "My plugins"
3. Select "Image Resizer Pro"
4. View "Metrics" tab:
   - Monthly active users
   - Total installs
   - Revenue (if paid)

### Promote Your Plugin

Share on:
- Twitter/X (@figmadesign followers)
- Figma Community Forum: https://forum.figma.com
- Design Discord servers
- Reddit: r/figmadesign

---

## Troubleshooting

### Plugin Won't Upload

**Error: "manifest.json not found"**
- Solution: Run `npm run build` and verify `dist/` contains all 3 files

**Error: "Plugin ID mismatch"**
- Solution: Verify ID in manifest.json matches `1055271383487263589`

### Plugin Not Working After Upload

**Issue: "Permission denied"**
- Solution: Check manifest.json has `"permissions": ["payments", "clientstorage"]`

**Issue: "UI won't load"**
- Solution: Verify `dist/ui.html` exists and is ~1.9 KB
- Run: `npm run build` again

### Approval Rejected

**Common reasons:**
1. Vague description → Add specific features and benefits
2. Unclear permissions → Explain why each is needed
3. Security concerns → Remove suspicious URLs/API calls
4. Broken UI → Test locally first with `npm run watch`

---

## Pre-Publishing Checklist

### Graphic Design
- [ ] Thumbnail created (1200×800 PNG)
- [ ] Plugin name visible in thumbnail
- [ ] Shows key features or value proposition

### Text Content
- [ ] Plugin name: "Image Resizer Pro"
- [ ] Description is clear and mentions all 3 tiers
- [ ] Tags: image, resize, variants, responsive, icons, thumbnail
- [ ] Categories: Design tools, Productivity
- [ ] Permissions explanation: payments, clientstorage

### Technical
- [ ] `npm run build` succeeds without errors
- [ ] `dist/main.js` exists (~5.0 KB)
- [ ] `dist/manifest.json` exists
- [ ] `dist/ui.html` exists (~1.9 KB)
- [ ] `image_resizer_pro.zip` ready (~3.4 KB)
- [ ] Manifest ID unchanged: `1055271383487263589`
- [ ] Plugin tested in Figma (optional)

### Account Setup
- [ ] Logged into Figma with creator account
- [ ] Pricing model decided (Free or Paid)
- [ ] If Paid:
  - [ ] Stripe account created
  - [ ] Bank account linked
  - [ ] Payment plans defined (basic: $4.99, pro: $9.99)
  - [ ] Plan IDs configured (basic, pro)

---

## Development & Testing

### Test Your Plugin Locally

Before publishing, test in Figma:

1. Open Figma Desktop
2. Go to: Plugins > Development > Import plugin from manifest
3. Select: `manifest.json`
4. Test the UI and all features
5. Verify counters increment correctly

### Development Commands

```bash
npm run watch   # Auto-reload during development
npm run build   # Build for production
npm run dev     # Same as watch
```

After changes, reload in Figma with Cmd+R (macOS) or Ctrl+R (Windows/Linux).

---

## Preparing Code Updates for Figma Community Marketplace

**For any agent or developer:** Follow this checklist when updating the plugin code before publishing updates to the Figma Community Marketplace.

### Pre-Update Code Review Checklist

Before making any changes:

- [ ] Understand the current plugin structure in `src/main.ts` and `src/ui.html`
- [ ] Review `CLAUDE.md` for project architecture and payment system logic
- [ ] Identify which files need changes (plugin logic, UI, or both)
- [ ] Plan the changes to avoid breaking existing functionality

### Types of Code Updates

#### Update Type 1: Bug Fixes or Minor Features

**Changes to make:**
- Edit `src/main.ts` for logic fixes
- Edit `src/ui.html` for UI fixes
- Do NOT modify `manifest.json` (unless adding new permissions)
- Do NOT change plugin ID: `1055271383487263589`

**Example scenarios:**
- Fix incorrect resize calculation
- Improve error messages in UI
- Optimize performance
- Update styling

#### Update Type 2: New Features (Without New Permissions)

**Changes to make:**
- Add new functions to `src/main.ts`
- Update UI in `src/ui.html` to expose new features
- Add constants if needed (limits, storage keys)
- Update variable declarations and logic

**Example scenarios:**
- Add new resize option
- Add batch processing
- Add undo functionality
- Improve the payment tier selection UI

#### Update Type 3: Adding New Permissions or Tier Changes

**DO NOT make these changes without careful planning:**

- Adding new permissions requires:
  1. Updating `manifest.json` `permissions` array
  2. Notifying Figma during re-submission
  3. Clear explanation of why new permissions are needed
  4. Code documentation explaining permission usage

- Changing payment tier limits requires:
  1. Updating constants in `src/main.ts` (lines 11-13)
  2. Updating storage key logic if tier structure changes
  3. Updating plan IDs in Figma dashboard to match code

**Critical:** If you change payment plan IDs, they MUST match in three places:
- `src/main.ts` if statement conditions
- `manifest.json` (no change needed unless permissions added)
- Figma Community Dashboard payment plans

### Build Process for Marketplace Submission

**Step 1: Make Code Changes**

Edit files in `src/`:
```
src/
├── main.ts       ← Plugin logic changes
└── ui.html       ← UI changes
```

**Step 2: Verify TypeScript and Dependencies**

```bash
# Check package.json for required dependencies
cat package.json

# Ensure TypeScript compiles without errors
npm run build
```

**Step 3: Verify Build Output**

After `npm run build` completes, check:

```bash
# Verify dist/ folder has all 3 files
ls -lah dist/

# Expected output:
# dist/main.js        (should be ~5.0 KB or similar size)
# dist/manifest.json  (should be ~200 B)
# dist/ui.html        (should be ~1.9 KB or similar size)

# Verify manifest.json contents
cat dist/manifest.json

# Should contain:
# - "id": "1055271383487263589" (unchanged)
# - "name": "Image Resizer Pro"
# - "permissions": ["payments", "clientstorage"] (or additional if added)
# - "main": "dist/main.js"
# - "ui": "dist/ui.html"
```

**Step 4: Create Updated ZIP File**

```bash
# Remove old ZIP if it exists
rm image_resizer_pro.zip

# Create new ZIP from dist/ folder
cd dist && zip -r ../image_resizer_pro.zip * && cd ..

# Verify ZIP file
ls -lah image_resizer_pro.zip

# Expected: ~3.4 KB or similar (size may vary based on code)
```

**Step 5: Verify ZIP Contents**

```bash
# List contents of ZIP to ensure all files are included
unzip -l image_resizer_pro.zip

# Should show:
# main.js
# manifest.json
# ui.html
```

### Testing Changes Before Marketplace Submission

**Step 1: Test Locally in Figma**

```bash
# Start watch mode for development
npm run watch
```

Then in Figma Desktop:
1. Plugins > Development > Import plugin from manifest
2. Select `manifest.json` from your project
3. Test all modified features thoroughly
4. Check console for errors (Cmd+Option+I on macOS)
5. Reload with Cmd+R to test changes

**Step 2: Test Payment Tiers (If Modified)**

If you changed payment-related code:

```typescript
// In src/main.ts, you might see code like:
if (plan === 'basic') { ... }
if (plan === 'pro') { ... }

// Make sure these plan IDs are EXACTLY as they appear in:
// - Your Figma Community Dashboard payment plan configuration
// - The condition checks in the code
```

**Step 3: Verify All Features Work**

- [ ] Free tier users see correct remaining uses
- [ ] Daily reset works for paid tiers
- [ ] UI displays without errors
- [ ] Payment checkout flow initiates (if changed)
- [ ] Usage counters increment correctly
- [ ] No console errors or warnings

### Preparing for Marketplace Re-Submission

**Step 1: Update Version (Optional)**

In `manifest.json`, you can update the version:

```json
{
  "name": "Image Resizer Pro",
  "id": "1055271383487263589",
  "api": "1.0.0",
  "version": "1.0.1"  ← Increment this for updates
}
```

**Step 2: Document Your Changes**

Before submitting to Figma, prepare a summary of:
- What changed (bug fixes, new features, improvements)
- Why it changed (user request, performance, security)
- Any new permissions (if applicable)
- Any payment tier changes (if applicable)

**Step 3: Prepare Updated Description (If Needed)**

If you're adding features or changing functionality, update the description in Figma Community Dashboard:

Current description template (keep this structure):
```
Free: 10 resizes (one-time).
Basic: 25 resizes/day – $4.99/month.
Pro: 100 resizes/day – $9.99/month.

[Description of what plugin does]

Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]
```

**Step 4: Submit Updated ZIP to Figma**

1. Go to: https://www.figma.com/community
2. Click "My plugins"
3. Select "Image Resizer Pro"
4. Click "Edit"
5. Upload new `image_resizer_pro.zip`
6. Update description if needed
7. Submit for review (same approval process as initial)

### Critical Rules That Cannot Change

**These MUST remain the same or plugin breaks:**

1. **Plugin ID** - Locked permanently
   ```
   1055271383487263589
   ```

2. **Plugin Name** - Should stay consistent
   ```
   "Image Resizer Pro"
   ```

3. **Entry Points** - Cannot change
   ```json
   "main": "dist/main.js"
   "ui": "dist/ui.html"
   ```

4. **Permissions** - Can only be added, never removed
   ```json
   "permissions": ["payments", "clientstorage"]
   ```

5. **Payment Plan IDs** - If Figma dashboard has configured plans with IDs "basic" and "pro", code must match

### Files You Should Never Modify

- ❌ `manifest.json` `id` field
- ❌ Root `package.json` scripts (unless updating dependencies)
- ❌ `tsconfig.json` (unless you know what you're doing)
- ❌ `build.js` (custom build configuration)

### Files You Can Safely Modify

- ✅ `src/main.ts` - All plugin logic
- ✅ `src/ui.html` - All UI elements
- ✅ Constants in `src/main.ts` (FREE_ONE_TIME_LIMIT, BASIC_DAILY_LIMIT, etc.)
- ✅ `manifest.json` `version`, `permissions` (add only)

### Common Update Scenarios

#### Scenario 1: Fix a Bug in Resize Logic

```bash
# 1. Edit the bug in src/main.ts
# 2. Test locally with npm run watch
# 3. Build
npm run build

# 4. Create ZIP
cd dist && zip -r ../image_resizer_pro.zip * && cd ..

# 5. Upload to Figma Community dashboard
```

#### Scenario 2: Improve UI or Add New Button

```bash
# 1. Edit src/ui.html
# 2. Update JavaScript event handlers in src/ui.html or src/main.ts
# 3. Test locally with npm run watch
# 4. Build
npm run build

# 5. Create ZIP
cd dist && zip -r ../image_resizer_pro.zip * && cd ..

# 6. Upload to Figma Community dashboard
```

#### Scenario 3: Change Payment Limits

```typescript
// In src/main.ts:

// BEFORE:
const FREE_ONE_TIME_LIMIT = 10;
const BASIC_DAILY_LIMIT   = 25;
const PRO_DAILY_LIMIT     = 100;

// AFTER (example):
const FREE_ONE_TIME_LIMIT = 15;  // Increased free tier
const BASIC_DAILY_LIMIT   = 50;  // Increased basic tier
const PRO_DAILY_LIMIT     = 200; // Increased pro tier
```

Then:
```bash
# Build and test locally
npm run build
npm run watch  # Test in Figma

# If tests pass, create ZIP
cd dist && zip -r ../image_resizer_pro.zip * && cd ..

# Upload to Figma Community dashboard
# Update description to reflect new limits if shown
```

### Troubleshooting Build Issues

**Error: "TypeScript compilation failed"**
```bash
# Check for TypeScript errors
npm run build

# Look at the error message
# Fix the syntax error in src/main.ts or src/ui.html
# Try building again
```

**Error: "dist/ files are missing"**
```bash
# Rebuild explicitly
npm run build

# Verify all 3 files exist
ls -lah dist/
```

**Error: "ZIP file won't upload to Figma"**
```bash
# Verify ZIP contains correct files
unzip -l image_resizer_pro.zip

# Verify manifest.json is valid JSON
cat dist/manifest.json | jq .

# Recreate ZIP if needed
cd dist && zip -r ../image_resizer_pro.zip * && cd ..
```

### Summary: Agent Update Workflow

1. **Read CLAUDE.md** - Understand architecture
2. **Make code changes** in `src/main.ts` or `src/ui.html`
3. **Run `npm run build`** - Compile TypeScript
4. **Run `npm run watch`** - Test in Figma Desktop
5. **Fix any issues** found during testing
6. **Create ZIP** - `cd dist && zip -r ../image_resizer_pro.zip * && cd ..`
7. **Verify ZIP** - Check it contains main.js, manifest.json, ui.html
8. **Upload** - Go to Figma Community dashboard > Edit plugin > Upload ZIP
9. **Submit** - Click "Submit for Review"
10. **Wait** - Approval typically 1-3 days

---

## Important Notes

### Plugin ID (Locked After Publishing)

Your plugin ID is locked once published:
```
1055271383487263589
```

You cannot change this. Keep it in manifest.json.

### Permissions Explanation

Your plugin requests:
- **payments** → For free/basic/pro tier detection
- **clientstorage** → For tracking daily usage limits

These are safe and necessary. Users will see them during installation.

### File Locations

**Source Files:**
```
src/
├── main.ts       # Plugin logic
└── ui.html       # UI panel
```

**Build Output:**
```
dist/
├── main.js       # Compiled plugin
├── manifest.json # Metadata
└── ui.html       # UI copy
```

**Deployment:**
```
image_resizer_pro.zip  # Ready to upload
```

---

## Next Steps

1. **Create thumbnail** using `THUMBNAIL_PROMPT.md` (~15 minutes)
2. **Go to** https://www.figma.com/community/publish
3. **Upload** `image_resizer_pro.zip`
4. **Fill in** plugin details (use templates above)
5. **Choose pricing** (Free or Paid)
6. **Submit for review**
7. **Wait** for approval email (1-3 days)

---

## Support & Resources

### Figma Official Resources
- https://www.figma.com/developers/docs - Plugin API docs
- https://help.figma.com/hc/en-us/articles/360043051273 - Publishing guide
- https://forum.figma.com/c/plugins/16 - Plugin forum

### Your Project Documentation
- `THUMBNAIL_PROMPT.md` - AI image generation prompts
- `CLAUDE.md` - Project architecture
- `.cursor/rules/` - Development guidelines

---

## Success Indicators

You're 100% ready when:

✅ `npm run build` completes without errors
✅ `dist/` folder contains 3 files
✅ `image_resizer_pro.zip` exists (~3.4 KB)
✅ `main.js` is ~5.0 KB
✅ Manifest ID is `1055271383487263589`
✅ Permissions include `payments` and `clientstorage`
✅ Thumbnail image ready (1200×800 PNG)
✅ Description and tags prepared

---

**You're 100% ready to publish! 🚀**

**Start at:** https://www.figma.com/community/publish
