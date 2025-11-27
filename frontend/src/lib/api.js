import axios from 'axios';
import { supabase } from './supabaseClient';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://life-time-pxjp.onrender.com/api'
    : 'http://127.0.0.1:8000/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        return config;
      }

      if (session && session.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('✅ Auth header added');
      } else {
        console.warn('⚠️ No valid session found');
      }
    } catch (err) {
      console.error('Error in auth interceptor:', err);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
