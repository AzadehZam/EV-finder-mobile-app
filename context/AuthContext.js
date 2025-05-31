import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if we have a JWT token
      const token = await ApiService.getToken();
      if (token) {
        // Try to get user profile from backend
        try {
          const response = await ApiService.getUserProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token might be invalid, clear it
            await ApiService.removeToken();
            await AsyncStorage.removeItem('user');
          }
        } catch (error) {
          // Only log unexpected errors, not "User not found" which is normal for unauthenticated users
          if (!error.message.includes('User not found') && !error.message.includes('404')) {
            console.error('Error fetching user profile:', error);
          }
          // Token might be expired or user doesn't exist, clear it
          await ApiService.removeToken();
          await AsyncStorage.removeItem('user');
        }
      } else {
        // Fallback to local storage for backward compatibility
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithAuth0 = async (auth0UserInfo) => {
    try {
      setIsLoading(true);
      
      // Send Auth0 user info to backend
      const response = await ApiService.authenticateWithAuth0(auth0UserInfo);
      
      if (response.success) {
        const userData = response.data.user;
        
        // Store user data locally
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error during Auth0 login:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logout = async () => {
    try {
      // Clear backend token
      await ApiService.removeToken();
      
      // Clear local storage
      await AsyncStorage.removeItem('user');
      
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await ApiService.getUserProfile();
      if (response.success) {
        const userData = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
    return null;
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await ApiService.updateUserProfile(profileData);
      if (response.success) {
        const updatedUser = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    loginWithAuth0,
    logout,
    refreshUserData,
    updateUserProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 