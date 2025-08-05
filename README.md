# Gurtar Backend API Documentation

## 🌍 Overview

Gurtar is a food waste reduction marketplace inspired by "Too Good To Go". The platform connects users with businesses that have surplus food, offering these items at a discounted price through surprise boxes.

## 🔑 Authentication

### Endpoints

#### `POST /api/v1/auth/register`
Register a new user.
```typescript
interface RegisterDto {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  profile_image_url: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
```

#### `POST /api/v1/auth/login`
Login with email and password.
```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

#### `GET /api/v1/auth/google`
Initiate Google OAuth login.

#### `GET /api/v1/auth/google/callback`
Handle Google OAuth callback.

#### `POST /api/v1/auth/refresh`
Refresh access token.
```typescript
interface RefreshTokenDto {
  refresh_token: string;
}
```

#### `POST /api/v1/auth/logout`
Logout user (requires authentication).

#### `GET /api/v1/auth/verify/:token`
Verify email address.

## 👤 Users

### Endpoints

#### `GET /api/v1/users/me`
Get current user profile (requires authentication).
```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  profile_image_url: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
  role: 'user' | 'business_owner' | 'worker' | 'admin';
  is_premium: boolean;
  is_banned: boolean;
  eco_score: number;
  eco_level: 'beginner' | 'saver' | 'champion' | 'eco_hero';
  total_co2_saved: number;
  total_money_saved: number;
  total_orders: number;
}
```

#### `PATCH /api/v1/users/me`
Update current user profile (requires authentication).
```typescript
interface UpdateUserDto {
  full_name?: string;
  phone_number?: string;
  profile_image_url?: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
}
```

#### `DELETE /api/v1/users/me`
Delete current user account (requires authentication).

## 👑 Admin

### Dashboard Statistics

The admin dashboard provides comprehensive statistics and real-time monitoring capabilities:

#### User Statistics
- Total, active, and inactive users
- User retention rate and growth trends
- Average login frequency (placeholder for future implementation)
- User engagement metrics
- Banned user count

#### Business Statistics
- Total, active, and inactive businesses
- Verified vs unverified businesses
- Business distribution by city
- Average response times
- Performance metrics
  - Order count by business
  - Revenue by business
  - Response time by business
- Growth trends
- CO2 and money savings tracking

#### Order Statistics
- Total orders placed
- Peak hours and days analysis
- Average order values
- Growth trends
- Seasonal patterns
- CO2 and money savings per order

#### Environmental Impact
- Total CO2 emissions saved (platform-wide)
- CO2 savings per business/user
- Money saved through eco-friendly choices
- Impact trends and projections

#### Customer Satisfaction
- Average ratings
- Response time metrics
- Satisfaction trends
- Rating distribution

### Recent Updates

#### Statistics Service Improvements (August 2025)
1. Enhanced Type Safety
   - Added proper TypeScript interfaces for all statistics DTOs
   - Improved error handling in statistics calculations
   - Added type checking for database query results

2. Performance Optimizations
   - Implemented caching for dashboard statistics
   - Optimized database queries for better performance
   - Added proper SQL query parameter handling

3. Code Organization
   - Separated statistics logic into dedicated services:
     - UserStatisticsService
     - BusinessStatisticsService
     - OrderStatisticsService
     - CategoryStatisticsService
     - ContactStatisticsService

4. Future Enhancements
   - Login tracking system planned for better user engagement metrics
   - Enhanced seasonal trend analysis
   - More detailed CO2 impact tracking

### Dashboard Endpoints

#### `GET /api/v1/admin/dashboard/stats`
Get dashboard statistics with optional date filtering.
```typescript
// Query Parameters
interface DashboardStatsQuery {
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
}

// Response includes all statistics categories
interface DashboardStatsDto {
  users: UserStats;
  businesses: BusinessStats;
  orders: OrderStats;
  environmental: EnvironmentalStats;
  satisfaction: SatisfactionStats;
}
```

#### `GET /api/v1/admin/dashboard/stats/export`
Export dashboard statistics in various formats.
```typescript
// Query Parameters
interface ExportQuery {
  startDate?: string;  // ISO date string
  endDate?: string;    // ISO date string
  format: 'csv' | 'json' | 'excel';
}
```

Available export formats:
1. CSV Format
   - Simple, tabular format
   - Easy to import into spreadsheet software
   - Includes all basic metrics

2. Excel Format
   - Multiple worksheets for different metric categories
   - Formatted cells and styling
   - Data validation
   - Easy to read and analyze

3. JSON Format
   - Complete data structure
   - Suitable for programmatic processing
   - Includes all available metrics

### User Management Endpoints

#### `GET /api/v1/admin/users`
List all users with filtering, sorting, and searching capabilities (admin only).
```typescript
interface UserFilterDto extends PaginationDto {
  // Filtering
  role?: 'user' | 'business_owner' | 'worker' | 'admin';
  is_banned?: boolean;
  
  // Searching
  search?: string; // Searches in email and full_name
  
  // Sorting
  sort?: 'createdAt' | 'email' | 'full_name' | 'role';
  order?: 'ASC' | 'DESC';
}

// Example requests:
GET /api/v1/admin/users?page=1&limit=10
GET /api/v1/admin/users?role=admin&is_banned=false
GET /api/v1/admin/users?search=john&sort=email&order=asc
```

## 🏢 Businesses

### Endpoints

#### `POST /api/v1/businesses`
Create a new business (requires business_owner role).
```typescript
interface CreateBusinessDto {
  name: string;
  description: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  category_id: string;
  logo_url: string;
  cover_image_url: string;
}
```

#### `GET /api/v1/businesses/:id`
Get business details.
```typescript
interface Business {
  id: string;
  name: string;
  description: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  category_id: string;
  logo_url: string;
  cover_image_url: string;
  is_verified: boolean;
  is_active: boolean;
  owner: User;
  created_at: Date;
  updated_at: Date;
}
```

#### `GET /api/v1/businesses`
List businesses with pagination.
```typescript
interface PaginationDto {
  page?: number; // default: 1
  limit?: number; // default: 10, max: 100
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### `PATCH /api/v1/businesses/:id`
Update business details (requires ownership or admin role).
```typescript
interface UpdateBusinessDto {
  name?: string;
  description?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  logo_url?: string;
  cover_image_url?: string;
}
```

#### `DELETE /api/v1/businesses/:id`
Delete business (requires ownership or admin role).

## 👷 Workers

### Endpoints

#### `POST /api/v1/businesses/:id/workers`
Add a worker to business (requires business ownership).
```typescript
interface CreateWorkerDto {
  user_id: string;
}
```

#### `GET /api/v1/businesses/:id/workers`
List business workers (requires business relationship).

#### `DELETE /api/v1/workers/:id`
Remove worker (requires business ownership).

## 📚 Categories

### Endpoints

#### `GET /api/v1/categories`
List all categories.
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  parent_id?: string;
}
```

#### `GET /api/v1/categories/:id/subcategories`
List subcategories of a category.

#### `POST /api/v1/categories`
Create a category (admin only).
```typescript
interface CreateCategoryDto {
  name: string;
  description: string;
  parent_id?: string;
}
```

#### `PUT /api/v1/categories/:id`
Update a category (admin only).

#### `DELETE /api/v1/categories/:id`
Delete a category (admin only).

## 📦 Packages

### Endpoints

#### `POST /api/v1/packages`
Create a new package (requires business ownership).
```typescript
interface CreatePackageDto {
  name: string;
  description: string;
  image_url: string;
  original_price: number;
  price: number;
  estimated_weight: number;
  quantity_available: number;
  pickup_start_time: string;
  pickup_end_time: string;
  category_id: string;
  subcategory_id?: string;
  allergens: string[];
}
```

#### `GET /api/v1/packages`
List available packages with pagination.
```typescript
interface Package {
  id: string;
  name: string;
  description: string;
  image_url: string;
  original_price: number;
  price: number;
  estimated_weight: number;
  quantity_available: number;
  pickup_start_time: Date;
  pickup_end_time: Date;
  allergens: string[];
  is_active: boolean;
  business: Business;
  category: Category;
  subcategory?: Category;
}
```

#### `GET /api/v1/packages/:id`
Get package details.

#### `PATCH /api/v1/packages/:id`
Update package (requires business ownership).
```typescript
interface UpdatePackageDto {
  name?: string;
  description?: string;
  image_url?: string;
  original_price?: number;
  price?: number;
  estimated_weight?: number;
  quantity_available?: number;
  pickup_start_time?: string;
  pickup_end_time?: string;
  category_id?: string;
  subcategory_id?: string;
  allergens?: string[];
  is_active?: boolean;
}
```

#### `DELETE /api/v1/packages/:id`
Delete package (requires business ownership).

## ⭐ Favorites

### Endpoints

#### `POST /api/v1/favorites`
Add business to favorites.
```typescript
interface CreateFavoriteDto {
  business_id: string;
}
```

#### `GET /api/v1/favorites`
List user's favorite businesses.

#### `DELETE /api/v1/favorites/:id`
Remove business from favorites.

## 🛒 Orders

### Endpoints

#### `POST /api/v1/orders`
Create a new order.
```typescript
interface CreateOrderDto {
  package_id: string;
  quantity: number;
}

interface Order {
  id: string;
  quantity: number;
  total_price: number;
  money_saved: number;
  co2_saved_kg: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'cancelled';
  user: User;
  package: Package;
  picked_up_by_worker?: User;
}
```

#### `GET /api/v1/orders`
List user's orders.

#### `GET /api/v1/orders/:id`
Get order details.

#### `PATCH /api/v1/orders/:id`
Update order status.
```typescript
interface UpdateOrderStatusDto {
  status: 'pending' | 'confirmed' | 'picked_up' | 'cancelled';
}
```

## 🌟 Campaigns

### Endpoints

#### `POST /api/v1/campaigns`
Create a new campaign (requires business ownership).
```typescript
interface CreateCampaignDto {
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
}
```

#### `GET /api/v1/campaigns`
List active campaigns.
```typescript
interface Campaign {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  business: Business;
}
```

#### `PATCH /api/v1/campaigns/:id`
Update campaign (requires business ownership).
```typescript
interface UpdateCampaignDto {
  title?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}
```

#### `DELETE /api/v1/campaigns/:id`
Delete campaign (requires business ownership).

## 📊 Reviews & Ratings

### Endpoints

#### `POST /api/v1/ratings`
Rate a business.
```typescript
interface CreateRatingDto {
  business_id: string;
  rating: number; // 1-5
}
```

#### `GET /api/v1/ratings/business/:id`
Get business ratings.

#### `POST /api/v1/reviews`
Review a business (requires prior rating).
```typescript
interface CreateReviewDto {
  business_id: string;
  content: string; // min length: 10
}
```

#### `GET /api/v1/reviews/business/:id`
Get business reviews.

## 🎮 Gamification

### Endpoints

#### `GET /api/v1/gamification/badges`
Get user's earned badges.
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  trigger_type: 'order_count' | 'money_saved' | 'co2_saved' | 'referrals' | 'weekly_orders' | 'monthly_streak';
  trigger_value: number;
}

interface UserBadge {
  id: string;
  user: User;
  badge: Badge;
  earned_at: Date;
}
```

#### `GET /api/v1/gamification/leaderboard/:type`
Get leaderboard by type.
```typescript
type LeaderboardType = 'weekly_co2' | 'monthly_orders' | 'total_money_saved' | 'total_co2_saved';

interface LeaderboardEntry {
  user: User;
  value: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
}
```

## 📨 Contact

### Endpoints

#### `POST /api/v1/contact`
Send a contact message.
```typescript
interface CreateContactMessageDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}
```

#### `GET /api/v1/admin/contacts`
List contact messages (admin only).

#### `PATCH /api/v1/admin/contacts/:id/resolve`
Mark contact message as resolved (admin only).
```typescript
interface UpdateContactStatusDto {
  is_resolved: boolean;
}
```

## 🔒 Authentication Headers

For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 📝 Common Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

## 🔄 Pagination
Most list endpoints support pagination:
```typescript
// Request
GET /api/v1/endpoint?page=1&limit=10

// Response
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🎯 Role-Based Access
- `user`: Basic authenticated user
- `business_owner`: Can manage business and packages
- `worker`: Can handle orders and pickups
- `admin`: Full system access

## 🏆 Gamification Levels
```typescript
enum EcoLevel {
  BEGINNER = 'beginner',    // 0-10 kg CO2
  SAVER = 'saver',          // 11-30 kg CO2
  CHAMPION = 'champion',    // 31-75 kg CO2
  ECO_HERO = 'eco_hero',   // 75+ kg CO2
}
```

## 🎖️ Badges
1. 🥇 First Saver: Place your first order
2. 🔟 10 Rescues: Complete 10 orders
3. 💸 €100 Saved: Save over €100 total
4. 🌱 Eco Hero: Save over 50kg CO2
5. 📦 Weekly Saver: Rescue 3+ meals in a single week
6. 🧑‍🤝‍🧑 Community Hero: Invite 5+ friends who order
7. 🕰️ Loyal Rescuer: Order every month for 3 months

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Redis (for caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gurtar-backend.git
cd gurtar-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run migration:run
```

5. Start the development server:
```bash
npm run start:dev
```

### API Documentation

The API documentation is available at `/api/docs` when running the server. It includes:
- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Schema definitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/gurtar-backend
