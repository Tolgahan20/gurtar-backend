# Gurtar Backend

A NestJS-based backend service for the Gurtar platform, focusing on eco-friendly food ordering and sustainability metrics.

## Features

### Authentication
- JWT-based authentication
- Google OAuth integration
- Role-based access control (Admin, User)
- Token blacklisting and refresh token support

### User Management
- User registration and profile management
- Email verification
- Password reset functionality
- User activity tracking
- Eco-level progression system

### Business Management
- Business registration and verification
- Business profile management
- Business categories and locations
- Business performance metrics

### Order Management
- Order creation and tracking
- Order status updates
- CO2 savings calculation
- Money savings tracking

### Admin Dashboard
- Comprehensive statistics and metrics
- Data export functionality (CSV, Excel, JSON)
- Real-time monitoring capabilities

#### Dashboard Statistics
1. User Statistics
   - Total, active, and inactive users
   - User retention rate
   - Average login frequency
   - User growth trends
   - User engagement metrics

2. Business Statistics
   - Total, active, and verified businesses
   - Business distribution by city
   - Average response times
   - Performance metrics
   - Growth trends

3. Order Statistics
   - Total orders
   - Peak hours and days
   - Average order values
   - Growth trends
   - Seasonal patterns

4. Environmental Impact
   - Total CO2 emissions saved
   - CO2 savings per business/user
   - Money saved through eco-friendly choices
   - Impact trends and projections

5. Customer Satisfaction
   - Average ratings
   - Response time metrics
   - Satisfaction trends
   - Rating distribution

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

## Admin Dashboard API

### Statistics Endpoints

1. Get Dashboard Statistics
```bash
GET /api/v1/admin/dashboard/stats
```
Query Parameters:
- `startDate`: Start date for filtering (ISO string)
- `endDate`: End date for filtering (ISO string)

2. Export Dashboard Data
```bash
GET /api/v1/admin/dashboard/stats/export
```
Query Parameters:
- `startDate`: Start date for filtering (ISO string)
- `endDate`: End date for filtering (ISO string)
- `format`: Export format ('csv', 'json', or 'excel')

### Data Export Formats

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
