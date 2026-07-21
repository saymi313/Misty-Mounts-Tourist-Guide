import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '../components/Contactus/ContactForm';
import ContactInfo from '../components/Contactus/ContactInfo';
import Map from '../components/Contactus/Map';
import Navbar from "../components/Navbar";
import Footer from '../components/Home/Footer';
import { Tile, Eyebrow } from '../components/bento/tiles';

const EASE = [0.16, 1, 0.3, 1];

const Contact = () => {
  return (
    <div className="min-h-screen bg-night-950 text-white selection:bg-lime-400 selection:text-night-950">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            Let's plan your{" "}
            <span className="text-lime-400">adventure.</span>
          </h1>
          <p className="mt-3 text-lg text-white/70">
            Ready for the north? Reach out and we'll connect you with a local guide to shape
            the trip around you.
          </p>
        </motion.div>

        {/* Bento: form tile + info tile + map tile */}
        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ContactForm />
          <div className="grid grid-cols-1 gap-3">
            <ContactInfo />
            <Tile pad="p-0" delay={0.08} className="min-h-[16rem]">
              <Map />
            </Tile>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
