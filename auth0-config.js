// Auth0 Configuration
// 
// To set up Auth0 for your EV Finder app:
// 
// 1. Go to https://auth0.com and create a free account
// 2. Create a new application:
//    - Choose "Native" as the application type
//    - Name it "EV Finder Mobile App"
// 
// 3. Configure your application:
//    - Go to Settings tab
//    - Copy your Domain and Client ID
//    - Replace the values below
// 
// 4. Configure Allowed Callback URLs:
//    - Add: com.evfinder.app://dev-YOUR_DOMAIN.us.auth0.com/ios/com.evfinder.app/callback
//    - Add: com.evfinder.app://dev-YOUR_DOMAIN.us.auth0.com/android/com.evfinder.app/callback
// 
// 5. Configure Allowed Logout URLs:
//    - Add: com.evfinder.app://dev-YOUR_DOMAIN.us.auth0.com/ios/com.evfinder.app/callback
//    - Add: com.evfinder.app://dev-YOUR_DOMAIN.us.auth0.com/android/com.evfinder.app/callback
// 
// 6. Enable Google Social Connection:
//    - Go to Authentication > Social
//    - Enable Google
//    - Configure with your Google OAuth credentials
// 
// 7. Update the values below with your actual Auth0 credentials:

export const auth0Config = {
  domain: 'dev-zrjqxip57a10h8fo.us.auth0.com', // e.g., 'dev-abc123.us.auth0.com'
  clientId: 'yfs6rraoJ69SpEu4wLmK0HEKt1hQ00io', // e.g., 'abc123def456ghi789'
};

// Example of what your actual config should look like:
// export const auth0Config = {
//   domain: 'dev-abc123.us.auth0.com',
//   clientId: 'abc123def456ghi789jkl012',
// }; 