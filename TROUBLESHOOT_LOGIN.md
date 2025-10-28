# 🔧 Login Issue Troubleshooting Guide

## Quick Diagnosis

**Run these tests in your browser console at http://localhost:3000:**

### 1. Basic Connection Test
```javascript
// Copy and paste this entire block:
(async () => {
  try {
    const { supabase } = await import('./src/supabase/client.js');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      if (error.code === '42P01') {
        console.log('🔧 FIX: Run the SQL schema in Supabase dashboard!');
      }
    } else {
      console.log('✅ Database connection working');
    }
  } catch (e) {
    console.error('❌ Import failed:', e.message);
  }
})();
```

### 2. Full Debug Test
```javascript
// Copy and paste the entire content from debug-supabase.js file
```

### 3. Login Test
```javascript
// Copy and paste the entire content from test-login.js file
```

## Common Issues & Solutions

### Issue 1: "relation 'users' does not exist"
**Cause**: Database tables not created
**Solution**: 
1. Go to https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/sql
2. Click "New query"
3. Copy entire content from `supabase_schema_policies.sql`
4. Click "Run"

### Issue 2: "new row violates row-level security policy"
**Cause**: RLS policies blocking user creation
**Solution**: The SQL schema should have created the policies. If not:
1. Check if policies exist in Supabase dashboard → Authentication → Policies
2. Re-run the SQL schema

### Issue 3: "User profile not found"
**Cause**: User exists in auth but not in users table
**Solution**: This is now handled gracefully in the updated auth context

### Issue 4: Storage upload fails
**Cause**: Storage bucket not created or not public
**Solution**:
1. Go to https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/storage/buckets
2. Create bucket named "uploads"
3. Make it public

## Step-by-Step Fix

### 1. Verify Database Setup
```sql
-- Run this in Supabase SQL Editor to check tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'uploads', 'schemes', 'contacts', 'pesticides', 'stats');
```

### 2. Check RLS Policies
```sql
-- Run this to check if policies exist:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Test User Creation Manually
```sql
-- Try creating a test user directly:
INSERT INTO users (id, email, name, role, created_at) 
VALUES ('test-id-123', 'test@example.com', 'Test User', 'farmer', NOW());
```

## Manual Database Setup (If SQL Schema Failed)

If the automated schema didn't work, run these commands one by one:

```sql
-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  email text UNIQUE,
  phone text,
  role text CHECK (role IN ('farmer', 'admin')) DEFAULT 'farmer',
  farm_location text,
  crop_type text,
  created_at timestamptz DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view self" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update self" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

## Contact Support

If none of these solutions work:
1. Share the exact error message from browser console
2. Confirm which steps you've completed
3. Check if tables exist in Supabase Table Editor
4. Verify storage bucket exists and is public

## Quick Recovery

**If you want to start fresh:**
1. Delete all tables in Supabase Table Editor
2. Delete storage buckets
3. Re-run the complete SQL schema
4. Recreate storage bucket
5. Test again