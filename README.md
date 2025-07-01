# User Management API

A comprehensive user management API built with TypeScript, Express, and MongoDB featuring JWT authentication and role-based authorization.

## Features

### Authentication & Authorization
- 🔐 JWT-based authentication with access and refresh tokens
- 👤 User registration and login
- 🔑 Password hashing with bcrypt
- 🛡️ Role-based access control (Admin, Moderator, User)
- 🚪 Protected routes with middleware

### User Management
- 📝 Complete user profile management
- 👥 User CRUD operations (Admin only)
- 🔄 Profile updates with validation
- 🔒 Password change functionality
- 🗑️ Account deletion (soft delete)
- 📊 User listing with pagination and search

### Security
- 🔒 Password encryption
- 🎫 JWT token validation
- 🚦 Role-based route protection
- ✅ Input validation and sanitization
- 🛑 Error handling middleware

## API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/refresh` | Refresh access token | Public |
| GET | `/me` | Get current user | Protected |
| POST | `/logout` | Logout user | Protected |

### User Routes (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/profile` | Get user profile | Protected |
| PUT | `/profile` | Update user profile | Protected |
| PUT | `/password` | Change password | Protected |
| DELETE | `/account` | Delete account | Protected |
| GET | `/` | Get all users | Admin only |
| GET | `/:id` | Get user by ID | Admin/Moderator |
| PUT | `/:id/role` | Update user role | Admin only |
| PUT | `/:id/status` | Toggle user status | Admin only |

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd user-management-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user_management_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

5. Start MongoDB service

6. Run the application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass123",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass123"
  }'
```

### Get current user (protected route)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Software Developer",
    "phoneNumber": "+1234567890"
  }'
```

## Project Structure

```
src/
├── app.ts                 # Express app setup
├── controllers/          
│   ├── auth.controller.ts # Authentication logic
│   └── user.controller.ts # User management logic
├── middleware/           
│   ├── auth.middleware.ts # JWT verification
│   ├── error.middleware.ts # Error handling
│   └── notFound.middleware.ts # 404 handler
├── models/               
│   └── User.model.ts     # User schema
├── routes/               
│   ├── auth.routes.ts    # Auth endpoints
│   └── user.routes.ts    # User endpoints
├── types/                
│   └── express.d.ts      # TypeScript declarations
├── utils/                
│   ├── jwt.utils.ts      # JWT helpers
│   └── AppError.ts       # Custom error class
└── validators/           
    ├── auth.validators.ts # Auth validation rules
    └── user.validators.ts # User validation rules
```

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Cors** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## Security Considerations

- Always use HTTPS in production
- Keep JWT_SECRET secure and complex
- Implement rate limiting for authentication endpoints
- Use strong password requirements
- Implement email verification for new accounts
- Add two-factor authentication for sensitive operations
- Regular security audits and dependency updates

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
