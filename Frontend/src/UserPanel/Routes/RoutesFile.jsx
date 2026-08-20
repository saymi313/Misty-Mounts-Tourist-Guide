import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";

// Pages that require a signed-in account. Visiting them logged out redirects to
// /auth (which returns the visitor here after they sign in).
const Auth = (el) => <ProtectedRoute allowedUserTypes={["user", "local guide"]}>{el}</ProtectedRoute>;

// Lazy-load every page so each becomes its own chunk — the initial bundle stays
// small and pages load on demand.
const Destination = lazy(() => import('../pages/Destination'));
const CitySpots = lazy(() => import('../pages/CitySpots'));
const CityDetail = lazy(() => import('../pages/CityDetail'));
const Hotel = lazy(() => import('../pages/Hotel'));
const Payment = lazy(() => import('../pages/Payment'));
const Contact = lazy(() => import('../pages/Contact'));
const About = lazy(() => import('../pages/About'));
const Feedback = lazy(() => import('../pages/Feedback'));
const Guides = lazy(() => import('../pages/Guides'));
const GuideDetail = lazy(() => import('../pages/GuideDetail'));
const Tours = lazy(() => import('../pages/Tours'));
const TourDetail = lazy(() => import('../pages/TourDetail'));
const Messages = lazy(() => import('../pages/Messages'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const TripBuilder = lazy(() => import('../pages/TripBuilder'));
const TripPlanner = lazy(() => import('../pages/TripPlanner'));
const Discover = lazy(() => import('../pages/Discover'));
const MapPage = lazy(() => import('../pages/MapPage'));
const Safety = lazy(() => import('../pages/Safety'));
const Profile = lazy(() => import('../pages/Profile'));
const SavedSpots = lazy(() => import('../pages/SavedSpots'));
const MyBookings = lazy(() => import('../pages/MyBookings'));
const Notifications = lazy(() => import('../pages/Notifications'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-night-950">
    <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-lime-400" />
  </div>
);

const RoutesFile = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/destinations" element={<Destination />} />
        <Route path="/destinations/:city" element={<CitySpots />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/city/:city/spot/:spotId" element={<CityDetail />} />
        <Route path="/accommodations/:id" element={<Hotel />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:id" element={<GuideDetail />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/trip" element={<TripBuilder />} />
        <Route path="/plan" element={<TripPlanner />} />
        <Route path="/discover" element={<Discover />} />

        {/* Account & transaction pages — require sign-in */}
        <Route path="/payment" element={Auth(<Payment />)} />
        <Route path="/messages" element={Auth(<Messages />)} />
        <Route path="/profile" element={Auth(<Profile />)} />
        <Route path="/saved" element={Auth(<SavedSpots />)} />
        <Route path="/bookings" element={Auth(<MyBookings />)} />
        <Route path="/notifications" element={Auth(<Notifications />)} />
      </Routes>
    </Suspense>
  );
};

export default RoutesFile;
