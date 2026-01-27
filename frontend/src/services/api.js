import apiClient from '../lib/api';

export const getCountries = async () => {
    const response = await apiClient.get('/countries/');
    return response.data.map(c => ({ ...c, value: c.code, label: c.name }));
};

export const getProfessions = async () => {
    const response = await apiClient.get('/professions/');
    return response.data;
};

export const getEducationDegrees = async () => {
    const response = await apiClient.get('/education-degrees/');
    return response.data;
};

export const getProfiles = async (params = {}) => {
    const response = await apiClient.get('/profiles/', { params });
    return response.data;
};

export const getProfile = async () => {
    const response = await apiClient.get('/profile/');
    return response.data;
};

export const getProfileById = async (id) => {
    const response = await apiClient.get(`/profiles/${id}/`);
    return response.data;
};

export const getInterests = async () => {
    const response = await apiClient.get('/interests/');
    return response.data;
};

export const sendInterest = async (receiverId) => {
    const response = await apiClient.post('/interests/', { receiver: receiverId });
    return response.data;
};

export const acceptInterest = async (interestId) => {
    const response = await apiClient.post(`/interests/${interestId}/accept/`);
    return response.data;
};

export const rejectInterest = async (interestId) => {
    const response = await apiClient.post(`/interests/${interestId}/reject/`);
    return response.data;
};

export const cancelInterest = async (interestId) => {
    const response = await apiClient.delete(`/interests/${interestId}/`);
    return response.data;
};

// --- Notification API Functions ---
export const getNotifications = async () => {
    const response = await apiClient.get('/notifications/');
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await apiClient.post('/notifications/mark-read/', { id: notificationId });
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await apiClient.post('/notifications/mark-read/', { all: true });
    return response.data;
};

export const getUnreadNotificationCount = async () => {
    const response = await apiClient.get('/notifications/unread-count/');
    return response.data;
};