-- Insert contact messages (mix of authenticated and anonymous users)
INSERT INTO contact_messages (
  name,
  email,
  subject,
  message,
  is_resolved,
  user_id
)
VALUES 
  -- Message from Mike Wilson (authenticated user)
  (
    'Mike Wilson',
    'mike.wilson@example.com',
    'Question about my eco score',
    'Hi, I noticed my eco score has increased after my recent orders. Could you explain how the scoring system works? I''d like to understand how I can improve my impact.',
    true,
    (SELECT id FROM users WHERE email = 'mike.wilson@example.com')
  ),
  -- Message from a business owner
  (
    'John Doe',
    'john.doe@example.com',
    'Business verification process',
    'Hello, I recently registered my restaurant "The Green Kitchen" and would like to know more about the verification process. What documents do I need to provide?',
    false,
    (SELECT id FROM users WHERE email = 'john.doe@example.com')
  ),
  -- Anonymous user message
  (
    'Sarah Brown',
    'sarah.brown@email.com',
    'App suggestion',
    'Hi, I love the concept of your app! Would it be possible to add a feature that shows the environmental impact of each saved meal in more detail? This would help users better understand their contribution.',
    false,
    NULL
  ),
  -- Another anonymous user message
  (
    'David Chen',
    'david.chen@email.com',
    'Technical issue with ordering',
    'I''m having trouble completing an order on your platform. When I try to pay, I get an error message. Could you please help?',
    true,
    NULL
  ),
  -- Message about partnership
  (
    'Emma Taylor',
    'emma.taylor@sustainablefood.org',
    'Potential partnership opportunity',
    'Hello, I represent SustainableFood.org and we''re interested in partnering with Gurtar. We believe our organizations share similar values in reducing food waste. Would love to discuss potential collaboration opportunities.',
    false,
    NULL
  ); 