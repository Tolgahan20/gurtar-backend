-- Create orders for Mike Wilson
WITH user_id AS (
  SELECT 'd0ca1496-fd52-47c1-9100-cf98f9fd1802'::uuid as id -- Mike Wilson
),
package_info AS (
  SELECT 
    id,
    price,
    original_price,
    estimated_weight
  FROM packages
  WHERE is_active = true
)
INSERT INTO orders (
  quantity,
  total_price,
  money_saved,
  co2_saved_kg,
  status,
  user_id,
  package_id
)
SELECT
  -- Different quantities for variety
  CASE p.id
    WHEN '4746162d-bf15-48ec-9b7a-f8d8379eb3ac'::uuid THEN 2 -- Surprise Dinner Box
    WHEN 'f6c2e095-c99a-420b-9788-ff2673fde60b'::uuid THEN 1 -- Fresh Produce Box
    WHEN '5b7cc751-7211-4cc4-aa2b-bd821325dc5c'::uuid THEN 3 -- Pastry Surprise Box
    ELSE 1
  END as quantity,
  -- Calculate total price
  CASE p.id
    WHEN '4746162d-bf15-48ec-9b7a-f8d8379eb3ac'::uuid THEN p.price * 2
    WHEN 'f6c2e095-c99a-420b-9788-ff2673fde60b'::uuid THEN p.price
    WHEN '5b7cc751-7211-4cc4-aa2b-bd821325dc5c'::uuid THEN p.price * 3
    ELSE p.price
  END as total_price,
  -- Calculate money saved
  CASE p.id
    WHEN '4746162d-bf15-48ec-9b7a-f8d8379eb3ac'::uuid THEN (p.original_price - p.price) * 2
    WHEN 'f6c2e095-c99a-420b-9788-ff2673fde60b'::uuid THEN (p.original_price - p.price)
    WHEN '5b7cc751-7211-4cc4-aa2b-bd821325dc5c'::uuid THEN (p.original_price - p.price) * 3
    ELSE (p.original_price - p.price)
  END as money_saved,
  -- Calculate CO2 saved (estimated as 1kg per kg of food)
  CASE p.id
    WHEN '4746162d-bf15-48ec-9b7a-f8d8379eb3ac'::uuid THEN p.estimated_weight * 2
    WHEN 'f6c2e095-c99a-420b-9788-ff2673fde60b'::uuid THEN p.estimated_weight
    WHEN '5b7cc751-7211-4cc4-aa2b-bd821325dc5c'::uuid THEN p.estimated_weight * 3
    ELSE p.estimated_weight
  END as co2_saved_kg,
  -- Different statuses for variety
  CASE p.id
    WHEN '4746162d-bf15-48ec-9b7a-f8d8379eb3ac'::uuid THEN 'picked_up'
    WHEN 'f6c2e095-c99a-420b-9788-ff2673fde60b'::uuid THEN 'confirmed'
    WHEN '5b7cc751-7211-4cc4-aa2b-bd821325dc5c'::uuid THEN 'pending'
    ELSE 'cancelled'
  END::orders_status_enum as status,
  -- User ID (Mike Wilson)
  u.id as user_id,
  -- Package ID
  p.id as package_id
FROM package_info p
CROSS JOIN user_id u
WHERE p.id IN (
  '4746162d-bf15-48ec-9b7a-f8d8379eb3ac'::uuid, -- Surprise Dinner Box
  'f6c2e095-c99a-420b-9788-ff2673fde60b'::uuid, -- Fresh Produce Box
  '5b7cc751-7211-4cc4-aa2b-bd821325dc5c'::uuid  -- Pastry Surprise Box
); 