-- Seed super admin user
INSERT INTO users (id, phone, name, email, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', '+910000000000', 'Super Admin', 'superadmin@societyerp.in', true)
ON CONFLICT (phone) DO NOTHING;

-- Fix demo society admin: update user_society_roles to match the actual user ID
-- This ensures phone 9876543210 user can see demo society data
UPDATE user_society_roles
SET user_id = (SELECT id FROM users WHERE phone = '+919876543210')
WHERE id = 'b0000000-0000-0000-0000-000000000001'
  AND EXISTS (SELECT 1 FROM users WHERE phone = '+919876543210');
