import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Our Adventure Hub</h2>
      <div className="space-y-4">
        <div className="flex items-start">
          <MapPin className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
            <p className="mt-1 text-gray-600">
              789 Explorer's Avenue<br />
              Wanderlust City, WC 54321
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Phone className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Phone</h3>
            <p className="mt-1 text-gray-600">+1 (555) 987-6543</p>
          </div>
        </div>
        <div className="flex items-center">
          <Mail className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Email</h3>
            <p className="mt-1 text-gray-600">adventures@travelagency.com</p>
          </div>
        </div>
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Office Hours</h3>
            <p className="mt-1 text-gray-600">Mon-Fri: 9AM-6PM<br />Sat: 10AM-4PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;

