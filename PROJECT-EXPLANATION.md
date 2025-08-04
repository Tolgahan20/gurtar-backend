**Too Good To Go - MVP Backend Specification (Complete)**

---

## ✨ Project Summary
A food waste reduction marketplace inspired by "Too Good To Go" built for North Cyprus. 
Includes four roles: **Customer**, **Business Owner**, **Worker**, and **Admin**. 
Supports surprise box listings, purchasing, reviews, campaigns, premium accounts, business subscriptions, and local bank integration for payments.

---

## 🔧 Technologies
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT + Google OAuth
- **Roles**: RBAC (Role-based access control)

---

## 📄 DATABASE TABLES

### 1. `users`
- id (PK)
- email (unique)
- password_hash (nullable if OAuth)
- google_id (nullable)
- full_name
- phone_number
- profile_image_url
- birthday (nullable)
- gender (nullable)
- role (enum: user, business_owner, worker, admin)
- is_premium (boolean)
- created_at
- updated_at

### 2. `businesses`
- id (PK)
- owner_id (FK: users.id)
- name
- description
- phone_number
- email
- address
- city
- country
- postal_code
- category_id (FK)
- logo_url
- cover_image_url
- is_verified (boolean)
- is_active (boolean)
- created_at
- updated_at

### 3. `workers`
- id (PK)
- user_id (FK: users.id)
- business_id (FK: businesses.id)
- is_active (boolean)
- created_at

### 4. `categories`
- id (PK)
- name (e.g. bakery, restaurant, dessert shop)
- description

### 5. `subcategories`
- id (PK)
- category_id (FK)
- name (e.g. vegan, kebab)

### 6. `packages`
- id (PK)
- business_id (FK)
- name
- description
- image_url
- price
- quantity_available
- pickup_start_time
- pickup_end_time
- category_id (FK)
- subcategory_id (FK, nullable)
- allergens (array)
- is_active (boolean)
- created_at
- updated_at

### 7. `favorites`
- id (PK)
- user_id (FK)
- business_id (FK)

### 8. `orders`
- id (PK)
- user_id (FK)
- package_id (FK)
- quantity
- total_price
- status (enum: pending, confirmed, picked_up, cancelled)
- payment_id (FK)
- picked_up_by_worker_id (FK, nullable)
- created_at
- updated_at

### 9. `payments`
- id (PK)
- order_id (FK)
- user_id (FK)
- provider (e.g. local_bank, credit_card)
- status (enum: success, failed, pending)
- transaction_id (nullable)
- amount
- created_at

### 10. `ratings`
- id (PK)
- user_id (FK)
- business_id (FK)
- rating (1-5)
- created_at

### 11. `reviews`
- id (PK)
- user_id (FK)
- business_id (FK)
- content
- created_at

### 12. `campaigns`
- id (PK)
- business_id (FK)
- title
- description
- discount_type (enum: percentage, fixed)
- discount_value
- start_date
- end_date
- is_active (boolean)

### 13. `admin_logs`
- id (PK)
- admin_id (FK)
- action_type (e.g. suspend_business, delete_user)
- target_type (e.g. business, user, order)
- target_id
- description
- created_at

### 14. `contact_messages`
- id (PK)
- user_id (nullable FK)
- name
- email
- subject
- message
- is_resolved (boolean)
- created_at

### 15. `password_reset_tokens`
- id (PK)
- user_id (FK)
- token
- expires_at
- created_at

---

## 🚀 API ENDPOINTS

### 🔐 Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### 👤 Users
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`

### 📆 Businesses
- `POST /businesses`
- `GET /businesses/:id`
- `GET /businesses`
- `PATCH /businesses/:id`
- `DELETE /businesses/:id`

### 💼 Workers
- `POST /businesses/:id/workers`
- `GET /businesses/:id/workers`
- `DELETE /workers/:id`

### 📚 Categories
- `GET /categories`
- `GET /categories/:id/subcategories`

### 🌟 Packages
- `POST /packages`
- `GET /packages`
- `GET /packages/:id`
- `PATCH /packages/:id`
- `DELETE /packages/:id`

### ⭐ Favorites
- `POST /favorites`
- `GET /favorites`
- `DELETE /favorites/:id`

### 🛒 Orders
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id` (for pickup or status update)

### 💳 Payments
- `POST /payments`
- `GET /payments/user`

### ✨ Ratings & Reviews
- `POST /ratings`
- `GET /ratings/business/:id`
- `POST /reviews`
- `GET /reviews/business/:id`

### 🌟 Campaigns
- `POST /campaigns`
- `GET /campaigns`
- `PATCH /campaigns/:id`
- `DELETE /campaigns/:id`

### 🪧 Admin
- `GET /admin/users`
- `PATCH /admin/users/:id/ban`
- `GET /admin/businesses`
- `PATCH /admin/businesses/:id/verify`
- `GET /admin/logs`

### 💌 Contact
- `POST /contact`
- `GET /admin/contacts`
- `PATCH /admin/contacts/:id/resolve`

---

## ℹ️ Notes
- All endpoints are **role-protected** via middleware.
- Premium logic is checked with `is_premium` on user.
- Business verification is required for package visibility.
- Orders are only allowed if `quantity_available > 0`.
- Payments are handled via local bank API integration.

---

Let me know if you want seed data or Prisma schema for this.
