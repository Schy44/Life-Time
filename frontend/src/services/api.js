import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the authorization token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    localStorage.setItem('authToken', token); // Store token in localStorage
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken'); // Remove token from localStorage
  }
};

// Initialize with token from localStorage if available
const token = localStorage.getItem('authToken');
if (token) {
  setAuthToken(token);
}

export const getUser = async () => {
  try {
    const response = await api.get('/user/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getProfiles = async () => {
  try {
    const response = await api.get('/profiles/');
    return response.data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/profile/');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const getProfileById = async (id) => {
  try {
    const response = await api.get(`/profiles/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile with id ${id}:`, error);
    throw error;
  }
};

export const updateProfile = async (id, formData) => {
  try {
    const response = await api.patch(`/profiles/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error updating profile - Response Data:', error.response.data);
      console.error('Error updating profile - Response Status:', error.response.status);
      console.error('Error updating profile - Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error updating profile - No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error updating profile - Request setup error:', error.message);
    }
    throw error;
  }
};

export const createProfile = async (formData) => {
  try {
    const response = await api.post('/profiles/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error creating profile - Response Data:', error.response.data);
      console.error('Error creating profile - Response Status:', error.response.status);
    } else if (error.request) {
      console.error('Error creating profile - No response received:', error.request);
    } else {
      console.error('Error creating profile - Request setup error:', error.message);
    }
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/login/', { username, password });
    setAuthToken(response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerUser = async (email, username, password, password2) => {
  try {
    const response = await api.post('/register/', { email, username, password, password2 });
    setAuthToken(response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const sendInterest = async (receiverId) => {
  try {
    const response = await api.post('/interests/', { receiver: receiverId });
    return response.data;
  } catch (error) {
    console.error('Error sending interest:', error);
    throw error;
  }
};

export const getInterests = async () => {
  try {
    const response = await api.get('/interests/');
    return response.data;
  } catch (error) {
    console.error('Error fetching interests:', error);
    throw error;
  }
};

export const acceptInterest = async (interestId) => {
  try {
    const response = await api.post(`/interests/${interestId}/accept/`);
    return response.data;
  } catch (error) {
    console.error('Error accepting interest:', error);
    throw error;
  }
};

export const rejectInterest = async (interestId) => {
  try {
    const response = await api.post(`/interests/${interestId}/reject/`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting interest:', error);
    throw error;
  }
};

export const cancelInterest = async (interestId) => {
  try {
    const response = await api.post(`/interests/${interestId}/cancel/`);
    return response.data;
  } catch (error) {
    console.error('Error canceling interest:', error);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await api.get('/countries/');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export default api;
