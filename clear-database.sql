-- Clear Database Script
-- Run this in your Supabase SQL Editor to clear all uploads and orders

-- Clear all uploads
DELETE FROM public.uploads;

-- Clear all orders (if orders table exists)
-- DELETE FROM public.orders;

-- Reset any related statistics
UPDATE public.stats SET 
    total_uploads = 0,
    last_updated = NOW()
WHERE id IS NOT NULL;

-- Verify the cleanup
SELECT 'Uploads cleared' as action, COUNT(*) as remaining_count FROM public.uploads
UNION ALL
SELECT 'Stats updated' as action, COUNT(*) as records_updated FROM public.stats;

-- Show current state
SELECT 
    'uploads' as table_name, 
    COUNT(*) as count 
FROM public.uploads
UNION ALL
SELECT 
    'users' as table_name, 
    COUNT(*) as count 
FROM public.users
UNION ALL
SELECT 
    'schemes' as table_name, 
    COUNT(*) as count 
FROM public.schemes;