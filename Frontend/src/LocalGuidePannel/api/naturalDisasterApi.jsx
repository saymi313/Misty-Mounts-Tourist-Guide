import axios from 'axios';

const API_URL = 'http://localhost:5000/api/natural-disaster';  // Corrected endpoint

const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    throw new Error(error.response.data.message || 'An error occurred while processing your request.');
  } 
  else if (error.request) {
    throw new Error('No response received from the server. Please try again later.');
  } 
  else {
    throw new Error('An error occurred while setting up the request. Please try again.');
  }
};

export const createNaturalDisaster = async (disasterData) => {
  try {
    const response = await axios.post(`${API_URL}/add-disaster`, disasterData);  // Corrected endpoint
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAllNaturalDisasters = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-disaster`);  // Corrected endpoint
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getNaturalDisasterById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateNaturalDisaster = async (id, disasterData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, disasterData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteNaturalDisaster = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
