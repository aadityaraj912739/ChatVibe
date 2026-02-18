import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// User API
export const userAPI = {
  getUsers: (search) => api.get('/users', { params: { search } }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  uploadProfilePicture: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/api/users/upload-profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Chat API
export const chatAPI = {
  createChat: (userId) => api.post('/chats', { userId }),
  getChats: () => api.get('/chats'),
  getChatById: (id) => api.get(`/chats/${id}`),
  createGroupChat: (data) => api.post('/chats/group', data),
  addUserToGroup: (chatId, userId) => api.put('/chats/group/add', { chatId, userId }),
  removeUserFromGroup: (chatId, userId) => api.put('/chats/group/remove', { chatId, userId }),
  leaveGroup: (chatId) => api.put('/chats/group/leave', { chatId }),
  renameGroup: (chatId, name) => api.put('/chats/group/rename', { chatId, name }),
  changeGroupAdmin: (chatId, newAdminId) => api.put('/chats/group/admin', { chatId, newAdminId })
};

// Message API
export const messageAPI = {
  getMessages: (chatId, page = 1, limit = 50) => 
    api.get(`/messages/${chatId}`, { params: { page, limit } }),
  sendMessage: (data) => api.post('/messages', data),
  sendImageMessage: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/api/messages/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  markChatAsRead: (chatId) => api.put(`/messages/chat/${chatId}/read`)
};

export default api;
