-- Fix RLS (Row Level Security) issues for login
-- This script disables RLS on the users table to allow authentication
-- RLS can still be enabled on other tables for data isolation

-- Option 1: Disable RLS entirely on users table (RECOMMENDED for auth)
-- This is the simplest fix and most common approach
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS user_isolation_policy ON users;
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;

-- Option 2: If you MUST keep RLS enabled, create a permissive policy for login
-- Uncomment the following lines if you want to keep RLS but allow login:
/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all users to SELECT by email for authentication
-- This is safe because password verification happens in application code
CREATE POLICY users_auth_select_policy ON users
    FOR SELECT
    USING (true);  -- Allow all SELECT queries (login needs this)

-- Restrict other operations to the user's own record
CREATE POLICY users_update_own_policy ON users
    FOR UPDATE
    USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY users_delete_own_policy ON users
    FOR DELETE
    USING (id = current_setting('app.current_user_id', true)::uuid);
*/

-- Enable RLS on other tables for proper data isolation
-- This is where RLS makes sense for multi-tenant security

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_profiles_policy ON user_profiles;
CREATE POLICY user_profiles_policy ON user_profiles
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trips_policy ON trips;
CREATE POLICY trips_policy ON trips
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bookings_policy ON bookings;
CREATE POLICY bookings_policy ON bookings
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversations_policy ON conversations;
CREATE POLICY conversations_policy ON conversations
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Knowledge graph tables
ALTER TABLE travel_companions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS travel_companions_policy ON travel_companions;
CREATE POLICY travel_companions_policy ON travel_companions
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM user_profiles
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

ALTER TABLE trip_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_memories_policy ON trip_memories;
CREATE POLICY trip_memories_policy ON trip_memories
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM user_profiles
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bucket_list_items_policy ON bucket_list_items;
CREATE POLICY bucket_list_items_policy ON bucket_list_items
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM user_profiles
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS experiences_policy ON experiences;
CREATE POLICY experiences_policy ON experiences
    FOR ALL
    USING (profile_id IN (
        SELECT id FROM user_profiles
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

-- Note: For RLS policies to work with current_setting, you need to set the user ID
-- in your application code after authentication. Add this to your auth middleware:
--
-- await prisma.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
--
-- This sets a session variable that RLS policies can use.
