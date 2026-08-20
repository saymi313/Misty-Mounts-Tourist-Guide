import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import ErrorBoundary from './components/ErrorBoundary';
import Authentication from './UserPanel/pages/Authentication';
import LandingPage from './UserPanel/pages/LandingPage';
import AdminRoutes from './AdminFrontend/routes/adminRoutes';
import PanelSelector from './PanelSelector';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRoutesWrapper from './components/ProtectedRoutesWrapper';
import LocalGuidePanel from './LocalGuidePannel/LocalGuidePanel';
import HotelPanel from './HotelPannel/HotelPanel';
import TravelAgencyPanel from './TravelAgencyPannel/TravelAgencyPanel';
import Toaster from './components/Toaster';
import ConfirmDialog from './components/ConfirmDialog';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
    <I18nProvider>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Authentication route */}
          <Route path="/auth" element={<Authentication />} />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/user" replace />} />
          
          {/* Public landing — the whole traveller panel is browsable without login;
              only account/transaction pages are gated (see RoutesFile). */}
          <Route path="/user" element={<LandingPage />} />
          
          {/* Local Guide Panel — local guides only */}
          <Route path="/local-guide/*" element={
            <ProtectedRoute allowedUserTypes={['local guide']}>
              <LocalGuidePanel />
            </ProtectedRoute>
          } />

          {/* Hotel manager panel — hotels only */}
          <Route path="/hotel/*" element={
            <ProtectedRoute allowedUserTypes={['hotel']}>
              <HotelPanel />
            </ProtectedRoute>
          } />

          {/* Travel agency panel — travel agencies only */}
          <Route path="/travel-agency/*" element={
            <ProtectedRoute allowedUserTypes={['travel agency']}>
              <TravelAgencyPanel />
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
    </I18nProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
