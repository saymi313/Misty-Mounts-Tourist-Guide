import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './UserPanel/pages/LandingPage';
import './App.css';
import RoutesFile from './UserPanel/Routes/RoutesFile'; // Import the separate routes file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Landing page route */}
        {/* Add the RoutesFile component */}
        <Route path="/*" element={<RoutesFile />} /> {/* All other routes */}
      </Routes>
    </Router>
  );
}

export default App;
