-- Update the test account to have admin access
UPDATE profiles 
SET is_admin = true 
WHERE email = 'test@testing.com';

-- Check if the update worked
SELECT id, email, is_admin FROM profiles WHERE email = 'test@testing.com';

-- Show all admin users
SELECT id, email, display_name, is_admin FROM profiles WHERE is_admin = true;