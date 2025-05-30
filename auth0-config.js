
import { Platform } from 'react-native';

export const auth0Config = {
  domain: 'dev-zrjqxip57a10h8fo.us.auth0.com',
  clientId: 'yfs6rraoJ69SpEu4wLmK0HEKt1hQ00io', 
};

// Get the current URL for web deployment
const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    // Web environment - check if window exists
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }
    // Fallback for web
    return 'http://localhost:19006';
  }
  // Mobile environment (iOS/Android)
  return 'exp://localhost:19000';
};

export const redirectUrl = getRedirectUrl();
