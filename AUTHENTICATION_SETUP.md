# Authentication System Implementation

## Overview
This document describes the authentication system implemented for the MistyMounts Tourist Guide application.

## Features Implemented

### 1. Protected Routing
- Only the landing page (authentication page) is accessible without login
- All other pages require authentication
- Users are redirected to login page when trying to access protected routes
- After successful login, users are redirected to their intended destination

### 2. Authentication Context
- Global authentication state management using React Context
- Automatic token persistence in localStorage
- User information (name, email, type) is stored and retrieved

### 3. Profile Dropdown
- Shows user's name in the navbar when logged in
- Clicking the profile button reveals a dropdown with:
  - User's name
  - User's email
  - Logout option
- Clean logout functionality that clears all stored data

### 4. Navigation Behavior
- **When not logged in**: Only shows "Login" button in navbar
- **When logged in**: Shows navigation links (Home, Destinations, About, Contact, Feedback) and profile dropdown

## File Structure

### Frontend Components
- `src/context/AuthContext.jsx` - Authentication context provider
- `src/components/ProtectedRoute.jsx` - Route protection component
- `src/UserPanel/components/ProfileDropdown.jsx` - Profile dropdown component
- `src/UserPanel/components/Navbar.jsx` - Updated navbar with authentication awareness
- `src/UserPanel/components/LoginSignup/Login.jsx` - Updated login component

### Backend
- `Backend/LocalGuidePannel/controllers/authController.js` - Authentication controller
- `Backend/LocalGuidePannel/models/User.js` - User model
- `Backend/server.js` - Server with authentication routes

## How It Works

### 1. Initial Load
- App checks localStorage for existing authentication tokens
- If tokens exist, user is automatically logged in
- If no tokens, user sees login page

### 2. Login Process
- User enters email and password
- Backend validates credentials
- Returns JWT token, user type, name, and email
- Frontend stores this information in localStorage and context
- User is redirected to intended page or default user dashboard

### 3. Route Protection
- All routes except `/` (login) are wrapped in `ProtectedRoute`
- `ProtectedRoute` checks authentication status
- Unauthenticated users are redirected to login with return URL
- Authenticated users can access protected routes

### 4. Logout Process
- User clicks logout in profile dropdown
- All stored authentication data is cleared
- User is redirected to login page

## User Types Supported
- **Tourist (user)**: Regular users who can browse destinations, book accommodations, etc.
- **Local Guide**: Users with additional privileges for managing tourist spots and disasters

## Security Features
- JWT tokens for secure authentication
- Password hashing using bcrypt
- Token expiration (30 days)
- Automatic token validation on protected routes

## Usage

### For Users
1. Visit the application
2. You'll be redirected to the login page
3. Either login with existing credentials or sign up
4. After login, you'll have access to all features
5. Use the profile dropdown to logout

### For Developers
1. The authentication system is already integrated
2. All routes are automatically protected
3. User state is globally available via `useAuth()` hook
4. Profile dropdown automatically shows user information

## API Endpoints
- `POST /api/user/auth/login` - User login
- `POST /api/user/auth/signup` - User registration
- `POST /api/admin/auth/login` - Admin login

## Environment Variables Required
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing 