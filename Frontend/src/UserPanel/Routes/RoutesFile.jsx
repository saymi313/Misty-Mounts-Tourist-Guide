import { Route, Routes } from "react-router-dom";
import Destination from '../pages/Destination';
import CityDetail from '../pages/CityDetail';
import Hotel from '../pages/Hotel';
import Payment from '../pages/Payment';
import Contact from '../pages/Contact';
import About from '../pages/About';
import Feedback from '../pages/Feedback';

const RoutesFile = () => {
  return (
    <Routes>
      <Route path="/destinations" element={<Destination />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/city/:city/spot/:spotId" element={<CityDetail />} />
      <Route path="/accommodations/:id" element={<Hotel />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/feedback" element={<Feedback />} />
    </Routes>
  );
};

export default RoutesFile;