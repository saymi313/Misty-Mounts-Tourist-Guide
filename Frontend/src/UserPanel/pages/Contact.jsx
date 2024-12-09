import React from 'react';
import ContactForm from '../components/Contactus/ContactForm';
import ContactInfo from '../components/Contactus/ContactInfo';
import Map from '../components/Contactus/Map';
import Navbar from "../components/Navbar";

const Contact = () => {
    return (
      <>
      <div className='min-h-screen bg-blue-50 '>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Contact Your Adventure Guides</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Ready to embark on your next journey? We're here to turn your travel dreams into reality. Reach out and let's start planning your adventure!
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition duration-300">
              {/* Set height and width using Tailwind classes for responsiveness */}
              <div 
                className="bg-cover bg-center" 
                style={{ 
                  backgroundImage: "url('contact.svg?height=192&width=768')",
                  height: '250px',  
                  width: '100%'     
                }}
              ></div>
              <ContactForm />
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition duration-300">
                {/* Set height and width for the second image */}
                <div 
                  className="bg-cover bg-center" 
                  style={{ 
                    backgroundImage: "url('location.svg?height=192&width=768')",
                    height: '250px',  // Adjust the height as needed
                    width: '100%'      // Ensure it stretches across the container
                  }}
                ></div>
                <ContactInfo />
              </div>
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition duration-300">
                {/* You can add content or another image here */}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </>
    );
};

export default Contact;
