import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

export const createTouristSpot = async (spotData) => {
  try {
    const response = await axios.post(`${API_URL}/spots`, spotData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllTouristSpots = async () => {
  try {
    const response = await axios.get(`${API_URL}/spots`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTouristSpotById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/spots/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTouristSpot = async (id, spotData) => {
  try {
    const response = await axios.put(`${API_URL}/spots/${id}`, spotData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteTouristSpot = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/spots/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addNearbyPlace = async (spotId, placeData) => {
  try {
    const response = await axios.post(`${API_URL}/spots/${spotId}/nearbyPlaces`, placeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateNearbyPlace = async (spotId, placeId, placeData) => {
  try {
    const response = await axios.put(`${API_URL}/spots/${spotId}/nearbyPlaces/${placeId}`, placeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteNearbyPlace = async (spotId, placeId) => {
  try {
    const response = await axios.delete(`${API_URL}/spots/${spotId}/nearbyPlaces/${placeId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

