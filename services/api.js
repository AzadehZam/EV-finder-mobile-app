import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment-based API URL
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.91:3000/api'  // Development - local IP
  : 'https://ev-finder-backend.onrender.com/api';  // Production - deployed backend

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
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('API request timeout:', endpoint);
        throw new Error('Request timeout - please check your connection');
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new Error('Network error - please check your connection');
      } else if (error.message === 'Access token required' || error.message.includes('401')) {
        // Don't log authentication errors as they're expected when not logged in
        throw error;
      } else {
        console.error('API request error:', error);
        throw error;
      }
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

  // New enhanced reservation methods
  async checkAvailability(stationId, connectorType, startTime, endTime) {
    const params = new URLSearchParams({
      stationId,
      connectorType,
      startTime,
      endTime
    });
    return this.makeRequest(`/reservations/availability?${params}`);
  }

  async getActiveReservations() {
    return this.makeRequest('/reservations/active');
  }

  async getReservationAnalytics(period = 30) {
    return this.makeRequest(`/reservations/analytics?period=${period}`);
  }

  async confirmReservation(reservationId) {
    return this.makeRequest(`/reservations/${reservationId}/confirm`, {
      method: 'PATCH',
    });
  }

  async getStationReservations(stationId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/reservations/station/${stationId}${queryString ? `?${queryString}` : ''}`);
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