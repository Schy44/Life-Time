import axios from 'axios';
import { supabase } from './supabaseClient';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://life-time-pxjp.onrender.com/api' 
    : 'http://127.0.0.1:8000/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error:", error.response.status, error.response.data);

      if (error.response.status === 401) {
        // Handle unauthorized errors, e.g., redirect to login
        console.log("Unauthorized: Redirecting to login...");
        // Example: window.location.href = '/login';
      } else if (error.response.status === 403) {
        console.log("Forbidden: You don't have permission.");
      } else if (error.response.status >= 500) {
        console.log("Server Error: Please try again later.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API Error: No response received", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
