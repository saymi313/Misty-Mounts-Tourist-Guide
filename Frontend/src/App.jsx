import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRoutes from "./AdminFrontend/routes/adminRoutes";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Admin-related routes */}
        <Route path="/*" element={<AdminRoutes />} />
        {/* Add other routes if needed */}
      </Routes>
    </Router>
  );
};

export default App;
