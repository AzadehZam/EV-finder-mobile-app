# EV Finder

**Your EV Charging Companion**

A React Native mobile application built with Expo to help electric vehicle owners find charging stations near them.

## Features

- 🔋 Find EV charging stations
- 📍 Location-based search
- 🚗 EV charging companion
- 📱 Cross-platform (iOS & Android)
- 🔐 Secure Google authentication with Auth0
- 👤 Personalized user dashboard
- 📊 User statistics and activity tracking
- ⭐ Favorites system
- 🔄 Persistent authentication state

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)
- Auth0 account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd EVFinder
```

2. Install dependencies:
```bash
npm install
```

3. Set up Auth0 authentication:
   - Follow the detailed guide in `AUTH0_SETUP.md`
   - Update `auth0-config.js` with your Auth0 credentials

4. Start the development server:
```bash
npx expo start
```

5. Scan the QR code with Expo Go app on your mobile device

### Available Scripts

- `npx expo start` - Start the Expo development server
- `npx expo run:android` - Run on Android device/emulator
- `npx expo run:ios` - Run on iOS device/simulator
- `npx expo start --web` - Run in web browser

## Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and tools
- **@expo/vector-icons** - Icon library (MaterialIcons)
- **React Navigation** - Navigation library (Stack Navigator)
- **Auth0 with Expo AuthSession** - Authentication and authorization
- **AsyncStorage** - Local data persistence
- **Expo AuthSession** - OAuth flow for Expo Go compatibility

## Project Structure

```
EVFinder/
├── App.js                    # Main app component with conditional navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
├── auth0-config.js           # Auth0 configuration
├── AUTH0_SETUP.md           # Auth0 setup guide
├── screens/                  # App screens
│   ├── WelcomeScreen.js     # Welcome/onboarding screen
│   ├── SignUpScreen.js      # Authentication screen
│   └── DashboardScreen.js   # Main user dashboard
├── context/                  # React contexts
│   └── AuthContext.js       # Authentication state management
├── assets/                   # Images, icons, and other assets
└── README.md                # Project documentation
```

## Current Status

✅ **Welcome Screen** - Complete
- App icon with EV charging station symbol
- App title and subtitle
- Decorative progress indicators
- "Get Started" button with green theme

✅ **Authentication System** - Complete
- Auth0 integration with Google sign-in
- Secure user authentication
- User session management
- Authentication state persistence with AsyncStorage
- Loading states and error handling

✅ **Dashboard Screen** - Complete
- Personalized welcome message with user's name
- User avatar from Google profile
- Statistics cards (Stations Found, Favorites, Recent)
- Action cards for main features
- Recent Activity section
- Sign Out functionality

✅ **Navigation Flow** - Complete
- Conditional navigation based on authentication state
- Stack navigation between screens
- Proper loading states
- Seamless authentication flow

🚧 **Upcoming Features**
- Charging station map integration
- Real charging station data
- Search and filter functionality
- Detailed station information
- Reviews and ratings
- Favorites management
- User preferences and settings

## Authentication Setup

The app uses Auth0 for secure authentication with Google sign-in. To set up authentication:

1. **Read the setup guide**: Check `AUTH0_SETUP.md` for detailed instructions
2. **Create Auth0 account**: Sign up at [auth0.com](https://auth0.com)
3. **Configure application**: Set up a Single Page Application (SPA) in Auth0 for Expo Go compatibility
4. **Enable Google**: Configure Google social connection
5. **Update config**: Add your credentials to `auth0-config.js`
6. **Set callback URLs**: Configure proper callback URLs for Expo

### Auth0 Configuration

Update `auth0-config.js` with your actual Auth0 credentials:

```javascript
export const auth0Config = {
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id',
};
```

### Important: Expo Go Compatibility

This app is configured to work with Expo Go using:
- **Single Page Application (SPA)** type in Auth0 (not Native)
- **Expo AuthSession** for web-based OAuth flow
- **Proper callback URLs** including Expo proxy URLs

## Design

The app follows a clean, modern design with:
- **Primary Color**: Green (#4CAF50) - representing eco-friendly electric vehicles
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Centered content with proper spacing and shadows
- **Icons**: Material Design icons for consistency
- **Cards**: Modern card-based UI with subtle shadows
- **Authentication**: Secure and user-friendly sign-in flow

## Navigation Flow

1. **Welcome Screen** → User sees app introduction and taps "Get Started"
2. **Sign Up Screen** → User authenticates with Google via Auth0
3. **Dashboard Screen** → Personalized dashboard with user info and app features
4. **Sign Out** → Returns to Welcome screen

## Security Features

- 🔐 OAuth 2.0 authentication with Auth0
- 🛡️ Secure token storage with AsyncStorage
- 🔄 Automatic token refresh
- 📱 Device-specific security
- 🚫 No password storage required
- 🌐 Web-based OAuth flow for Expo Go compatibility

## App Features

### Dashboard Screen
- **Personalized Greeting**: Shows user's name from Google account
- **User Avatar**: Displays profile picture from Google
- **Statistics Cards**: 
  - Stations Found: 0 (placeholder)
  - Favorites: 0 (placeholder)
  - Recent: 0 (placeholder)
- **Action Cards**:
  - Find Charging Stations
  - My Favorites
  - Profile & Settings
- **Recent Activity**: Empty state with placeholder
- **Sign Out**: Secure logout functionality

### Authentication Context
- Global authentication state management
- Persistent login sessions
- Loading states during authentication
- Error handling for auth failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including authentication flow)
5. Submit a pull request

## Testing

To test the app:
1. Start the development server: `npx expo start`
2. Open Expo Go on your mobile device
3. Scan the QR code
4. Test the complete authentication flow
5. Verify dashboard functionality

## License

This project is licensed under the MIT License. 