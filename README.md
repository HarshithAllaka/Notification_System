# Nykaa Notification System

A comprehensive notification management system for Nykaa, built with Spring Boot backend and React frontend.

## Features

- **User Management**: Register and manage customer profiles
- **Staff Roles**: Admin, Creator, and Viewer roles with different permissions
- **Campaign Management**: Create and launch SMS, Email, and Push notification campaigns
- **Analytics**: View campaign performance and user distribution
- **Profile Management**: Users and staff can update their profiles
- **Notification Preferences**: Customers can manage their notification preferences

## Tech Stack

### Backend
- Spring Boot 3.2.1
- Spring Security with JWT
- MySQL Database
- Maven

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios for API calls
- Recharts for analytics

## Getting Started

### Prerequisites
- Java 17
- Node.js 18+
- MySQL 8.0
- Maven 3.8+

### Backend Setup

1. Clone the repository
2. Navigate to `backend/notification_service`
3. Configure database in `src/main/resources/application.properties`
4. Run `mvn spring-boot:run`

### Frontend Setup

1. Navigate to `frontend`
2. Run `npm install`
3. Run `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User/Staff login
- `POST /api/auth/register` - User registration

### Profile
- `GET /api/profile/me` - Get current user profile
- `PUT /api/profile/me` - Update profile

### Admin
- `GET /api/admin/users/all` - Get all users
- `POST /api/admin/users/create` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/all` - Get all staff
- `POST /api/admin/create-staff` - Create staff

### Campaigns
- `POST /api/campaigns/create` - Create campaign
- `GET /api/campaigns/history` - Get campaign history
- `GET /api/campaigns/{id}/recipients` - Get campaign recipients

### User
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/notifications` - Get user notifications

## Production Deployment

1. Build the backend: `mvn clean package`
2. Build the frontend: `npm run build`
3. Deploy JAR file to server
4. Serve frontend static files via web server
5. Configure environment variables for database and JWT secrets

## Security Features

- JWT-based authentication
- Password encryption
- Role-based access control
- Input validation
- Global exception handling
- Logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request