import apiClient from '../lib/api';

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://life-time-pxjp.onrender.com/api/auth'
    : 'http://127.0.0.1:8000/api/auth';

/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */
const authService = {
    /**
     * Register a new user - sends OTP to email
     * @param {string} name - User's full name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} Response with message and email
     */
    async register(name, email, password) {
        const response = await apiClient.post(`${API_URL}/register/`, {
            name,
            email,
            password,
            password2: password
        });
        return response.data;
    },

    /**
     * Verify email with OTP code and create account
     * @param {string} email - User's email
     * @param {string} otp - 6-digit OTP code
     * @param {string} name - User's full name
     * @param {string} password - User's password
     * @returns {Promise} Response with user data and tokens
     */
    async verifyEmail(email, otp, name, password) {
        const response = await apiClient.post(`${API_URL}/verify-email/`, {
            email,
            otp,
            name,
            password
        });

        if (response.data.tokens) {
            this.setTokens(response.data.tokens.access, response.data.tokens.refresh);
        }

        return response.data;
    },

    /**
     * Resend OTP code to email
     * @param {string} email - User's email
     * @returns {Promise} Response with message
     */
    async resendOTP(email) {
        const response = await apiClient.post(`${API_URL}/resend-otp/`, { email });
        return response.data;
    },

    /**
     * Login user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} Response with user data and tokens
     */
    async login(email, password) {
        const response = await apiClient.post(`${API_URL}/login/`, {
            email,
            password
        });

        if (response.data.tokens) {
            this.setTokens(response.data.tokens.access, response.data.tokens.refresh);
        }

        return response.data;
    },

    /**
     * Logout user
     * @returns {Promise} Response with message
     */
    async logout() {
        try {
            await apiClient.post(`${API_URL}/logout/`);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearTokens();
        }
    },

    /**
     * Refresh access token using refresh token
     * @returns {Promise<string>} New access token
     */
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await apiClient.post(`${API_URL}/refresh/`, {
            refresh: refreshToken
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        return newAccessToken;
    },

    /**
     * Request password reset - sends OTP to email
     * @param {string} email - User's email
     * @returns {Promise} Response with message
     */
    async requestPasswordReset(email) {
        const response = await apiClient.post(`${API_URL}/password-reset/`, { email });
        return response.data;
    },

    /**
     * Verify password reset OTP (optional step for better UX)
     * @param {string} email - User's email
     * @param {string} otp - 6-digit OTP code
     * @returns {Promise} Response with message
     */
    async verifyPasswordResetOTP(email, otp) {
        const response = await apiClient.post(`${API_URL}/password-reset-verify/`, {
            email,
            otp
        });
        return response.data;
    },

    /**
     * Confirm password reset with OTP and new password
     * @param {string} email - User's email
     * @param {string} otp - 6-digit OTP code
     * @param {string} newPassword - New password
     * @returns {Promise} Response with message
     */
    async confirmPasswordReset(email, otp, newPassword) {
        const response = await apiClient.post(`${API_URL}/password-reset-confirm/`, {
            email,
            otp,
            new_password: newPassword,
            new_password2: newPassword
        });
        return response.data;
    },

    /**
     * Get access token from localStorage
     * @returns {string|null} Access token
     */
    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    /**
     * Get refresh token from localStorage
     * @returns {string|null} Refresh token
     */
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    },

    /**
     * Store tokens in localStorage
     * @param {string} accessToken - Access token
     * @param {string} refreshToken - Refresh token
     */
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    },

    /**
     * Remove tokens from localStorage
     */
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if access token exists
     */
    isAuthenticated() {
        return !!this.getAccessToken();
    }
};

export default authService;
