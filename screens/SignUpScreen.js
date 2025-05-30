import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth0Config } from '../auth0-config';
import { useAuth } from '../context/AuthContext';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithAuth0 } = useAuth();

  // Auth0 configuration for Expo AuthSession
  const discovery = {
    authorizationEndpoint: `https://${auth0Config.domain}/authorize`,
    tokenEndpoint: `https://${auth0Config.domain}/oauth/token`,
    revocationEndpoint: `https://${auth0Config.domain}/oauth/revoke`,
  };

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0Config.clientId,
      scopes: ['openid', 'profile', 'email'],
      additionalParameters: {
        connection: 'google-oauth2', // Force Google authentication
      },
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthResponse(response);
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      Alert.alert(
        'Authentication Failed',
        'There was an error signing in with Google. Please try again.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  }, [response]);

  const handleAuthResponse = async (response) => {
    try {
      // Exchange the authorization code for tokens
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: auth0Config.clientId,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery
      );

      // Get user info from Auth0
      const userInfoResponse = await fetch(`https://${auth0Config.domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      // Use the new backend authentication
      const authResult = await loginWithAuth0(userInfo);

      if (authResult.success) {
        Alert.alert(
          'Welcome to EV Finder!',
          'You have successfully signed in with Google.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to main app screen (to be implemented)
                console.log('Navigate to main app');
                // navigation.navigate('MainApp');
              },
            },
          ]
        );
      } else {
        throw new Error(authResult.error || 'Backend authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert(
        'Authentication Failed',
        'There was an error completing the sign-in process. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert(
        'Authentication Failed',
        'There was an error starting the authentication process. Please try again.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToWelcome}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="ev-station" size={50} color="white" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to EV Finder</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Sign in to find charging stations, save your favorites, and get personalized recommendations
        </Text>

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={[styles.googleButton, (isLoading || !request) && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading || !request}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <MaterialIcons name="login" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secure authentication powered by Auth0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  googleButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
}); 