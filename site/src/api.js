import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

const API_BASE = 'https://foodwasteai-production.up.railway.app/api';
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

  const text = await response.text().catch(() => null);
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || data?.message || text || `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.body = text;
    throw err;
  }

  return data;
};

export const api = {
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, token: await userCredential.user.getIdToken() };
    } catch (error) {
      throw new Error("Login failed", { cause: error });
    }
  },

  signup: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, token: await userCredential.user.getIdToken() };
    } catch (error) {
      throw new Error("Signup failed", { cause: error });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error("Logout failed", { cause: error });
    }
  },

  isAuthenticated: () => {
    return !!currentUser;
  },

  getCurrentUser: () => currentUser,

  getSettings: async () => {
    return fetchWithAuth('/settings');
  },

  saveSettings: async (settings) => {
    return fetchWithAuth('/settings', {
      method: 'POST',
      body: settings,
    });
  },

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, (user) => {
      currentUser = user;
      callback(user);
    });
  },

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
    const data = await fetchWithAuth('/data/daily-logs');
    return Array.isArray(data) ? data : [];
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
