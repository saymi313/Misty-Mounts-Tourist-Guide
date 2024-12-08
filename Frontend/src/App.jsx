// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './LocalGuidePannel/components/Dashboard';
import LocalGuideRoutes from './LocalGuidePannel/routes/LocalGuideRoutes'; // Import the new routes file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/local-guide" element={<Dashboard />}>
          {/* Dynamically render the routes from LocalGuideRoutes */}
          {LocalGuideRoutes().map((route) => route)}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
