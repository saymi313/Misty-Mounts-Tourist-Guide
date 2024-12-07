import React from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

const ContactForm = () => {
  return (
    <form className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Send Us a Message</h2>
      <div className="relative">
        <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your Name"
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Your Email"
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <MessageSquare className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
        <textarea
          id="message"
          name="message"
          rows="4"
          placeholder="Tell us about your dream vacation"
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
        >
          Send Message
          <Send className="ml-2 -mr-1 h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default ContactForm;

