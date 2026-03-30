import api from '../../../utils/api';

export const communicationService = {
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  getMessages: async (userId, contactId) => {
    const response = await api.get(`/messages/${userId}/${contactId}`);
    return response.data;
  },

  getNotifications: async (userId) => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }
};

export default communicationService;