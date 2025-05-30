// Auth0 Configuration
// 
// To set up Auth0 for your EV Finder app:
// 
// 1. Go to https://auth0.com and create a free account
// 2. Create a new application:
//    - Choose "Single Page Application" as the application type (for web compatibility)
//    - Name it "EV Finder Mobile App"
// 
// 3. Configure your application:
//    - Go to Settings tab
//    - Copy your Domain and Client ID
//    - Replace the values below
// 
// 4. Configure Allowed Callback URLs (add ALL of these):
//    - https://gregarious-mochi-7bf99a.netlify.app
//    - http://localhost:19006
//    - https://localhost:19006
//    - exp://localhost:19000
//    - exp://127.0.0.1:19000
//    - com.evfinder.app://dev-zrjqxip57a10h8fo.us.auth0.com/ios/com.evfinder.app/callback
//    - com.evfinder.app://dev-zrjqxip57a10h8fo.us.auth0.com/android/com.evfinder.app/callback
// 
// 5. Configure Allowed Logout URLs (add ALL of these):
//    - https://gregarious-mochi-7bf99a.netlify.app
//    - http://localhost:19006
//    - https://localhost:19006
//    - exp://localhost:19000
//    - exp://127.0.0.1:19000
//    - com.evfinder.app://dev-zrjqxip57a10h8fo.us.auth0.com/ios/com.evfinder.app/callback
//    - com.evfinder.app://dev-zrjqxip57a10h8fo.us.auth0.com/android/com.evfinder.app/callback
// 
// 6. Configure Allowed Web Origins (add these):
//    - https://gregarious-mochi-7bf99a.netlify.app
//    - http://localhost:19006
//    - https://localhost:19006
// 
// 7. Enable Google Social Connection:
//    - Go to Authentication > Social
//    - Enable Google
//    - Configure with your Google OAuth credentials
// 
// 8. Update the values below with your actual Auth0 credentials:

import { Platform } from 'react-native';

export const auth0Config = {
  domain: 'dev-zrjqxip57a10h8fo.us.auth0.com', // e.g., 'dev-abc123.us.auth0.com'
  clientId: 'yfs6rraoJ69SpEu4wLmK0HEKt1hQ00io', // e.g., 'abc123def456ghi789'
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

// Example of what your actual config should look like:
// export const auth0Config = {
//   domain: 'dev-abc123.us.auth0.com',
//   clientId: 'abc123def456ghi789jkl012',
// }; 