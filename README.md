# 💼 Portfolio Management System

A comprehensive full-stack investment portfolio management application built with React and .NET. Track your investments, monitor performance, and manage transactions with ease.

## ✨ Features

### 🔐 Authentication & User Management

- Secure user registration and login with JWT authentication
- Email-based password recovery (forgot/reset password)
- User profile management
- Role-based access control (Admin/User)
- Refresh token mechanism for enhanced security

### 📊 Investment Management

- CRUD operations for investment tracking
- Multiple investment types support (Stocks, Bonds, Mutual Funds, etc.)
- Real-time portfolio valuation
- Investment status tracking (Active, Sold, On Hold)
- Search, filter, and sort capabilities
- Export investments to CSV/JSON format

### 💱 Transaction Management

- Track all buy/sell transactions
- Link transactions to specific investments
- Transaction history with date filters
- Status management (Pending, Completed, Cancelled)
- Comprehensive filtering options

### 📈 Analytics & Reports

- **Performance Dashboard**: Real-time overview of portfolio value and gains
- **Asset Distribution**: Visual representation of asset allocation
- **Trends Analysis**: Historical performance tracking
- **Top Performers**: Best performing investments
- **Year-over-Year Comparison**: Annual performance metrics
- Report export functionality

### 🔧 Admin Features

- Comprehensive user management
- System-wide activity logging
- User activation/deactivation
- System statistics dashboard

## 🛠 Tech Stack

### Frontend

- **React 19.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Formik + Yup** - Form handling and validation
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Backend

- **.NET 9.0** - Web framework
- **ASP.NET Core Minimal APIs** - API endpoints
- **PostgreSQL** - Relational database
- **Dapper** - Micro-ORM for data access
- **JWT Bearer** - Authentication
- **BCrypt** - Password hashing
- **Swagger/OpenAPI** - API documentation

## 📁 Project Structure

```
Portfolio-Management/
├── Frontend/
│   ├── src/
│   │   ├── api/           # API client configuration
│   │   ├── components/    # Reusable components
│   │   │   ├── charts/    # Chart components
│   │   │   ├── common/    # Common UI components
│   │   │   └── layout/    # Layout components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   ├── investments/
│   │   │   ├── profile/
│   │   │   ├── reports/
│   │   │   └── transactions/
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
└── Backend/
    └── PortfolioManagement.Api/
        ├── Data/          # Database configuration
        ├── Extensions/    # Extension methods
        ├── Filters/       # Action filters
        ├── Middleware/    # Custom middleware
        ├── Migrations/    # Database migrations
        ├── Models/        # Data models
        │   ├── Entities/  # Database entities
        │   ├── Requests/  # Request DTOs
        │   └── Responses/ # Response DTOs
        ├── Repositories/  # Data access layer
        ├── Services/      # Business logic
        ├── Program.cs     # Application entry point
        └── appsettings.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **.NET 9.0 SDK**
- **PostgreSQL** 12+
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Portfolio-Management.git
   cd Portfolio-Management
   ```

2. **Setup Backend**

   ```bash
   cd Backend/PortfolioManagement.Api

   # Update connection string in appsettings.json
   # Set your PostgreSQL credentials:
   # Host=localhost
   # Port=5432
   # Database=Portfolio
   # Username=your_username
   # Password=your_password

   # Restore dependencies
   dotnet restore

   # Run the application
   dotnet run
   ```

   The API will start on `https://localhost:5001` and Swagger UI will be available at `/swagger`

3. **Setup Frontend**

   ```bash
   cd Frontend

   # Install dependencies
   npm install

   # Update API endpoint in src/api/axios.ts if needed
   # Default: http://localhost:5001/api

   # Run the development server
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Default Credentials

The system creates an admin user on first startup. Check the seed data in `Backend/PortfolioManagement.Api/Migrations/SeedData.sql` for default credentials.

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Investments

- `GET /api/investments` - List all investments (with filters)
- `GET /api/investments/{id}` - Get investment details
- `POST /api/investments` - Create investment
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Delete investment
- `GET /api/investments/{id}/export` - Export investment

### Transactions

- `GET /api/transactions` - List all transactions (with filters)
- `GET /api/transactions/{id}` - Get transaction details
- `GET /api/transactions/investment/{investmentId}` - Get transactions by investment
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Reports

- `GET /api/reports/performance` - Performance summary
- `GET /api/reports/distribution` - Asset distribution
- `GET /api/reports/trends` - Historical trends
- `GET /api/reports/top-performers` - Top performing investments
- `GET /api/reports/year-over-year` - YoY comparison
- `GET /api/reports/export` - Export reports

### Admin

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `PUT /api/admin/users/{id}/activate` - Activate/deactivate user
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/activity-logs` - Activity logs

### Health Check

- `GET /health` - API health check

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing using BCrypt
- Role-based authorization
- CORS configuration
- Input validation and sanitization
- SQL injection prevention via Dapper parameters
- Secure password reset tokens
- Activity logging for audit trails

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **Users** - User accounts and authentication
- **Investments** - Investment records
- **Transactions** - Investment transactions
- **RefreshTokens** - JWT refresh tokens
- **PasswordResetTokens** - Password reset tokens
- **ActivityLogs** - System audit logs

See `Backend/PortfolioManagement.Api/Migrations/` for complete schema.

## 🧪 Development

### Running Tests

```bash
# Backend
cd Backend
dotnet test

# Frontend
cd Frontend
npm run test
```

### Building for Production

```bash
# Backend
cd Backend/PortfolioManagement.Api
dotnet publish -c Release -o ./publish

# Frontend
cd Frontend
npm run build
```
