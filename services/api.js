import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.91:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored JWT token
  async getToken() {
    try {
      return await AsyncStorage.getItem('jwt_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store JWT token
  async setToken(token) {
    try {
      await AsyncStorage.setItem('jwt_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Remove JWT token
  async removeToken() {
    try {
      await AsyncStorage.removeItem('jwt_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth0 Integration - Create/Update User
  async authenticateWithAuth0(userInfo) {
    try {
      const response = await this.makeRequest('/users/auth0', {
        method: 'POST',
        body: JSON.stringify({
          auth0Id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        }),
      });

      if (response.success && response.data.token) {
        await this.setToken(response.data.token);
      }

      return response;
    } catch (error) {
      console.error('Auth0 authentication error:', error);
      throw error;
    }
  }

  // User endpoints
  async getUserProfile() {
    return this.makeRequest('/users/profile');
  }

  async getUserDashboard() {
    return this.makeRequest('/users/dashboard');
  }

  async updateUserProfile(profileData) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getFavoriteStations() {
    return this.makeRequest('/users/favorites');
  }

  async addFavoriteStation(stationId) {
    return this.makeRequest('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ stationId }),
    });
  }

  async removeFavoriteStation(stationId) {
    return this.makeRequest(`/users/favorites/${stationId}`, {
      method: 'DELETE',
    });
  }

  // Station endpoints
  async getStations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/stations${queryString ? `?${queryString}` : ''}`);
  }

  async getNearbyStations(lat, lng, radius = 5, limit = 10) {
    return this.makeRequest(`/stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`);
  }

  async getStationById(stationId) {
    return this.makeRequest(`/stations/${stationId}`);
  }

  // Reservation endpoints
  async getUserReservations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/reservations${queryString ? `?${queryString}` : ''}`);
  }

  async createReservation(reservationData) {
    return this.makeRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async getReservationById(reservationId) {
    return this.makeRequest(`/reservations/${reservationId}`);
  }

  async updateReservation(reservationId, updateData) {
    return this.makeRequest(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async cancelReservation(reservationId) {
    return this.makeRequest(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  async startChargingSession(reservationId) {
    return this.makeRequest(`/reservations/${reservationId}/start`, {
      method: 'PATCH',
    });
  }

  async completeChargingSession(reservationId, sessionData) {
    return this.makeRequest(`/reservations/${reservationId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(sessionData),
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export default new ApiService(); 