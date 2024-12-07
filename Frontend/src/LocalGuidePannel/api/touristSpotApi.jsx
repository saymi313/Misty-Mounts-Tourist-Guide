import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tourist-spots'; // Adjust this URL as needed

export const createTouristSpot = async (spotData) => {
  try {
    const response = await axios.post(API_URL, spotData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllTouristSpots = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTouristSpotById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTouristSpot = async (id, spotData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, spotData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteTouristSpot = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

