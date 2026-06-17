import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001' });

// Automatically attach the JWT token if present
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login    = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Users
export const getUsers   = ()     => api.get('/users');
export const getUser    = (id)   => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const changePassword = (id, data) => api.put(`/users/${id}/password`, data);

// Todos
export const getUserTodos = (userId, params) => api.get(`/users/${userId}/todos`, { params });
export const createTodo   = (data)           => api.post('/todos', data);
export const updateTodo   = (id, data)       => api.put(`/todos/${id}`, data);
export const deleteTodo   = (id)             => api.delete(`/todos/${id}`);

// Posts
export const getUserPosts  = (userId, params) => api.get(`/users/${userId}/posts`, { params });
export const getPost       = (id)             => api.get(`/posts/${id}`);
export const createPost    = (data)           => api.post('/posts', data);
export const updatePost    = (id, data)       => api.put(`/posts/${id}`, data);
export const deletePost    = (id)             => api.delete(`/posts/${id}`);

// Comments
export const getPostComments = (postId) => api.get(`/posts/${postId}/comments`);
export const createComment   = (data)   => api.post('/comments', data);   // { postId, body }
export const updateComment   = (id, data) => api.put(`/comments/${id}`, data);
export const deleteComment   = (id)       => api.delete(`/comments/${id}`);

// Albums
export const getUserAlbums  = (userId) => api.get(`/users/${userId}/albums`);
export const getAlbumPhotos = (albumId) => api.get(`/albums/${albumId}/photos`);
export const createAlbum    = (data)    => api.post('/albums', data);
export const updateAlbum    = (id, data) => api.put(`/albums/${id}`, data);
export const deleteAlbum    = (id)       => api.delete(`/albums/${id}`);

// Admin
export const adminGetUsers  = ()             => api.get('/admin/users');
export const adminBlockUser = (id, blocked)  => api.put(`/admin/users/${id}/block`, { blocked });
export const adminGetLogs   = ()             => api.get('/admin/logs');

export default api;
