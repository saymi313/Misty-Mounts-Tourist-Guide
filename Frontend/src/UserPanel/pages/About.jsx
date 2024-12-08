import React from 'react';

import HeroSection from '../components/Aboutus/HeroSection';
import OwnerCard from '../components/Aboutus/OwnerCard';
import Navbar from "../components/Navbar";
const About = () => {
  const owners = [
    {
      name: 'Jane Doe',
      role: 'CEO & Founder',
      bio: 'Passionate traveler with 10+ years of experience in the tourism industry.',
      image: '/placeholder.svg?height=300&width=300',
      github: 'https://github.com/janedoe',
      linkedin: 'https://linkedin.com/in/janedoe'
    },
    {
      name: 'John Smith',
      role: 'CTO',
      bio: 'Tech enthusiast and adventure seeker, bringing innovation to travel experiences.',
      image: '/placeholder.svg?height=300&width=300',
      github: 'https://github.com/johnsmith',
      linkedin: 'https://linkedin.com/in/johnsmith'
    },
    {
      name: 'Emily Brown',
      role: 'Head of Customer Experience',
      bio: 'Dedicated to creating unforgettable journeys for our clients.',
      image: '/placeholder.svg?height=300&width=300',
      github: 'https://github.com/emilybrown',
      linkedin: 'https://linkedin.com/in/emilybrown'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <HeroSection />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {owners.map((owner, index) => (
            <OwnerCard key={index} {...owner} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;

