

# IT Hub Simplification & Bug Fixes Plan

## Summary of Issues Found

I've discovered **9 critical bugs and issues** that need to be addressed to simplify and stabilize your IT Hub for single-company internal use.

---

## Critical Bugs Found

### Bug 1: Missing user_roles Entries (CRITICAL - Causes Access Denied)

**Impact**: 15 out of 16 users have NO entry in the `user_roles` table

| Current State | Expected |
|---------------|----------|
| 1 user with role | 16 users with roles |
| Only `deepak.dongare@realthingks.com` has admin role | All users should have appropriate roles |

**Root Cause**: The `handle_new_auth_user` trigger inserts into `user_roles`, but existing users were created before this trigger existed.

**Result**: When `get_user_role()` is called, it returns `NULL`, causing `check_page_access()` to deny access.

---

### Bug 2: Invalid Role Values in users Table

**Impact**: 6 users have `role = 'employee'` which doesn't exist in the `app_role` enum

| Email | Current Role | Valid Roles |
|-------|--------------|-------------|
| it@realthingks.com | employee | admin, manager, user, viewer |
| ai@realthingks.com | employee | admin, manager, user, viewer |
| p@gmail.com | employee | admin, manager, user, viewer |
| user1@realthingks.com | employee | admin, manager, user, viewer |
| deepak.dongare@rt.com | employee | admin, manager, user, viewer |
| orgemp1@gmail.com | employee | admin, manager, user, viewer |

**Root Cause**: Legacy role naming before the `app_role` enum was standardized.

---

### Bug 3: Orphaned User Records (10 users)

**Impact**: 10 out of 16 users in the `users` table have `auth_user_id` values that don't exist in `auth.users`

This means these are "ghost" users that can never log in. They should be cleaned up.

---

### Bug 4: Page Access Control Only Configured for 1 Organisation

**Impact**: The `page_access_control` table only has entries for organisation `fc8be2fb-4571-4496-8eaa-23cde8554e4e`

Users in other organisations (like "RealThingks India", "RT India", etc.) have no page access rules defined.

---

### Bug 5: 18 Test Organisations in Database

**Impact**: Multi-tenant test data clutters the database and causes confusion

| Organisation Name | Users Assigned |
|-------------------|----------------|
| deepak.dongare@realthingks.com | 2 (main active org) |
| RealThingks India | 3 |
| RT India | 2 |
| Org1 | 2 |
| machinecraft | 2 |
| + 13 more test orgs | various |

---

### Bug 6: Duplicate User Data Fetching (Performance)

Multiple hooks fetch the same user data independently:

```text
OrganisationContext.tsx    → fetches user.organisation_id
useCurrentUser.tsx         → fetches user + org + tenant
useCurrentUserData.tsx     → fetches same data (redundant)
useUserOrganisation.tsx    → fetches user.organisation_id
SidebarUserSection.tsx     → fetches user profile
useUserRole.tsx            → fetches user role
```

This causes 4-6 redundant database queries on every page load.

---

### Bug 7: Main Organisation Has Wrong Name

The primary organisation being used has:
- **Name**: `deepak.dongare@realthingks.com` (should be "RT-IT-Hub" or similar)
- **Plan**: `free` (may need updating)
- **Active Tools**: Only `['crm']` (should include all modules)

---

### Bug 8: Profiles Table Has Null full_name

Most entries in the `profiles` table have `full_name = NULL`, meaning the profile display shows fallback values.

---

### Bug 9: Role Hierarchy Confusion

The `users.role` column (text) conflicts with `user_roles.role` (app_role enum):
- `users.role` allows any text including invalid values like "employee"
- `user_roles.role` uses the proper `app_role` enum (admin, manager, user, viewer)
- `check_page_access()` only reads from `user_roles` table

---

## Implementation Plan

### Phase 1: Database Cleanup (SQL Migrations)

**Step 1.1**: Populate missing `user_roles` entries

```sql
-- Map users.role to app_role enum and insert into user_roles
INSERT INTO user_roles (user_id, role)
SELECT u.auth_user_id, 
  CASE 
    WHEN u.role = 'admin' THEN 'admin'::app_role
    WHEN u.role IN ('employee', 'user') THEN 'user'::app_role
    WHEN u.role = 'manager' THEN 'manager'::app_role
    WHEN u.role = 'viewer' THEN 'viewer'::app_role
    ELSE 'user'::app_role
  END
FROM users u
WHERE u.auth_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.auth_user_id);
```

**Step 1.2**: Update main organisation details

```sql
-- Rename main org and set correct tools
UPDATE organisations 
SET name = 'RT-IT-Hub',
    active_tools = ARRAY['helpdesk', 'assets', 'subscriptions', 'updates', 'monitoring', 'reports', 'audit'],
    plan = 'enterprise'
WHERE id = 'fc8be2fb-4571-4496-8eaa-23cde8554e4e';
```

**Step 1.3**: Migrate all users to single organisation

```sql
-- Move all valid users to main org
UPDATE users 
SET organisation_id = 'fc8be2fb-4571-4496-8eaa-23cde8554e4e'
WHERE auth_user_id IS NOT NULL;
```

**Step 1.4**: Clean up orphaned users (those without valid auth.users entry)

```sql
-- Delete orphaned user records
DELETE FROM users 
WHERE auth_user_id NOT IN (SELECT id FROM auth.users);
```

**Step 1.5**: Delete test organisations (optional, can be done later)

```sql
-- Keep only the main org
DELETE FROM organisations 
WHERE id != 'fc8be2fb-4571-4496-8eaa-23cde8554e4e';
```

---

### Phase 2: Code Simplification

**Step 2.1**: Consolidate user data hooks

Create a single `useCurrentUser` hook that fetches all user data in one query and is used everywhere.

| Hook to Remove/Deprecate | Replaced By |
|--------------------------|-------------|
| useCurrentUserData.tsx | useCurrentUser |
| useUserOrganisation.tsx | useCurrentUser |
| SidebarUserSection user query | useCurrentUser |

**Step 2.2**: Simplify OrganisationContext

Replace the complex organisation fetching with a hardcoded single-company configuration:

```typescript
const organisation = {
  id: 'fc8be2fb-4571-4496-8eaa-23cde8554e4e',
  name: 'RT-IT-Hub',
  active_tools: ['helpdesk', 'assets', 'subscriptions', 'updates', 'monitoring'],
  plan: 'enterprise',
};
```

**Step 2.3**: Update components using useOrganisation

Affected components (27 files identified):
- All Subscription components (AddToolDialog, AddVendorDialog, etc.)
- Asset audit and purchase order pages
- Settings components
- Dashboard header

Change pattern:
```typescript
// Before
const { organisation } = useOrganisation();
if (!organisation?.id) return [];

// After
const { organisationId } = useCurrentUser();
// or just use hardcoded org ID for single-company
```

---

### Phase 3: Fix Role Checking

**Step 3.1**: Ensure consistent role usage

Update the `users.role` column to only accept valid app_role values:

```sql
-- Fix invalid role values
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin', 'manager', 'user', 'viewer');
```

**Step 3.2**: Add constraint to prevent future issues

```sql
-- Add check constraint
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'user', 'viewer'));
```

---

## Summary of Changes

| Category | Items to Change |
|----------|-----------------|
| Database migrations | 5 SQL updates |
| Hooks to consolidate | 3 hooks |
| Components to update | ~27 files |
| Test data to clean | 17 organisations, ~10 orphaned users |

## Estimated Effort

- **Phase 1 (Database)**: 30 minutes
- **Phase 2 (Code)**: 2-3 hours
- **Phase 3 (Roles)**: 30 minutes

**Total**: 3-4 hours for complete simplification

---

## Technical Notes

### Files to Modify

1. **src/contexts/OrganisationContext.tsx** - Simplify to hardcoded values
2. **src/hooks/useCurrentUser.tsx** - Make this the single source of truth
3. **src/hooks/useCurrentUserData.tsx** - Mark as deprecated, forward to useCurrentUser
4. **src/hooks/useUserOrganisation.tsx** - Mark as deprecated
5. **27+ components** - Update to use useCurrentUser instead of useOrganisation

### Database Changes

1. Insert missing user_roles entries
2. Update main organisation details
3. Migrate users to single org
4. Clean orphaned records
5. Add role constraint

