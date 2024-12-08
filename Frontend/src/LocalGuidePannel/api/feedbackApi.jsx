import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getFeedback = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/feedback/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

