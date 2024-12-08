import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllNaturalDisasters, deleteNaturalDisaster } from '../api/naturalDisasterApi';
import { FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const NaturalDisasterList = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllNaturalDisasters();
      setDisasters(response.data);
    } catch (error) {
      console.error('Error fetching natural disasters:', error);
      setError('Error fetching natural disasters. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this natural disaster report?')) {
      try {
        await deleteNaturalDisaster(id);
        fetchDisasters();
      } catch (error) {
        console.error('Error deleting natural disaster:', error);
        setError('Error deleting natural disaster. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Natural Disasters</h1>
        <Link to="/local-guide/add-natural-disaster" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300">
          Report New Disaster
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {disasters.length === 0 ? (
        <div className="text-center py-4">
          <FaExclamationTriangle className="mx-auto text-yellow-500 text-5xl mb-4" />
          <p className="text-xl text-gray-600">No natural disasters reported yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {disasters.map((disaster) => (
                <tr key={disaster._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{disaster.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{disaster.location}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{new Date(disaster.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      disaster.severity === 'High' ? 'text-red-900' :
                      disaster.severity === 'Medium' ? 'text-yellow-900' : 'text-green-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        disaster.severity === 'High' ? 'bg-red-200' :
                        disaster.severity === 'Medium' ? 'bg-yellow-200' : 'bg-green-200'
                      }`}></span>
                      <span className="relative">{disaster.severity}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      disaster.isResolved ? 'text-green-900' : 'text-red-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        disaster.isResolved ? 'bg-green-200' : 'bg-red-200'
                      }`}></span>
                      <span className="relative">{disaster.isResolved ? 'Resolved' : 'Ongoing'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center space-x-4">
                      <Link to={`/local-guide/edit-natural-disaster/${disaster._id}`} className="text-indigo-600 hover:text-indigo-900">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(disaster._id)} className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NaturalDisasterList;

