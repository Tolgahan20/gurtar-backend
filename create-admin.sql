-- Create admin user with hashed password (password: admin123)
WITH inserted_user AS (
  INSERT INTO users (
    email,
    password_hash,
    full_name,
    phone_number,
    profile_image_url,
    role,
    is_premium,
    is_banned,
    eco_score,
    eco_level,
    total_co2_saved,
    total_money_saved,
    total_orders
  )
  VALUES (
    'admin@gurtar.com',
    '$2b$10$SijqhPlZDXXK09nMGKhbMun.fzo2yX1k4sJEGxyM1JJQqLUL.FDeW', -- hashed version of 'admin123'
    'System Admin',
    '+905555555555',
    'https://ui-avatars.com/api/?name=System+Admin',
    'admin',
    false,
    false,
    0,
    'beginner',
    0,
    0,
    0
  )
  RETURNING id
)
-- Create verified email verification record
INSERT INTO email_verifications (
  user_id,
  token,
  is_verified,
  verified_at,
  verification_ip,
  verification_user_agent,
  expires_at
)
SELECT 
  id,
  '00000000-0000-0000-0000-000000000000',
  true,
  NOW(),
  '127.0.0.1',
  'System',
  NOW() + INTERVAL '1 year'
FROM inserted_user; 