import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './LocalGuidePannel/components/Dashboard';
import TouristSpotListPage from './localGuidePannel/pages/TouristSpotListPage';
import AddTouristSpot from './LocalGuidePannel/components/AddTouristSpot';
import EditTouristSpotPage from './LocalGuidePannel/pages/EditTouristSpotPage';
import NaturalDisasterList from './LocalGuidePannel/components/NaturalDisasterList';
import NaturalDisasterForm from './LocalGuidePannel/components/NaturalDisasterForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/local-guide" element={<Dashboard />}>
          <Route index element={<TouristSpotListPage />} />
          <Route path="add-spot" element={<AddTouristSpot />} />
          <Route path="edit-spot/:id" element={<EditTouristSpotPage />} />
          <Route path="natural-disasters" element={<NaturalDisasterList />} />
          <Route path="add-natural-disaster" element={<NaturalDisasterForm />} />
          <Route path="edit-natural-disaster/:id" element={<NaturalDisasterForm />} />
        </Route>
      </Routes> 
    </Router>
  );
}

export default App;

