-- Get business IDs
WITH business_ids AS (
  SELECT id, name FROM businesses
)
-- Insert packages for each business
INSERT INTO packages (
  name,
  description,
  image_url,
  original_price,
  price,
  estimated_weight,
  quantity_available,
  pickup_start_time,
  pickup_end_time,
  business_id,
  category_id,
  allergens,
  is_active
)
SELECT
  CASE b.name
    WHEN 'The Green Kitchen' THEN 'Surprise Dinner Box'
    WHEN 'Fresh Market Express' THEN 'Fresh Produce Box'
    WHEN 'Sweet Delights Bakery' THEN 'Pastry Surprise Box'
    WHEN 'Cozy Corner Cafe' THEN 'Coffee & Cake Box'
    ELSE 'Burger Combo Box'
  END as name,
  CASE b.name
    WHEN 'The Green Kitchen' THEN 'A mix of our daily specials and fresh dishes'
    WHEN 'Fresh Market Express' THEN 'Selection of fresh fruits and vegetables'
    WHEN 'Sweet Delights Bakery' THEN 'Assortment of fresh pastries and bread'
    WHEN 'Cozy Corner Cafe' THEN 'Daily coffee and cake selection'
    ELSE 'Burger, fries, and drink combo'
  END as description,
  'https://source.unsplash.com/1600x900/?food' as image_url,
  CASE b.name
    WHEN 'The Green Kitchen' THEN 200.00
    WHEN 'Fresh Market Express' THEN 150.00
    WHEN 'Sweet Delights Bakery' THEN 120.00
    WHEN 'Cozy Corner Cafe' THEN 100.00
    ELSE 180.00
  END as original_price,
  CASE b.name
    WHEN 'The Green Kitchen' THEN 80.00
    WHEN 'Fresh Market Express' THEN 60.00
    WHEN 'Sweet Delights Bakery' THEN 48.00
    WHEN 'Cozy Corner Cafe' THEN 40.00
    ELSE 72.00
  END as price,
  CASE b.name
    WHEN 'The Green Kitchen' THEN 2.50
    WHEN 'Fresh Market Express' THEN 3.00
    WHEN 'Sweet Delights Bakery' THEN 1.50
    WHEN 'Cozy Corner Cafe' THEN 0.75
    ELSE 1.00
  END as estimated_weight,
  5 as quantity_available,
  CURRENT_DATE + '18:00:00'::time as pickup_start_time,
  CURRENT_DATE + '22:00:00'::time as pickup_end_time,
  b.id as business_id,
  (SELECT id FROM categories WHERE name = 
    CASE b.name
      WHEN 'The Green Kitchen' THEN 'Restaurant'
      WHEN 'Fresh Market Express' THEN 'Grocery'
      WHEN 'Sweet Delights Bakery' THEN 'Bakery'
      WHEN 'Cozy Corner Cafe' THEN 'Cafe'
      ELSE 'Fast Food'
    END
  ) as category_id,
  ARRAY['gluten', 'dairy'] as allergens,
  CASE b.name
    WHEN 'Burger House' THEN false
    ELSE true
  END as is_active
FROM business_ids b; 