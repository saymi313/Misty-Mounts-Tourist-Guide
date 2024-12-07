import React, { useState } from 'react';
import { Star, Send, MapPin } from 'lucide-react';

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <form className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="h-8 w-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-emerald-800">Share Your Tourist Spot Experience</h2>
      </div>
      <div>
        <label htmlFor="spotName" className="block text-sm font-medium text-emerald-700 mb-1">
          Tourist Spot Name
        </label>
        <input
          type="text"
          id="spotName"
          name="spotName"
          className="w-full px-3 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white bg-opacity-50"
          placeholder="e.g., Eiffel Tower, Grand Canyon, Taj Mahal"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-emerald-700 mb-1">Your Rating</label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-8 w-8 cursor-pointer transition-colors duration-200 ${
                star <= (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-emerald-700 mb-1">
          Your Feedback
        </label>
        <textarea
          id="feedback"
          name="feedback"
          rows="4"
          className="w-full px-3 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white bg-opacity-50"
          placeholder="Describe your experience, the sights, the atmosphere..."
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300"
      >
        Submit Feedback
        <Send className="ml-2 -mr-1 h-5 w-5" />
      </button>
    </form>
  );
};

export default FeedbackForm;

