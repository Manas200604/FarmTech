-- SQL Queries to Add Sample Admins and Users to FarmTech Database
-- Run these queries in your Supabase SQL Editor

-- 1. Add Sample Users (Farmers)
INSERT INTO public.users (name, email, phone, role, farm_location, crop_type) VALUES
('Rajesh Kumar', 'rajesh.farmer@gmail.com', '+91-9876543210', 'farmer', 'Punjab, India', 'wheat'),
('Priya Sharma', 'priya.agriculture@gmail.com', '+91-9876543211', 'farmer', 'Haryana, India', 'rice'),
('Amit Singh', 'amit.crops@gmail.com', '+91-9876543212', 'farmer', 'Uttar Pradesh, India', 'sugarcane'),
('Sunita Devi', 'sunita.farming@gmail.com', '+91-9876543213', 'farmer', 'Bihar, India', 'wheat'),
('Ravi Patel', 'ravi.agriculture@gmail.com', '+91-9876543214', 'farmer', 'Gujarat, India', 'cotton'),
('Meera Joshi', 'meera.farmer@gmail.com', '+91-9876543215', 'farmer', 'Maharashtra, India', 'rice'),
('Kiran Reddy', 'kiran.crops@gmail.com', '+91-9876543216', 'farmer', 'Andhra Pradesh, India', 'rice'),
('Deepak Yadav', 'deepak.farming@gmail.com', '+91-9876543217', 'farmer', 'Madhya Pradesh, India', 'wheat'),
('Anita Gupta', 'anita.agriculture@gmail.com', '+91-9876543218', 'farmer', 'Rajasthan, India', 'bajra'),
('Suresh Verma', 'suresh.farmer@gmail.com', '+91-9876543219', 'farmer', 'Chhattisgarh, India', 'rice');

-- 2. Add Sample Admin Users
INSERT INTO public.users (name, email, phone, role, farm_location, crop_type) VALUES
('Admin User', 'admin@farmtech.com', '+91-9999999999', 'admin', 'Head Office', 'all'),
('Super Admin', 'superadmin@farmtech.com', '+91-9999999998', 'admin', 'Head Office', 'all'),
('Regional Admin', 'regional.admin@farmtech.com', '+91-9999999997', 'admin', 'Regional Office', 'all');

-- 3. Add Sample Upload Records
INSERT INTO public.uploads (user_id, image_url, description, crop_type, status, admin_feedback) VALUES
((SELECT id FROM public.users WHERE email = 'rajesh.farmer@gmail.com'), 'https://example.com/wheat1.jpg', 'Wheat crop ready for harvest', 'wheat', 'pending', NULL),
((SELECT id FROM public.users WHERE email = 'priya.agriculture@gmail.com'), 'https://example.com/rice1.jpg', 'Rice paddy field with good growth', 'rice', 'approved', 'Excellent crop quality'),
((SELECT id FROM public.users WHERE email = 'amit.crops@gmail.com'), 'https://example.com/sugarcane1.jpg', 'Sugarcane plantation progress', 'sugarcane', 'pending', NULL),
((SELECT id FROM public.users WHERE email = 'sunita.farming@gmail.com'), 'https://example.com/wheat2.jpg', 'Wheat field with pest issues', 'wheat', 'rejected', 'Please treat pest infestation before resubmission'),
((SELECT id FROM public.users WHERE email = 'ravi.agriculture@gmail.com'), 'https://example.com/cotton1.jpg', 'Cotton crop flowering stage', 'cotton', 'approved', 'Good flowering, continue current care'),
((SELECT id FROM public.users WHERE email = 'meera.farmer@gmail.com'), 'https://example.com/rice2.jpg', 'Rice crop transplantation', 'rice', 'pending', NULL),
((SELECT id FROM public.users WHERE email = 'kiran.crops@gmail.com'), 'https://example.com/rice3.jpg', 'Rice field water management', 'rice', 'approved', 'Proper water level maintained'),
((SELECT id FROM public.users WHERE email = 'deepak.farming@gmail.com'), 'https://example.com/wheat3.jpg', 'Wheat crop early growth stage', 'wheat', 'pending', NULL);

-- 4. Add Sample Government Schemes
INSERT INTO public.schemes (title, description, eligibility, documents, government_link, created_by) VALUES
('PM-KISAN Scheme', 'Direct income support to farmers', 'Small and marginal farmers with cultivable land', '["Aadhaar Card", "Land Records", "Bank Account Details"]', 'https://pmkisan.gov.in', (SELECT id FROM public.users WHERE email = 'admin@farmtech.com')),
('Crop Insurance Scheme', 'Insurance coverage for crop losses', 'All farmers growing notified crops', '["Land Records", "Sowing Certificate", "Bank Account Details"]', 'https://pmfby.gov.in', (SELECT id FROM public.users WHERE email = 'admin@farmtech.com')),
('Soil Health Card Scheme', 'Soil testing and nutrient management', 'All farmers', '["Land Records", "Farmer ID"]', 'https://soilhealth.dac.gov.in', (SELECT id FROM public.users WHERE email = 'admin@farmtech.com')),
('Kisan Credit Card', 'Credit support for agriculture', 'Farmers with land ownership or tenant farmers', '["Land Records", "Identity Proof", "Address Proof"]', 'https://kcc.gov.in', (SELECT id FROM public.users WHERE email = 'admin@farmtech.com')),
('Organic Farming Scheme', 'Support for organic farming practices', 'Farmers willing to adopt organic farming', '["Land Records", "Organic Certification"]', 'https://organic.gov.in', (SELECT id FROM public.users WHERE email = 'admin@farmtech.com'));

-- 5. Add Sample Expert Contacts
INSERT INTO public.contacts (name, specialization, crop_type, contact_info, region) VALUES
('Dr. Rajesh Aggarwal', 'Plant Pathologist', 'wheat', 'rajesh.aggarwal@agri.gov.in, +91-9876501234', 'North India'),
('Dr. Priya Mehta', 'Entomologist', 'rice', 'priya.mehta@agri.gov.in, +91-9876501235', 'East India'),
('Dr. Suresh Kumar', 'Soil Scientist', 'cotton', 'suresh.kumar@agri.gov.in, +91-9876501236', 'West India'),
('Dr. Anita Sharma', 'Crop Physiologist', 'sugarcane', 'anita.sharma@agri.gov.in, +91-9876501237', 'North India'),
('Dr. Ravi Krishnan', 'Agricultural Engineer', 'rice', 'ravi.krishnan@agri.gov.in, +91-9876501238', 'South India'),
('Dr. Meera Patel', 'Horticulturist', 'vegetables', 'meera.patel@agri.gov.in, +91-9876501239', 'West India'),
('Dr. Kiran Singh', 'Agricultural Economist', 'all', 'kiran.singh@agri.gov.in, +91-9876501240', 'Central India'),
('Dr. Deepak Verma', 'Water Management Expert', 'all', 'deepak.verma@agri.gov.in, +91-9876501241', 'North India');

-- 6. Add Sample Pesticides Information
INSERT INTO public.pesticides (name, crop_type, description, recommended_usage, price_range) VALUES
('Chlorpyrifos 20% EC', 'wheat', 'Broad spectrum insecticide for controlling various pests', '2-2.5 ml per liter of water', '₹300-400 per liter'),
('Imidacloprid 17.8% SL', 'rice', 'Systemic insecticide for sucking pests', '0.5-0.7 ml per liter of water', '₹250-350 per liter'),
('Glyphosate 41% SL', 'cotton', 'Non-selective herbicide for weed control', '2-3 ml per liter of water', '₹200-300 per liter'),
('2,4-D Sodium Salt 80% WP', 'wheat', 'Selective herbicide for broad-leaf weeds', '1-1.5 g per liter of water', '₹150-250 per kg'),
('Carbendazim 50% WP', 'rice', 'Systemic fungicide for disease control', '1-2 g per liter of water', '₹400-500 per kg'),
('Acetamiprid 20% SP', 'cotton', 'Insecticide for aphids and whiteflies', '0.5-1 g per liter of water', '₹350-450 per kg'),
('Mancozeb 75% WP', 'sugarcane', 'Protective fungicide for disease prevention', '2-3 g per liter of water', '₹300-400 per kg'),
('Thiamethoxam 25% WG', 'rice', 'Insecticide for stem borer and leaf folder', '0.4-0.5 g per liter of water', '₹500-600 per kg');

-- 7. Add Sample Statistics Record
INSERT INTO public.stats (total_users, total_uploads, total_schemes, last_updated) VALUES
(13, 8, 5, NOW());

-- 8. Create some profiles entries (if using Supabase Auth)
-- Note: These would typically be created through Supabase Auth, but for testing you can add them manually
-- Make sure to replace the UUIDs with actual auth.users IDs if you're using Supabase Auth

-- INSERT INTO public.profiles (id, email, name, role) VALUES
-- ('550e8400-e29b-41d4-a716-446655440001', 'admin@farmtech.com', 'Admin User', 'admin'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'superadmin@farmtech.com', 'Super Admin', 'admin'),
-- ('550e8400-e29b-41d4-a716-446655440003', 'rajesh.farmer@gmail.com', 'Rajesh Kumar', 'user');

-- 9. Add some analytics metrics data (optional)
-- CREATE TABLE IF NOT EXISTS public.analytics_metrics (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   metric_type VARCHAR(50) NOT NULL,
--   value DECIMAL(15,2) NOT NULL,
--   date DATE NOT NULL,
--   metadata JSONB DEFAULT '{}',
--   aggregation_type VARCHAR(20) DEFAULT 'daily',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- INSERT INTO public.analytics_metrics (metric_type, value, date, aggregation_type) VALUES
-- ('user_registrations', 5, CURRENT_DATE - INTERVAL '1 day', 'daily'),
-- ('user_registrations', 3, CURRENT_DATE - INTERVAL '2 days', 'daily'),
-- ('user_registrations', 2, CURRENT_DATE - INTERVAL '3 days', 'daily'),
-- ('upload_submissions', 4, CURRENT_DATE - INTERVAL '1 day', 'daily'),
-- ('upload_submissions', 2, CURRENT_DATE - INTERVAL '2 days', 'daily'),
-- ('upload_approvals', 3, CURRENT_DATE - INTERVAL '1 day', 'daily'),
-- ('upload_approvals', 1, CURRENT_DATE - INTERVAL '2 days', 'daily');

-- Verification Queries (Run these to check if data was inserted correctly)
-- SELECT 'Users Count' as table_name, COUNT(*) as count FROM public.users
-- UNION ALL
-- SELECT 'Uploads Count', COUNT(*) FROM public.uploads
-- UNION ALL
-- SELECT 'Schemes Count', COUNT(*) FROM public.schemes
-- UNION ALL
-- SELECT 'Contacts Count', COUNT(*) FROM public.contacts
-- UNION ALL
-- SELECT 'Pesticides Count', COUNT(*) FROM public.pesticides;

-- SELECT 'Farmers' as user_type, COUNT(*) as count FROM public.users WHERE role = 'farmer'
-- UNION ALL
-- SELECT 'Admins', COUNT(*) FROM public.users WHERE role = 'admin';

-- SELECT 'Pending Uploads' as status, COUNT(*) as count FROM public.uploads WHERE status = 'pending'
-- UNION ALL
-- SELECT 'Approved Uploads', COUNT(*) FROM public.uploads WHERE status = 'approved'
-- UNION ALL
-- SELECT 'Rejected Uploads', COUNT(*) FROM public.uploads WHERE status = 'rejected';