import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';

export default function DashboardScreen() {
  const { user, logout, refreshUserData } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await ApiService.getUserDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        console.error('Failed to load dashboard data:', response.message);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshUserData(),
        loadDashboardData()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleFindStations = async () => {
    try {
      // Example: Get nearby stations
      const response = await ApiService.getNearbyStations(37.7749, -122.4194, 10, 20);
      if (response.success) {
        console.log('Nearby stations:', response.data);
        // Navigate to stations list or map view
        Alert.alert('Success', `Found ${response.data.length} nearby stations!`);
      }
    } catch (error) {
      console.error('Error finding stations:', error);
      Alert.alert('Error', 'Failed to find nearby stations. Please try again.');
    }
  };

  const handleViewReservations = async () => {
    try {
      const response = await ApiService.getUserReservations({ limit: 10 });
      if (response.success) {
        console.log('User reservations:', response.data);
        // Navigate to reservations screen
        Alert.alert('Reservations', `You have ${response.data.length} reservations.`);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations. Please try again.');
    }
  };

  const handleViewFavorites = async () => {
    try {
      const response = await ApiService.getFavoriteStations();
      if (response.success) {
        console.log('Favorite stations:', response.data);
        // Navigate to favorites screen
        Alert.alert('Favorites', `You have ${response.data.length} favorite stations.`);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Failed to load favorite stations. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statistics = dashboardData?.statistics || {
    totalReservations: 0,
    activeReservations: 0,
    completedReservations: 0,
    favoriteStations: 0
  };

  const recentReservations = dashboardData?.recentReservations || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ 
                uri: user?.picture || 'https://via.placeholder.com/50x50.png?text=User'
              }}
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons name="ev-station" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{statistics.favoriteStations}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="bookmark" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>{statistics.activeReservations}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons name="history" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{statistics.completedReservations}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="assessment" size={24} color="#9C27B0" />
              <Text style={styles.statNumber}>{statistics.totalReservations}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleFindStations}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="search" size={28} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Find Stations</Text>
              <Text style={styles.actionSubtitle}>Discover nearby charging stations</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewReservations}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="event" size={28} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Reservations</Text>
              <Text style={styles.actionSubtitle}>View and manage your bookings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewFavorites}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="favorite" size={28} color="#E91E63" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Favorite Stations</Text>
              <Text style={styles.actionSubtitle}>Quick access to saved stations</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        {recentReservations.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentReservations.slice(0, 3).map((reservation, index) => (
              <View key={reservation._id || index} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <MaterialIcons 
                    name={reservation.status === 'completed' ? 'check-circle' : 'schedule'} 
                    size={20} 
                    color={reservation.status === 'completed' ? '#4CAF50' : '#FF9800'} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {reservation.stationId?.name || 'Charging Station'}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {reservation.status === 'completed' ? 'Completed' : 'Upcoming'} • {reservation.connectorType}
                  </Text>
                </View>
                <Text style={styles.activityTime}>
                  {new Date(reservation.startTime).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  recentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
}); 