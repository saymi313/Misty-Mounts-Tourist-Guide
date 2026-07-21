import React from 'react';
import HeroSection from '../components/Aboutus/HeroSection';
import OwnerCard from '../components/Aboutus/OwnerCard';
import Navbar from "../components/Navbar";
import Footer from '../components/Home/Footer';
import { img } from '../../data/mockData';

const About = () => {
  const owners = [
    {
      name: 'Usairam Saeed',
      role: 'CEO & Founder',
      bio: 'Passionate traveller with 10+ years of experience across the Karakoram and Himalaya.',
      image: img('team-usairam', 300, 300),
      github: 'https://github.com/saymi313',
      linkedin: 'https://linkedin.com/in/usairamsaeed',
    },
    {
      name: 'Syed Ali Hassan',
      role: 'Co-founder',
      bio: 'Tech enthusiast and adventure seeker, bringing innovation to travel experiences.',
      image: img('team-ali', 300, 300),
      github: 'https://github.com/johnsmith',
      linkedin: 'https://linkedin.com/in/johnsmith',
    },
    {
      name: 'Obaidullah',
      role: 'Guide Relations',
      bio: 'Dedicated to connecting travellers with the best local guides across the north.',
      image: img('team-obaid', 300, 300),
      github: 'https://github.com/emilybrown',
      linkedin: 'https://linkedin.com/in/emilybrown',
    },
  ];

  const stats = [
    ['6', 'Valleys covered'],
    ['120+', 'Curated spots'],
    ['24', 'Local guides'],
    ['1,900+', 'Traveller reviews'],
  ];

  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />
      <HeroSection />

      {/* Stats band */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="-mt-12 grid grid-cols-2 gap-4 rounded-3xl bg-white dark:bg-abyss-900 p-6 shadow-lift ring-1 ring-abyss-900/10 dark:ring-frost-50/10 sm:grid-cols-4">
          {stats.map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl font-semibold text-glacier-700 dark:text-glacier-300">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-frost-500 dark:text-frost-400">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="text-center">
          <p className="eyebrow justify-center">The people</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-4xl">
            Meet the team
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {owners.map((owner, index) => (
            <OwnerCard key={index} {...owner} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
