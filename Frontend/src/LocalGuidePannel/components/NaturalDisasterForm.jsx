import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNaturalDisaster, getNaturalDisasterById, updateNaturalDisaster } from '../api/naturalDisasterApi';

const NaturalDisasterForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    date: '',
    severity: 'Low',
    affectedAreas: [],
    isResolved: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDisaster();
    }
  }, [id]);

  const fetchDisaster = async () => {
    try {
      setLoading(true);
      const response = await getNaturalDisasterById(id);
      setFormData({
        ...response.data,
        date: new Date(response.data.date).toISOString().split('T')[0]
      });
      setLoading(false);
    } catch (error) {
      setError('Error fetching natural disaster. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAffectedAreasChange = (e) => {
    const areas = e.target.value.split(',').map(area => area.trim());
    setFormData({ ...formData, affectedAreas: areas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await updateNaturalDisaster(id, formData);
      } else {
        await createNaturalDisaster(formData);
      }
      setLoading(false);
      navigate('/local-guide/natural-disasters');
    } catch (error) {
      setError('Error saving natural disaster. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Report'} Natural Disaster</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
            value={formData.location}
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
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="affectedAreas" className="block text-sm font-medium text-gray-700">Affected Areas (comma-separated)</label>
          <input
            type="text"
            id="affectedAreas"
            name="affectedAreas"
            value={formData.affectedAreas.join(', ')}
            onChange={handleAffectedAreasChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isResolved"
            name="isResolved"
            checked={formData.isResolved}
            onChange={(e) => setFormData({ ...formData, isResolved: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isResolved" className="ml-2 block text-sm text-gray-900">
            Is Resolved
          </label>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/local-guide/natural-disasters')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {id ? 'Update' : 'Report'} Natural Disaster
          </button>
        </div>
      </form>
    </div>
  );
};

export default NaturalDisasterForm;

