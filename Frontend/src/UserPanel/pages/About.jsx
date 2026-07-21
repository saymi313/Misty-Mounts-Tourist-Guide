import React from 'react';
import { Users, Mountain } from 'lucide-react';
import HeroSection from '../components/Aboutus/HeroSection';
import OwnerCard from '../components/Aboutus/OwnerCard';
import Navbar from "../components/Navbar";
import Footer from '../components/Home/Footer';
import { img } from '../../data/mockData';
import { Tile, PhotoTile, Eyebrow, SectionHead } from '../components/bento/tiles';

const GLOWS = ['green', 'lime', 'sky', 'lime'];

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
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <HeroSection />

      <main className="mx-auto max-w-[1400px] space-y-16 px-4 pb-16 sm:px-6 lg:space-y-24 lg:pb-24">
        {/* Stats band — night tiles with lime numbers */}
        <section className="relative z-10 -mt-12 sm:-mt-16">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(([n, l], i) => (
              <Tile key={l} glow={GLOWS[i % GLOWS.length]} delay={i * 0.05} className="flex flex-col justify-center">
                <div className="text-4xl font-extrabold tracking-tight text-lime-400 sm:text-5xl">{n}</div>
                <div className="mt-1 text-sm text-white/60">{l}</div>
              </Tile>
            ))}
          </div>
        </section>

        {/* Mission bento — lead with imagery */}
        <section>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <PhotoTile
              image={img('about-mission', 900, 900)}
              title="From Hunza to the Deosai plains"
              meta="Gilgit-Baltistan"
              to="/destinations"
              className="min-h-[280px] md:col-span-2 md:min-h-[360px]"
            />
            <Tile glow="lime" pad="p-6 sm:p-8" className="flex flex-col justify-between">
              <Eyebrow><Mountain className="h-3.5 w-3.5" /> Why we exist</Eyebrow>
              <div>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  The north, told by the people who <span className="text-lime-400">live it.</span>
                </h2>
                <p className="mt-4 text-white/70">
                  Every route, stay and hidden gem on Misty Mounts is vetted by a local guide — so
                  your trip is shaped by the people who know the mountains best.
                </p>
              </div>
            </Tile>
          </div>
        </section>

        {/* Team — grid of night tiles */}
        <section>
          <SectionHead eyebrow="The people" title="Meet the team" icon={Users} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {owners.map((owner, index) => (
              <OwnerCard key={index} {...owner} delay={index * 0.06} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
