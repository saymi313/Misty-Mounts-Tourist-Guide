import { Route, Routes } from "react-router-dom";
import Destination from '../pages/Destination';
import CityDetail from '../pages/CityDetail';
import Hotel from '../pages/Hotel';
import Payment from '../pages/Payment';
import Contact from '../pages/Contact';
import About from '../pages/About';
import Authentication from '../pages/Authentication';
import Feedback from '../pages/Feedback';

const RoutesFile = () => {
  return (
    <Routes>
      <Route path="/destinations" element={<Destination />} /> {/* Destinations page route */}
      <Route path="/about" element={<About />} /> {/* About page route */}
      <Route path="/contact" element={<Contact />} /> {/* Contact page route */}
      <Route path="/city/:city/spot/:spotId" element={<CityDetail />} />
      <Route path="/accommodations/:id" element={<Hotel />} /> {/* Hotel details route */}
      <Route path="/payment" element={<Payment />} />
      <Route path="/Feedback" element={<Feedback />} />
    </Routes>
  );
};

export default RoutesFile;