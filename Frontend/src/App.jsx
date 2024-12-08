import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from './UserPanel/pages/LandingPage'
import './App.css'
import Destination from './UserPanel/pages/Destination'
import CityDetail from './UserPanel/pages/CityDetail'
import Hotel from './UserPanel/pages/Hotel'
import Payment from './UserPanel/pages/Payment'
import Contact from './UserPanel/pages/Contact'
import About from './UserPanel/pages/About'
import Authentication from './UserPanel/pages/Authentication'
import Feedback from './UserPanel/pages/Feedback'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/destinations" element={<Destination />} /> {/* Destinations page route */}
        <Route path="/about" element={<About />} /> {/* About page route */}
        <Route path="/contact" element={<Contact />} /> {/* Contact page route */}
        <Route path="/city/:city/spot/:spotId" element={<CityDetail />} />
        <Route path="/accommodations/:id" element={<Hotel />} /> {/* Hotel details route */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
     
    </Router>
  );
}

export default App

