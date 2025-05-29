import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation will automatically redirect to Welcome screen due to auth state change
  };

  const handleFindStations = () => {
    // TODO: Navigate to charging stations map
    console.log('Navigate to charging stations');
  };

  const handleMyFavorites = () => {
    // TODO: Navigate to favorites
    console.log('Navigate to favorites');
  };

  const handleProfile = () => {
    // TODO: Navigate to profile settings
    console.log('Navigate to profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.userName}>{user?.name || 'EV Driver'}</Text>
            <Text style={styles.subtitle}>Ready to find charging stations?</Text>
          </View>
          
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            {user?.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={40} color="#4CAF50" />
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="ev-station" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Stations Found</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="history" size={24} color="#4ECDC4" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleFindStations}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="search" size={28} color="white" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Find Charging Stations</Text>
              <Text style={styles.actionDescription}>Discover nearby EV charging points</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleMyFavorites}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B' }]}>
              <MaterialIcons name="favorite" size={28} color="white" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Favorites</Text>
              <Text style={styles.actionDescription}>Quick access to saved stations</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleProfile}>
            <View style={[styles.actionIcon, { backgroundColor: '#4ECDC4' }]}>
              <MaterialIcons name="settings" size={28} color="white" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Profile & Settings</Text>
              <Text style={styles.actionDescription}>Manage your account preferences</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>Start exploring charging stations!</Text>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
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
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  recentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B6B',
    marginLeft: 8,
  },
}); 