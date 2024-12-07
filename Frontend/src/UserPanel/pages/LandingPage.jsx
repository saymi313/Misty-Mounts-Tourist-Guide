import React from "react";
import Navbar from "../components/Home/Navbar";
import HeroSection from "../components/Home/HeroSection";
import CategorySection from "../components/Home/CategorySection";
import DestinationSection from "../components/Home/DestinationSection";
import TripPackageSection from "../components/Home/TripPackageSection";

import SubscribeSection from "../components/Home/SubscribeSection";
import Footer from "../components/Home/Footer";
const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategorySection />
      <DestinationSection />
      <TripPackageSection />
      <SubscribeSection />
      <Footer />
    </div>
  );
};

export default LandingPage;