-- Create random users with user role
WITH inserted_users AS (
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
  VALUES 
    (
      'john.doe@example.com',
      '$2b$10$SijqhPlZDXXK09nMGKhbMun.fzo2yX1k4sJEGxyM1JJQqLUL.FDeW', -- password: admin123
      'John Doe',
      '+905551234567',
      'https://ui-avatars.com/api/?name=John+Doe',
      'user',
      false,
      false,
      0,
      'beginner',
      0,
      0,
      0
    ),
    (
      'jane.smith@example.com',
      '$2b$10$SijqhPlZDXXK09nMGKhbMun.fzo2yX1k4sJEGxyM1JJQqLUL.FDeW', -- password: admin123
      'Jane Smith',
      '+905557654321',
      'https://ui-avatars.com/api/?name=Jane+Smith',
      'user',
      false,
      false,
      0,
      'beginner',
      0,
      0,
      0
    ),
    (
      'mike.wilson@example.com',
      '$2b$10$SijqhPlZDXXK09nMGKhbMun.fzo2yX1k4sJEGxyM1JJQqLUL.FDeW', -- password: admin123
      'Mike Wilson',
      '+905559876543',
      'https://ui-avatars.com/api/?name=Mike+Wilson',
      'user',
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
-- Create verified email verification records for each user
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
  uuid_generate_v4(),
  true,
  NOW(),
  '127.0.0.1',
  'System',
  NOW() + INTERVAL '1 year'
FROM inserted_users; 