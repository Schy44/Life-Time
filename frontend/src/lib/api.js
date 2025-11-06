import axios from 'axios';
import { supabase } from './supabaseClient';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Your Django backend URL
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

export default apiClient;
