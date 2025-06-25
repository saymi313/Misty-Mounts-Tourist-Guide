# Misty Mounts – A Tourist Guide for Northern Pakistan

<div align="center">
  <img src="Frontend/public/Logo.png" alt="Misty Mounts Logo" width="200"/>
  <h3>Discover the Hidden Gems of Northern Pakistan</h3>
</div>

## 📋 Project Overview

Misty Mounts is a comprehensive MERN stack-based web application designed to promote tourism in Northern Pakistan by providing travelers with detailed information about popular and hidden tourist spots. The platform offers users comprehensive guides to nearby locations, accommodations, food points, historical context, and exciting activities. Users can plan their trips by booking hotels, transportation, and exploring local experiences curated by guides.

The application supports CRUD operations, integrates free third-party APIs, and is designed to function seamlessly across all user types. Its ultimate goal is to boost tourism while preserving and showcasing the cultural and natural beauty of Northern Pakistan.

## 🚀 Features

### 1. User Panel
The main interface for visitors planning their trips to Northern Pakistan.

#### 🔐 User Registration & Authentication
- Secure user sign-up and login with social login options
- **Integration**: Firebase Authentication (free tier)

#### 🗺️ Tourist Spot Discovery
- Select a region to explore nearby spots, including hidden gems curated by local guides
- View detailed information about each spot, including weather, history, and activities
- **APIs Used**:
  - **OpenWeatherMap**: For weather data at selected locations
  - **Wikipedia API**: To fetch historical and contextual information
  - **Google Places API** (free tier): For basic tourist spot details

#### 🏨 Hotel and Food Spot Booking
- Discover nearby hotels and restaurants for accommodation and dining
- Make direct bookings for accommodations or food spots

#### 🚌 Transportation Assistance
- View available routes, including local transport and bus services, to reach the selected spot
- Book tickets for transport options

#### 🗺️ Interactive Map and Navigation
- View spot locations, nearby facilities, and travel routes
- **Integration**: Leaflet.js and OpenStreetMap for free map services

#### ⭐ Review and Rating System
- Submit reviews and ratings for visited spots, accommodations, and activities
- Help other users by sharing experiences

### 2. Admin Panel
Ensures the smooth operation and management of the platform.

#### 🔐 Admin Authentication
- Secure admin login system with role-based access control
- **Integration**: Firebase Authentication

#### 🏞️ Tourist Spot Management
- Add, update, and remove tourist spots from the database
- Approve or reject submissions of hidden spots by guides

#### 🏨 Accommodation Management
- Manage hotel and food spot details, availability, and bookings
- Update pricing and special offers

#### 🚌 Transport Management
- Add, update, and manage transportation options

#### 💳 Payment Management
- Monitor and process payments made by users for bookings
- **Integration**: Razorpay or Stripe (free tier)

#### 📊 Reports and Analytics
- View and generate reports on user activity, popular spots, and revenue
- Analyze booking trends and user feedback

### 3. Local Guide Panel
Empowers local guides to contribute to the platform and connect with travelers.

#### 🔐 Guide Registration and Login
- Secure sign-up and login for guides to manage their profiles
- **Integration**: Firebase Authentication

#### 🗺️ Hidden Spot Management
- Submit new spots with descriptions, images, and local insights
- Edit or remove existing submissions

#### 💬 Feedback and Reviews
- Receive and respond to user reviews on submitted spots

#### 💬 Communication with Travelers
- Real-time chat with users for trip guidance and recommendations
- **Integration**: Socket.io for messaging

## 🗄️ Database Design

**Database**: MongoDB (cloud-hosted via MongoDB Atlas free tier)

### Collections:
1. **users**: Stores user details, preferences, and booking history
2. **tourist_spots**: Stores spot details, including curated hidden spots
3. **hotels**: Contains information on hotels, availability, and pricing
4. **food_points**: Stores dining options near tourist attractions
5. **transport_options**: Stores transport routes and availability
6. **guides**: Stores local guide details, submissions, and reviews
7. **reviews**: Stores reviews and ratings from users

## 🔌 APIs and Integrations

1. **Firebase Authentication**: User, admin, and guide authentication
2. **OpenWeatherMap**: Provides weather information for tourist spots
3. **Wikipedia API**: Fetches historical and cultural information for spots
4. **Google Places API** (Free Tier): Retrieves details about popular landmarks and local attractions
5. **Leaflet.js & OpenStreetMap**: Embeds maps for navigation and travel routes
6. **Razorpay/Stripe** (Free Tier): Handles secure payments for bookings
7. **Socket.io**: Enables real-time communication between users and guides

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library for building interactive user interfaces
- **Vite 6.0.1** - Fast build tool and development server
- **Tailwind CSS 3.4.16** - Utility-first CSS framework for styling
- **Material-UI 6.1.10** - React component library for consistent design
- **React Router DOM 7.0.2** - Client-side routing
- **Axios 1.7.9** - HTTP client for API requests
- **Leaflet 1.7.1** - Interactive maps
- **Socket.io Client 4.8.1** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express 4.21.2** - Web application framework
- **MongoDB 8.8.4** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT 9.0.2** - JSON Web Tokens for authentication
- **Bcrypt 5.1.1** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing
- **Socket.io 4.8.1** - Real-time bidirectional communication

## 📁 Project Structure

```
Misty-Mounts-Tourist-Guide/
├── Backend/
│   ├── AdminBackend/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── LocalGuidePannel/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── UserBackend/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── config/
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── AdminFrontend/
│   │   ├── LocalGuidePannel/
│   │   ├── UserPanel/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project
- API keys for integrated services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Misty-Mounts-Tourist-Guide
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` files in the Backend directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_API_KEY=your_firebase_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

5. **Start the Development Servers**

   **Backend:**
   ```bash
   cd Backend
   npm start
   ```

   **Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🏗️ Development Approach

1. **Frontend**:
   - Developed using React for a responsive and interactive user experience
   - Styled with Material-UI and Tailwind CSS for a professional, consistent look

2. **Backend**:
   - Built using Node.js and Express to handle server-side logic
   - RESTful APIs for seamless communication between the frontend and backend

3. **Database**:
   - MongoDB for efficient, scalable data storage

4. **Version Control**:
   - Each developer maintains their code repository on GitHub
   - Code commits pushed consistently for proper version tracking

## 🎯 Expected Outcomes

1. **User-Friendly Interface**: An engaging website to plan trips easily and discover hidden spots
2. **Enhanced Tourism Promotion**: Highlight hidden gems and local experiences in Northern Pakistan
3. **Community Involvement**: Empower local guides to share insights and generate income
4. **Scalable System**: A robust and expandable platform for future features and more destinations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Contact

For any queries or support, please reach out to the development team.

---

<div align="center">
  <p><strong>Discover the beauty of Northern Pakistan with Misty Mounts! 🏔️</strong></p>
</div>
