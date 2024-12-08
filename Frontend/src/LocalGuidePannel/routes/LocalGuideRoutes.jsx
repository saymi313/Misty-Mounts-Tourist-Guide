// src/LocalGuidePannel/routes/LocalGuideRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import TouristSpotListPage from '../pages/TouristSpotListPage';
import AddTouristSpot from '../components/AddTouristSpot';
import EditTouristSpotPage from '../pages/EditTouristSpotPage';
import NaturalDisasterList from '../components/NaturalDisasterList';
import NaturalDisasterForm from '../components/NaturalDisasterForm';
import Feedback from '../components/FeedbackSection';
import Messages from '../pages/Messages';

const LocalGuideRoutes = () => [
  <Route key="tourist-spot-list" index element={<TouristSpotListPage />} />,
  <Route key="add-spot" path="add-spot" element={<AddTouristSpot />} />,
  <Route key="edit-spot" path="edit-spot/:id" element={<EditTouristSpotPage />} />,
  <Route key="natural-disasters" path="natural-disasters" element={<NaturalDisasterList />} />,
  <Route key="add-natural-disaster" path="add-natural-disaster" element={<NaturalDisasterForm />} />,
  <Route key="edit-natural-disaster" path="edit-natural-disaster/:id" element={<NaturalDisasterForm />} />,
  <Route key="feedback" path="feedback" element={<Feedback />} />,
  <Route key="messages" path="messages" element={<Messages />} />,
];

export default LocalGuideRoutes;
