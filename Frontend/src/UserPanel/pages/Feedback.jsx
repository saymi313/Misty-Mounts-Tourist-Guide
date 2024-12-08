import React from 'react';
import FeedbackForm from '../components/Feedbacks/FeedbackForm';
import ChatBox from '../components/Feedbacks/ChatBox';
import Navbar from '../components/Navbar';

const FeedbackPage = () => {
  return (
  <>
  <Navbar></Navbar>
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-emerald-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white text-center mb-8 drop-shadow-lg">
          Rate Your Tourist Spot Experience
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white border-opacity-20">
            <FeedbackForm />
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white border-opacity-20">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default FeedbackPage;

