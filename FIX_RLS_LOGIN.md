# Fix: Login Failing After RLS Implementation

## Problem

Row Level Security (RLS) has been enabled on the `users` table, which is blocking login queries. During authentication, the application needs to query users by email, but RLS policies are preventing this.

## Root Cause

RLS policies on the `users` table are likely filtering by `user_id`, creating a chicken-and-egg problem:
- To login, you need to query the users table
- But the RLS policy requires a current user ID
- You can't have a user ID until you successfully login

## Quick Fix

Run the following SQL command on your Neon database to disable RLS on the users table:

### Option 1: Using Neon SQL Editor (Recommended)

1. Go to your Neon Console: https://console.neon.tech
2. Select your project and database
3. Click on "SQL Editor"
4. Run this command:

```sql
-- Disable RLS on users table to allow authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on users table
DROP POLICY IF EXISTS user_isolation_policy ON users;
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;
```

### Option 2: Using psql Command Line

```bash
# Replace with your actual DATABASE_URL
psql "$DATABASE_URL" <<EOF
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_isolation_policy ON users;
DROP POLICY IF EXISTS users_select_policy ON users;
EOF
```

### Option 3: Run the Complete Fix Script

For a comprehensive fix that also properly enables RLS on other tables:

```bash
psql "$DATABASE_URL" -f scripts/fix-rls-login.sql
```

## Why This Fix Works

The `users` table should NOT have RLS enabled because:
1. **Authentication happens at application level** - The app needs to find users by email to verify passwords
2. **No multi-tenancy at user level** - Users are the top-level entities, not tenants
3. **Security is handled by password hashing** - Password verification provides the security

RLS **should** be enabled on data tables like:
- `trips` - Users should only see their own trips
- `bookings` - Users should only see their own bookings
- `user_profiles` - Users should only see their own profile
- `bucket_list_items` - Users should only see their own bucket list

## Testing the Fix

After applying the fix, test login:

1. Try logging in through the UI
2. Or run the diagnostic script:
```bash
npm run db:generate  # Generate Prisma client first
npx tsx scripts/check-rls.ts
```

## Long-term Solution

If you need RLS-like security on the users table (rare case), you can:

1. Keep RLS disabled on `users` table for authentication
2. Use application-level access control in your API routes
3. The existing auth middleware already handles this

## Verification

After running the fix, verify RLS status:

```sql
-- Check RLS status on all tables
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check existing policies
SELECT
    tablename,
    policyname
FROM pg_policies
ORDER BY tablename, policyname;
```

Expected results:
- ✅ `users` table: `rls_enabled = false`
- ✅ `trips` table: `rls_enabled = true`
- ✅ `bookings` table: `rls_enabled = true`
- ✅ `user_profiles` table: `rls_enabled = true`

## Need Help?

If login still fails after this fix, check:
1. Application logs for error messages
2. Database connection string is correct
3. User exists in database with correct email
4. No other database constraints blocking queries
