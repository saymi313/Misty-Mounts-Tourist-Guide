# MistyMounts Tourist Guide

A comprehensive tourist guide application with real-time chat functionality, user authentication, and local guide management system.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**
  - Secure login/signup system
  - Role-based access control (User, Local Guide, Admin)
  - JWT token-based authentication
  - Protected routes and components

### Real-Time Communication
- **WebSocket Chat System**
  - Real-time messaging between users and local guides
  - Active users tracking
  - Typing indicators
  - Message history and persistence
  - Broadcast messages from guides to all users
  - Direct messaging capabilities
  - Chat deletion functionality for guides

### User Panel
- **Tourist Information**
  - Browse tourist destinations
  - View detailed information about locations
  - Search and filter destinations
  - Interactive maps integration
- **Booking & Payments**
  - Hotel booking system
  - Payment processing
  - Booking management
- **Feedback System**
  - Submit feedback and reviews
  - Real-time chat with local guides
  - Rating system

### Local Guide Panel
- **Tourist Spot Management**
  - Add, edit, and delete tourist spots
  - Upload images and descriptions
  - Manage location details
- **Natural Disaster Alerts**
  - Post emergency alerts
  - Update safety information
  - Real-time notifications
- **Chat Management**
  - Respond to user queries
  - Broadcast announcements
  - Manage chat history
  - View active users

### Admin Panel
- **System Management**
  - User management
  - Content moderation
  - System analytics
  - Payment management

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd Misty-Mounts-Tourist-Guide/Backend
npm install
```

Create a `.env` file in the Backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd Misty-Mounts-Tourist-Guide/Frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### Create Test Users
```bash
cd Misty-Mounts-Tourist-Guide/Backend
node createTestUser.js
```

This creates test users:
- **Regular User:** test@example.com / password123
- **Local Guide:** guide@example.com / password123

## 🔧 Configuration

### WebSocket Configuration
The application uses Socket.io for real-time communication:
- Automatic reconnection
- Connection status tracking
- User identification and tracking
- Message routing between users and guides

### Authentication Flow
1. User logs in with email/password
2. JWT token is generated and stored
3. User is redirected based on role:
   - Regular users → User panel
   - Local guides → Guide panel
   - Admins → Admin panel

## 📱 Usage

### For Tourists
1. Visit the application
2. Log in or create an account
3. Browse tourist destinations
4. Use the chat feature to connect with local guides
5. Book accommodations and make payments
6. Submit feedback and reviews

### For Local Guides
1. Log in with guide credentials
2. Access the guide panel
3. Manage tourist spots and information
4. Respond to user queries via chat
5. Post emergency alerts and updates
6. Broadcast announcements to all users

### For Admins
1. Access the admin panel
2. Manage users and content
3. Monitor system activity
4. Handle payment processing

## 🔒 Security Features

- **Password Hashing** - bcrypt encryption
- **JWT Tokens** - Secure authentication
- **Protected Routes** - Role-based access control
- **Input Validation** - Server-side validation
- **CORS Configuration** - Cross-origin security

## 🌐 API Endpoints

### Authentication
- `POST /api/user/auth/login` - User login
- `POST /api/user/auth/signup` - User registration

### Tourist Spots
- `GET /api/admin/spots` - Get all tourist spots
- `POST /api/admin/spots` - Add new tourist spot
- `PUT /api/admin/spots/:id` - Update tourist spot
- `DELETE /api/admin/spots/:id` - Delete tourist spot

### Feedback
- `GET /api/feedback` - Get feedback
- `POST /api/feedback` - Submit feedback

### Natural Disasters
- `GET /api/natural-disaster` - Get disaster alerts
- `POST /api/natural-disaster` - Post new alert

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Issues**
   - Ensure backend server is running on port 5000
   - Check CORS configuration
   - Verify Socket.io client configuration

2. **Authentication Problems**
   - Clear browser cache and localStorage
   - Check JWT token expiration
   - Verify user credentials

3. **Database Connection**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Verify network connectivity

### Debug Mode
Enable debug logging by checking browser console for detailed error messages and connection status.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Last Updated:** December 2024
**Version:** 2.0.0
**Status:** Production Ready
