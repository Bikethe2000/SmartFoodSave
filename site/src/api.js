import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

const getAuthToken = async () => {
  if (!currentUser) {
    throw new Error('User is not authenticated');
  }
  return currentUser.getIdToken();
};

const fetchWithAuth = async (path, options = {}) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Server request failed');
  }

  return data;
};

export const api = {
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, token: await userCredential.user.getIdToken() };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  signup: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, token: await userCredential.user.getIdToken() };
    } catch (error) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  },

  isAuthenticated: () => {
    return !!currentUser;
  },

  getCurrentUser: () => currentUser,

  getWeeklyWaste: async () => {
    return fetchWithAuth('/stats/weekly-waste');
  },

  getUpcomingPredictions: async () => {
    return fetchWithAuth('/predictions/upcoming');
  },

  getPredictions: async (from, to) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/predictions${queryString}`);
  },

  getPredictionDetails: async (id) => {
    return fetchWithAuth(`/predictions/${id}`);
  },

  getTodayRecommendations: async () => {
    return fetchWithAuth('/recommendations/today');
  },

  getRecommendations: async () => {
    return fetchWithAuth('/recommendations');
  },

  acceptRecommendation: async (id) => {
    return fetchWithAuth(`/recommendations/${id}/accept`, {
      method: 'POST',
    });
  },

  ignoreRecommendation: async (id) => {
    return fetchWithAuth(`/recommendations/${id}/ignore`, {
      method: 'POST',
    });
  },

  getDailyLogs: async () => {
    return fetchWithAuth('/data/daily-logs');
  },

  addDailyLog: async (logData) => {
    return fetchWithAuth('/data/daily-logs', {
      method: 'POST',
      body: logData,
    });
  },

  addPrediction: async (predictionData) => {
    return fetchWithAuth('/predictions', {
      method: 'POST',
      body: predictionData,
    });
  },

  addRecommendation: async (recommendationData) => {
    return fetchWithAuth('/recommendations', {
      method: 'POST',
      body: recommendationData,
    });
  },
};
