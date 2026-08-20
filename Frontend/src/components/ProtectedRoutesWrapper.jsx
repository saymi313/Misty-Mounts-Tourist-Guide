import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoutesFile from '../UserPanel/Routes/RoutesFile';
import AiConcierge from './AiConcierge';

const ProtectedRoutesWrapper = () => {
  return (
    <Routes>
      <Route path="/*" element={
        <ProtectedRoute allowedUserTypes={['user', 'local guide']}>
          <RoutesFile />
          <AiConcierge />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default ProtectedRoutesWrapper; 