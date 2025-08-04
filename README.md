<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

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

## 👑 Admin

### Endpoints

#### `GET /api/v1/admin/users`
List all users (admin only).

#### `PATCH /api/v1/admin/users/:id/ban`
Ban/unban user (admin only).
```typescript
interface AdminLogDto {
  reason: string;
}
```

#### `GET /api/v1/admin/businesses`
List all businesses (admin only).

#### `PATCH /api/v1/admin/businesses/:id/verify`
Verify/unverify business (admin only).

#### `GET /api/v1/admin/logs`
Get admin action logs (admin only).
```typescript
interface AdminLog {
  id: string;
  admin: User;
  action_type: string;
  target_type: string;
  target_id: string;
  description: string;
  created_at: Date;
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
