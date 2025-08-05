-- Update John Doe and Jane Smith to be business owners
UPDATE users 
SET role = 'business_owner'
WHERE email IN ('john.doe@example.com', 'jane.smith@example.com'); 