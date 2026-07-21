import React from "react";
import Navbar from "../components/Navbar";
import CustomCursor from "../components/Home/CustomCursor";
import Marquee from "../components/Home/Marquee";
import Hero from "../components/Home/Hero";
import DiscoveryTeaser from "../components/Home/DiscoveryTeaser";
import HiddenGemsSpotlight from "../components/Home/HiddenGemsSpotlight";
import HowItWorks from "../components/Home/HowItWorks";
import SocialProof from "../components/Home/SocialProof";
import LocalGuidesCallout from "../components/Home/LocalGuidesCallout";
import FinalCTA from "../components/Home/FinalCTA";
import Footer from "../components/Home/Footer";

const valleys = [
  "Hunza", "Skardu", "Deosai", "Fairy Meadows", "Naran",
  "Swat", "Gilgit", "Attabad", "Passu", "Kaghan",
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <CustomCursor />
      <Navbar overlay />
      <main>
        {/* Dark */}
        <Hero />

        {/* Bright glacier marquee band — the transition out of the hero */}
        <div className="bg-glacier-400 py-4 sm:py-5">
          <Marquee
            items={valleys}
            sep="✳"
            sepClassName="text-abyss-950/40"
            className="font-display text-2xl font-bold uppercase tracking-tight text-abyss-950 sm:text-4xl"
          />
        </div>

        {/* Light */}
        <DiscoveryTeaser />
        {/* Dark */}
        <HiddenGemsSpotlight />
        {/* Light */}
        <HowItWorks />
        {/* Dark */}
        <SocialProof />
        {/* Light (warm sand panel) */}
        <LocalGuidesCallout />
        {/* Dark */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
