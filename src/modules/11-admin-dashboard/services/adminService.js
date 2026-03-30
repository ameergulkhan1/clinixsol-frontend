import api from '../../../utils/api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  getAnalytics: async (startDate, endDate) => {
    const response = await api.get(`/admin/analytics?start=${startDate}&end=${endDate}`);
    return response.data;
  }
};

export default adminService;