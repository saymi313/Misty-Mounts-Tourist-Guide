import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Authentication from './UserPanel/pages/Authentication';
import LandingPage from './UserPanel/pages/LandingPage';
import AdminRoutes from './AdminFrontend/routes/adminRoutes';
import PanelSelector from './PanelSelector';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRoutesWrapper from './components/ProtectedRoutesWrapper';
import LocalGuidePanel from './LocalGuidePannel/LocalGuidePanel';
import Toaster from './components/Toaster';
import ConfirmDialog from './components/ConfirmDialog';
import './App.css';

function App() {
  return (
    <ThemeProvider>
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
          
          {/* Local Guide Panel (preview: allow the mock user to view it) */}
          <Route path="/local-guide/*" element={
            <ProtectedRoute allowedUserTypes={['user', 'local guide']}>
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
      <Toaster />
      <ConfirmDialog />
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
