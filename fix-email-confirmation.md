# 🔧 Fix Email Confirmation Issue

## The Problem
Supabase requires email confirmation by default. The error "Email not confirmed" means users need to click a confirmation link in their email before they can login.

## Quick Fix - Disable Email Confirmation for Development

### Step 1: Go to Supabase Authentication Settings
1. **Visit**: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/auth/settings
2. **Scroll down** to "Email Auth" section

### Step 2: Disable Email Confirmation
1. **Find**: "Enable email confirmations"
2. **Toggle OFF** the switch (it should be gray/disabled)
3. **Click**: "Save" at the bottom

### Step 3: Test Login Again
After disabling email confirmation:
1. Go back to your app at http://localhost:3000
2. Try logging in with any credentials you registered with
3. It should work now without email confirmation

## Alternative: Confirm Existing Users Manually

If you want to keep email confirmation enabled, you can manually confirm users:

### Option A: Via Supabase Dashboard
1. **Go to**: https://supabase.com/dashboard/project/jemswvemfjxykvwddozx/auth/users
2. **Find** your user in the list
3. **Click** on the user
4. **Toggle ON** "Email Confirmed"
5. **Save** changes

### Option B: Via SQL
Run this in Supabase SQL Editor:
```sql
-- Confirm all existing users
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
```

## For Production
- Keep email confirmation **enabled** for security
- Set up proper email templates and SMTP settings
- Users will receive confirmation emails automatically

## Test After Fix
Try logging in with:
- Any account you previously registered
- Or create a new account (it will work immediately without confirmation)