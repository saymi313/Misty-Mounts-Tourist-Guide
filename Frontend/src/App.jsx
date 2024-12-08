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
