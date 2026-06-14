const BASE_URL = 'http://localhost:5000/api';

// Helper to handle fetch responses
async function request(path, options = {}) {
  const token = localStorage.getItem('sfs_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      localStorage.setItem('sfs_token', res.token);
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('sfs_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('sfs_token');
  },

  getWeeklyWaste: () => request('/stats/weekly-waste'),
  
  getUpcomingPredictions: () => request('/predictions/upcoming'),
  
  getTodayRecommendations: () => request('/recommendations/today'),
  
  getPredictions: (from, to) => {
    let query = '';
    if (from && to) {
      query = `?from=${from}&to=${to}`;
    }
    return request(`/predictions${query}`);
  },
  
  getPredictionDetails: (id) => request(`/predictions/${id}`),
  
  getRecommendations: () => request('/recommendations'),
  
  acceptRecommendation: (id) => request(`/recommendations/${id}/accept`, { method: 'POST' }),
  
  ignoreRecommendation: (id) => request(`/recommendations/${id}/ignore`, { method: 'POST' }),
  
  getDailyLogs: () => request('/data/daily-logs'),
  
  addDailyLog: (logData) => request('/data/daily-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  }),
};
