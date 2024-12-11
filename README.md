Project Title
Misty Mounts – A Tourist Guide for Northern Pakistan

Project Description
Misty Mounts is a MERN stack-based web application designed to promote tourism in Northern Pakistan. It offers travelers a comprehensive guide to popular and hidden tourist destinations, complete with information about accommodations, dining options, historical significance, and activities. Users can plan trips, book hotels, and explore local experiences curated by guides. The platform facilitates CRUD operations, integrates free third-party APIs, and supports different user types for a seamless experience.

Features
1. User Panel
User Registration & Authentication
Secure sign-up/login, social login integration using Firebase.
Tourist Spot Discovery
Select regions, explore hidden and popular spots, view weather, history, and activities.
Integrates OpenWeatherMap, Wikipedia, and Google Places APIs.
Booking Services
Book hotels, restaurants, and transportation routes.
Integrates Leaflet.js for map services.
Review and Rating System
Submit and view reviews for spots, accommodations, and activities.
2. Admin Panel
Authentication
Role-based access via Firebase Authentication.
Management Tools
Manage tourist spots, accommodations, transport options, and payments.
Reports & Analytics
Analyze trends, revenue, and user feedback.
3. Local Guide Panel
Guide Contributions
Submit, edit, and manage hidden spots.
Real-Time Communication
Chat with users via Socket.io for personalized recommendations.
Tech Stack
Frontend
React.js with Material-UI/Tailwind CSS.
Backend
Node.js, Express.js, RESTful APIs.
Database
MongoDB hosted via Atlas.
APIs and Integrations
Firebase Authentication.
OpenWeatherMap, Wikipedia API, Google Places API.
Razorpay/Stripe for payments.
Leaflet.js & OpenStreetMap for navigation.
Development Approach
Version control via GitHub.
Independent module development for User, Admin, and Guide panels.
Consistent code commits and peer reviews.
Testing
Unit Testing
Jest: Comprehensive testing of frontend and backend functionalities.
End-to-End Testing
Selenium: Validates user flows like registration, booking, and reviews. Tests navigation, responsiveness, and integration with external APIs.
Installation
Prerequisites
Node.js and npm installed.
MongoDB Atlas account.
Firebase Authentication configured.
Steps
Clone the repository:
bash
Copy code
git clone https://github.com/username/misty-mounts.git
cd misty-mounts
Install dependencies:
bash
Copy code
npm install
cd client && npm install
Set up environment variables:
Create a .env file in the root directory and add the following:
makefile
Copy code
REACT_APP_FIREBASE_CONFIG=<your_firebase_config>
MONGO_URI=<your_mongo_uri>
STRIPE_KEY=<your_stripe_key>
Run the application:
bash
Copy code
npm run dev
Testing Commands
Jest
Run all unit tests:
bash
Copy code
npm test
Selenium
Install Selenium and WebDriver dependencies.
Execute Selenium test scripts using the following command:
bash
Copy code
node selenium_tests.js
Expected Outcomes
A user-friendly platform to promote Northern Pakistan tourism.
Enhanced accessibility for locals and tourists.
Empower local guides and encourage community-driven tourism.
Contributors
Usairam Saeed - User Panel
Syed Ali Hassan - Admin Panel
Obaidullah - Local Guide Panel
License
This project is licensed under the MIT License. See the LICENSE file for details.

