# MySQL Database Implementation for Distilled Water System

This document outlines the MySQL database implementation for the Distilled Water Delivery System, replacing the previous JSON-based data storage.

## 📋 Table of Contents

- [Database Setup](#database-setup)
- [Schema Overview](#schema-overview)
- [API Integration](#api-integration)
- [Migration Tools](#migration-tools)
- [Environment Configuration](#environment-configuration)
- [Development Workflow](#development-workflow)
- [Database Health Monitoring](#database-health-monitoring)

## 🗄️ Database Setup

### Prerequisites

1. **XAMPP Installation**: Ensure XAMPP is installed and MySQL service is running
2. **Dependencies**: Install required npm packages:
   ```bash
   pnpm add mysql2 @types/node
   ```

### Initial Setup

1. **Configure Environment**:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database credentials:

   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_NAME=distilled_water_db
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password_here
   ```

2. **Initialize Database Schema**:

   ```bash
   npm run db:init
   ```

3. **Migrate Existing Data** (Optional):
   ```bash
   npm run db:migrate
   ```

## 📊 Schema Overview

### Core Tables

#### `users`

- **Purpose**: Store user accounts (customers, admins, transporters)
- **Key Fields**: `id`, `name`, `email`, `password`, `userType`
- **Relationships**: Linked to orders and feedback

#### `orders`

- **Purpose**: Track water delivery orders
- **Key Fields**: `id`, `userId`, `quantity`, `status`, `totalAmount`
- **Relationships**: Belongs to users, assigned to transporters

#### `containers`

- **Purpose**: Manage water container inventory and testing
- **Key Fields**: `id`, `weight`, `manufactureDate`, `approved`
- **Relationships**: Tested by users, linked to orders

#### `feedback`

- **Purpose**: Store customer feedback on orders and transporters
- **Key Fields**: `id`, `userId`, `orderId`, `rating`, `comment`
- **Relationships**: Links users to orders and transporters

### Views

- **`order_details`**: Comprehensive order view with customer and transporter info
- **`container_status_summary`**: Container approval and expiry statistics

## 🔗 API Integration

### Updated API Endpoints

All API endpoints have been updated to use MySQL instead of JSON files:

| Endpoint               | Method         | Functionality         |
| ---------------------- | -------------- | --------------------- |
| `/api/users`           | GET, POST      | User management       |
| `/api/orders`          | GET, POST, PUT | Order management      |
| `/api/containers`      | GET, PUT       | Container management  |
| `/api/feedback`        | GET, POST      | Feedback management   |
| `/api/database/health` | GET            | Database health check |

### Database Services

The following service classes provide database operations:

- **`UserService`**: User CRUD operations
- **`OrderService`**: Order management with status tracking
- **`ContainerService`**: Container testing and approval
- **`FeedbackService`**: Feedback collection and retrieval
- **`AnalyticsService`**: Dashboard statistics and reports

## 🛠️ Migration Tools

### Available Commands

```bash
# Initialize database schema
npm run db:init

# Migrate existing JSON data to database
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset -- --confirm

# Check database status
npm run db:status
```

### Migration Features

- **Automatic Schema Creation**: Creates all tables, indexes, and views
- **Data Migration**: Imports existing JSON data to MySQL tables
- **Error Handling**: Graceful handling of duplicate entries
- **Status Monitoring**: Real-time migration progress tracking

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# Database Connection
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=distilled_water_db
DATABASE_USER=root
DATABASE_PASSWORD=

# Connection Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Production Configuration

For production environments:

```env
DATABASE_HOST=your_production_host
DATABASE_PORT=3306
DATABASE_NAME=distilled_water_db
DATABASE_USER=your_production_user
DATABASE_PASSWORD=your_secure_password
```

## 🚀 Development Workflow

### Starting Development

1. **Start XAMPP**: Ensure MySQL service is running
2. **Install Dependencies**: `pnpm install`
3. **Initialize Database**: `npm run db:init`
4. **Start Development Server**: `npm run dev`

### Adding New Features

1. **Update Schema**: Modify `database/schema.sql` if needed
2. **Update Services**: Add methods to relevant service classes
3. **Update APIs**: Modify API routes to use new services
4. **Test Integration**: Use `/api/database/health` endpoint

### Database Migrations

When schema changes are needed:

1. Update `database/schema.sql`
2. Run `npm run db:reset -- --confirm`
3. Run `npm run db:migrate`
4. Verify with `npm run db:status`

## 📈 Database Health Monitoring

### Health Check Endpoint

Monitor database connectivity:

```bash
curl http://localhost:3000/api/database/health
```

**Response**:

```json
{
  "status": "healthy",
  "message": "Database connected successfully. Version: 8.0.35",
  "timestamp": "2025-12-27T17:46:56.802Z"
}
```

### Performance Monitoring

The system includes built-in performance monitoring:

- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Indexed queries for fast performance
- **Error Handling**: Comprehensive error logging
- **Transaction Support**: ACID compliance for data integrity

## 🔒 Security Features

- **Password Hashing**: Secure password storage (implement bcrypt)
- **Input Validation**: SQL injection prevention
- **Connection Encryption**: SSL/TLS support (configure for production)
- **Access Control**: User type-based permissions

## 📋 Troubleshooting

### Common Issues

1. **Connection Failed**

   - Check if MySQL service is running in XAMPP
   - Verify database credentials in `.env`
   - Ensure port 3306 is not blocked

2. **Table Not Found**

   - Run `npm run db:init` to create schema
   - Check database name matches `DATABASE_NAME`

3. **Migration Errors**
   - Ensure JSON files exist in `data/` directory
   - Check for duplicate entries
   - Use `npm run db:status` to verify state

### Debug Commands

```bash
# Check database status
npm run db:status

# View database logs
# Check XAMPP MySQL error log

# Test connection
node -e "console.log('Testing connection...')"
```

## 🎯 Benefits of MySQL Implementation

1. **Scalability**: Handle concurrent users and large datasets
2. **Data Integrity**: ACID compliance and referential integrity
3. **Performance**: Optimized queries with proper indexing
4. **Reliability**: Transaction support and error recovery
5. **Maintainability**: Structured data with relationships
6. **Analytics**: Built-in aggregation and reporting capabilities

## 🔄 Future Enhancements

- **Replication**: Master-slave replication for high availability
- **Partitioning**: Table partitioning for large datasets
- **Caching**: Redis integration for frequently accessed data
- **Monitoring**: Integration with monitoring tools (Prometheus, Grafana)
- **Backup**: Automated backup strategies

---

For questions or issues, refer to the troubleshooting section or check the application logs for detailed error messages.
