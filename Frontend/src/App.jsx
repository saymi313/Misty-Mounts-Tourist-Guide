import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Authentication from './UserPanel/pages/Authentication';
import LandingPage from './UserPanel/pages/LandingPage';
import AdminRoutes from './AdminFrontend/routes/adminRoutes';
import PanelSelector from './PanelSelector';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRoutesWrapper from './components/ProtectedRoutesWrapper';
import LocalGuidePanel from './LocalGuidePannel/LocalGuidePanel';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Authentication route */}
          <Route path="/auth" element={<Authentication />} />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/user" replace />} />
          
          {/* Protected user routes */}
          <Route path="/user" element={
            <ProtectedRoute allowedUserTypes={['user', 'local guide']}>
              <LandingPage />
            </ProtectedRoute>
          } />
          
          {/* Local Guide Panel */}
          <Route path="/local-guide/*" element={
            <ProtectedRoute allowedUserTypes={['local guide']}>
              <LocalGuidePanel />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* Panel selector */}
          <Route path="/panel-selector" element={<PanelSelector />} />
          
          {/* All other protected routes */}
          <Route path="/*" element={<ProtectedRoutesWrapper />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
