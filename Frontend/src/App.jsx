// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import LandingPage from './UserPanel/pages/LandingPage'
// import './App.css'
// import Destination from './UserPanel/pages/Destination'
// import CityDetail from './UserPanel/pages/CityDetail'
// import Hotel from './UserPanel/pages/Hotel'
// import Payment from './UserPanel/pages/Payment'
// import Contact from './UserPanel/pages/Contact'
// import About from './UserPanel/pages/About'
// import Authentication from './UserPanel/pages/Authentication'
// import Feedback from './UserPanel/pages/Feedback'
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/city/:city/spot/:spotId" element={<CityDetail />} />
//         <Route path="/accommodations/:id" element={<Hotel />} /> {/* Hotel details route */}
//         <Route path="/payment" element={<Payment />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRoutes from "./AdminFrontend/routes/adminRoutes";
import LandingPage from "./UserPanel/pages/LandingPage"
import FeedbackPage from "./UserPanel/pages/Feedback";
const App = () => {
  return (
    // <Router>
    //   <Routes>
    //     {/* Admin-related routes */}
    //     <Route path="/*" element={<AdminRoutes />} />
    //     {/* Add other routes if needed */}
    //   </Routes>
    // </Router>
    <LandingPage />
    // <FeedbackPage />
  );
};

export default App;
