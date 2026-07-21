import React from 'react';
import ContactForm from '../components/Contactus/ContactForm';
import ContactInfo from '../components/Contactus/ContactInfo';
import Map from '../components/Contactus/Map';
import Navbar from "../components/Navbar";
import Footer from '../components/Home/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-frost-50 dark:bg-abyss-950">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-abyss-900 dark:text-frost-50 sm:text-5xl">
            Let's plan your{" "}
            <span className="font-accent font-normal text-glacier-700 dark:text-glacier-300">adventure.</span>
          </h1>
          <p className="mt-3 text-lg text-frost-600 dark:text-frost-300">
            Ready for the north? Reach out and we'll connect you with a local guide to shape
            the trip around you.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-surface overflow-hidden">
            <ContactForm />
          </div>
          <div className="space-y-6">
            <div className="card-surface overflow-hidden">
              <ContactInfo />
            </div>
            <div className="card-surface overflow-hidden">
              <Map />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
