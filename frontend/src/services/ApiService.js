const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_BASE_URL || '/api'
  : '/api'; // Uses Vite proxy in development

class ApiService {
  static async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async getPlayers() {
    return this.request('/players');
  }

  static async getLiveMatches() {
    return this.request('/live-matches');
  }

  static async getWeather(city) {
    return this.request(`/weather/${encodeURIComponent(city)}`);
  }

  static async getMatchDetails(matchId) {
    return this.request(`/match/${matchId}`);
  }

  static async searchPlayers(query, filters = {}) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.team) params.append('team', filters.team);
    if (filters.role) params.append('role', filters.role);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const endpoint = `/search/players${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  static async getAnalytics() {
    return this.request('/analytics');
  }

  static async getPlayerDetails(playerName) {
    return this.request(`/player/${encodeURIComponent(playerName)}`);
  }

  static async checkHealth() {
    return this.request('/health');
  }

  static async clearCache() {
    return this.request('/cache/clear', { method: 'POST' });
  }

  static async getCacheStatus() {
    return this.request('/cache/status');
  }
}

export default ApiService;