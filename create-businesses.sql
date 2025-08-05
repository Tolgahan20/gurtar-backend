-- Insert sample businesses
INSERT INTO businesses (
  "ownerId",
  name,
  description,
  phone_number,
  email,
  address,
  city,
  country,
  postal_code,
  "categoryId",
  logo_url,
  cover_image_url,
  is_verified,
  is_active
)
VALUES 
  (
    '534dca5f-8dae-47b6-882f-c7feb6620441', -- John Doe
    'The Green Kitchen',
    'Sustainable restaurant offering farm-to-table dishes',
    '+905551234567',
    'contact@greenkitchen.com',
    'Istiklal Caddesi No: 123',
    'Istanbul',
    'Turkey',
    '34000',
    '5c03827c-4b4a-4f4a-9a63-32d7ca3cc277', -- Restaurant category
    'https://ui-avatars.com/api/?name=Green+Kitchen',
    'https://source.unsplash.com/1600x900/?restaurant',
    true,
    true
  ),
  (
    '534dca5f-8dae-47b6-882f-c7feb6620441', -- John Doe
    'Fresh Market Express',
    'Local grocery store with fresh produce',
    '+905551234568',
    'info@freshmarket.com',
    'Bagdat Caddesi No: 456',
    'Istanbul',
    'Turkey',
    '34100',
    '3f43c98c-ec10-4d70-a28f-9905b4091926', -- Grocery category
    'https://ui-avatars.com/api/?name=Fresh+Market',
    'https://source.unsplash.com/1600x900/?grocery',
    true,
    true
  ),
  (
    'd76e9cf4-44c7-4e47-95c0-2d484ce58c1d', -- Jane Smith
    'Sweet Delights Bakery',
    'Artisanal bakery specializing in sourdough bread and pastries',
    '+905551234569',
    'hello@sweetdelights.com',
    'Moda Caddesi No: 789',
    'Istanbul',
    'Turkey',
    '34200',
    '57e6c011-0b16-4edb-a7df-3c91b2eb2481', -- Bakery category
    'https://ui-avatars.com/api/?name=Sweet+Delights',
    'https://source.unsplash.com/1600x900/?bakery',
    true,
    true
  ),
  (
    'd76e9cf4-44c7-4e47-95c0-2d484ce58c1d', -- Jane Smith
    'Cozy Corner Cafe',
    'Charming cafe serving specialty coffee and homemade cakes',
    '+905551234570',
    'info@cozycorner.com',
    'Kadiköy Meydan No: 101',
    'Istanbul',
    'Turkey',
    '34300',
    '92e6308d-5ead-4814-9316-c86f7890f45b', -- Cafe category
    'https://ui-avatars.com/api/?name=Cozy+Corner',
    'https://source.unsplash.com/1600x900/?cafe',
    false,
    true
  ),
  (
    '534dca5f-8dae-47b6-882f-c7feb6620441', -- John Doe
    'Burger House',
    'Gourmet burger restaurant with vegetarian options',
    '+905551234571',
    'eat@burgerhouse.com',
    'Nisantasi No: 202',
    'Istanbul',
    'Turkey',
    '34400',
    '571edb4b-c761-4158-976e-04016d8081ba', -- Fast Food category
    'https://ui-avatars.com/api/?name=Burger+House',
    'https://source.unsplash.com/1600x900/?burger',
    false,
    false
  ); 