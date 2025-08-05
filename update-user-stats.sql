-- Update user statistics based on their orders
WITH user_stats AS (
  SELECT 
    user_id,
    COUNT(*) as total_orders,
    SUM(money_saved) as total_money_saved,
    SUM(co2_saved_kg) as total_co2_saved
  FROM orders
  WHERE status != 'cancelled'
  GROUP BY user_id
)
UPDATE users u
SET 
  total_orders = s.total_orders,
  total_money_saved = s.total_money_saved,
  total_co2_saved = s.total_co2_saved,
  eco_score = CASE 
    WHEN s.total_co2_saved >= 75 THEN 100
    WHEN s.total_co2_saved >= 31 THEN 75
    WHEN s.total_co2_saved >= 11 THEN 50
    WHEN s.total_co2_saved > 0 THEN 25
    ELSE 0
  END,
  eco_level = CASE 
    WHEN s.total_co2_saved >= 75 THEN 'eco_hero'
    WHEN s.total_co2_saved >= 31 THEN 'champion'
    WHEN s.total_co2_saved >= 11 THEN 'saver'
    ELSE 'beginner'
  END::users_eco_level_enum
FROM user_stats s
WHERE u.id = s.user_id; 