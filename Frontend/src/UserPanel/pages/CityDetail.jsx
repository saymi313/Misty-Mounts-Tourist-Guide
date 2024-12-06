import React from 'react';
import Header from '../components/Detail/Header';
import HeroSection from '../components/Detail/HeroSection';
import Highlights from '../components/Detail/Highlights';
import Description from '../components/Detail/Description';
import Activity from '../components/Detail/Activity';
import Map from '../components/Detail/Map';

const Citydetail = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <Highlights />
      <Description />
      <Activity />
      <Map />
    </div>
  );
};

export default Citydetail;
