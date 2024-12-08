import React, { useState } from 'react';

const NearbyPlaceForm = ({ onSubmit, onCancel }) => { // Receive onSubmit prop
  const [place, setPlace] = useState({
    name: '',
    location: '',
    description: '',
    picture: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlace({ ...place, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(place); // Call the parent's onSubmit function
    setPlace({ name: '', location: '', description: '', picture: '' });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h4 className="text-lg font-semibold mb-2">Add Nearby Place</h4>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={place.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={place.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={place.description}
            onChange={handleChange}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="picture" className="block text-sm font-medium text-gray-700">Picture URL</label>
          <input
            type="url"
            id="picture"
            name="picture"
            value={place.picture}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button" // Change type to "button" to avoid default form submission
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Nearby Place
          </button>
        </div>
      </div>
    </div>
  );
};

export default NearbyPlaceForm;
