import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import ChargerFinderScreen from './screens/ChargerFinderScreen';
import ReservationScreen from './screens/ReservationScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReservationsScreen from './screens/ReservationsScreen';
import { ActivityIndicator, View, Platform } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'ChargerFinder') {
            iconName = 'ev-station';
          } else if (route.name === 'Reservations') {
            iconName = 'schedule';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 70,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 5 : 0,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      })}
    >
      <Tab.Screen 
        name="ChargerFinder" 
        component={ChargerFinderScreen}
        options={{
          tabBarLabel: 'Find Chargers',
        }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationsScreen}
        options={{
          tabBarLabel: 'Reservations',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide the default header for all screens
        }}
      >
        {user ? (
          // User is authenticated - show Main Tab Navigator and other screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Reservation" component={ReservationScreen} />
          </>
        ) : (
          // User is not authenticated - show auth flow
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
