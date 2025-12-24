import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8081';
const ROOM_URL = import.meta.env.VITE_ROOM_URL || 'http://localhost:8082';
const CHAT_URL = import.meta.env.VITE_CHAT_URL || 'http://localhost:8084';
const PROFILE_URL = import.meta.env.VITE_PROFILE_URL || 'http://localhost:8085';

const createApi = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config) => {
    const { token, user } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (user) {
      config.headers['X-User-Id'] = user.id;
      config.headers['X-Username'] = encodeURIComponent(user.username);
      config.headers['X-Display-Name'] = encodeURIComponent(user.displayName);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const authApi$ = createApi(AUTH_URL);
const roomApi$ = createApi(ROOM_URL);
const chatApi$ = createApi(CHAT_URL);
const profileApi$ = createApi(PROFILE_URL);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    authApi$.post('/auth/login', { email, password }),
  register: (data: { email: string; username: string; password: string; displayName: string }) =>
    authApi$.post('/auth/register', data),
  logout: () => authApi$.post('/auth/logout'),
  me: () => authApi$.get('/auth/me'),
};

// Room API
export const roomApi = {
  create: (name: string) => roomApi$.post('/rooms', { name }),
  join: (code: string) => roomApi$.post(`/rooms/join/${code}`),
  leave: (roomId: string) => roomApi$.post(`/rooms/${roomId}/leave`),
  get: (roomId: string) => roomApi$.get(`/rooms/${roomId}`),
  getParticipants: (roomId: string) => roomApi$.get(`/rooms/${roomId}/participants`),
};

// Profile API
export const profileApi = {
  get: (userId: string) => profileApi$.get(`/profiles/${userId}`),
  update: (data: { displayName?: string; avatar?: string }) =>
    profileApi$.put('/profiles/me', data),
};

// Chat API
export const chatApi = {
  getMessages: (roomId: string, page = 0, size = 50) =>
    chatApi$.get(`/chat/${roomId}/messages`, { params: { page, size } }),
  sendMessage: (roomId: string, content: string) =>
    chatApi$.post(`/chat/${roomId}/messages`, { content }),
};
