import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../services/api';

export default function ReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Filter reservations based on status
  const upcomingReservations = reservations.filter(r => 
    ['pending', 'confirmed'].includes(r.status) && new Date(r.startTime) > new Date()
  );
  const activeReservations = reservations.filter(r => r.status === 'active');
  const pastReservations = reservations.filter(r => 
    ['completed', 'cancelled'].includes(r.status) || 
    (r.status === 'confirmed' && new Date(r.endTime) < new Date())
  );

  // Combine active and upcoming for the "upcoming" tab
  const upcomingTabData = [...activeReservations, ...upcomingReservations];

  const fetchReservations = async () => {
    try {
      setError(null);
      const response = await ApiService.getUserReservations();
      if (response.success) {
        setReservations(response.data);
      } else {
        setError(response.message || 'Failed to fetch reservations');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  // Fetch reservations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  const handleCancelReservation = async (reservationId, reservationName) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your reservation at ${reservationName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.cancelReservation(reservationId);
              if (response.success) {
                Alert.alert('Success', 'Reservation cancelled successfully');
                fetchReservations(); // Refresh the list
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel reservation');
              }
            } catch (err) {
              console.error('Error cancelling reservation:', err);
              Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleModifyReservation = (reservation) => {
    // Navigate to a modify reservation screen (you can implement this)
    Alert.alert(
      'Modify Reservation',
      'Modification feature coming soon! For now, you can cancel and create a new reservation.',
      [
        { text: 'OK' },
        {
          text: 'Cancel & Rebook',
          onPress: () => {
            handleCancelReservation(reservation._id, reservation.stationId?.name);
          }
        }
      ]
    );
  };

  const handleStartCharging = async (reservationId, reservationName) => {
    Alert.alert(
      'Start Charging',
      `Start your charging session at ${reservationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              const response = await ApiService.startChargingSession(reservationId);
              if (response.success) {
                Alert.alert('Success', 'Charging session started!');
                fetchReservations(); // Refresh the list
              } else {
                Alert.alert('Error', response.message || 'Failed to start charging session');
              }
            } catch (err) {
              console.error('Error starting charging session:', err);
              Alert.alert('Error', 'Failed to start charging session. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#4CAF50';
      case 'active':
        return '#2196F3';
      case 'completed':
        return '#666';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'confirmed':
        return 'check-circle';
      case 'active':
        return 'flash-on';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderReservationCard = ({ item }) => {
    const isUpcoming = ['pending', 'confirmed'].includes(item.status) && new Date(item.startTime) > new Date();
    const isActive = item.status === 'active';
    const canStart = item.status === 'confirmed' && new Date(item.startTime) <= new Date() && new Date(item.endTime) > new Date();

    return (
      <TouchableOpacity 
        style={styles.reservationCard}
        onPress={() => navigation.navigate('ReservationDetails', { reservationId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <MaterialIcons 
              name={getStatusIcon(item.status)} 
              size={20} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={styles.costText}>${item.estimatedCost?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.chargerInfo}>
            <MaterialIcons name="ev-station" size={24} color="#4CAF50" />
            <View style={styles.chargerDetails}>
              <Text style={styles.chargerName}>{item.stationId?.name || 'Unknown Station'}</Text>
              <Text style={styles.chargerAddress}>{item.stationId?.address || 'Address not available'}</Text>
              <Text style={styles.chargerType}>{item.connectorType}</Text>
            </View>
          </View>

          <View style={styles.reservationDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={16} color="#666" />
              <Text style={styles.detailText}>{formatDate(item.startTime)}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </Text>
            </View>
            {item.vehicleInfo?.make && (
              <View style={styles.detailRow}>
                <MaterialIcons name="directions-car" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {item.vehicleInfo.make} {item.vehicleInfo.model}
                </Text>
              </View>
            )}
          </View>
        </View>

        {(isUpcoming || isActive || canStart) && (
          <View style={styles.cardActions}>
            {canStart && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStartCharging(item._id, item.stationId?.name)}
              >
                <Text style={styles.actionButtonText}>Start Charging</Text>
              </TouchableOpacity>
            )}
            {isUpcoming && (
              <>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleModifyReservation(item)}
                >
                  <Text style={styles.actionButtonText}>Modify</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancelReservation(item._id, item.stationId?.name)}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={type === 'upcoming' ? 'schedule' : 'history'} 
        size={64} 
        color="#ccc" 
      />
      <Text style={styles.emptyStateTitle}>
        No {type} reservations
      </Text>
      <Text style={styles.emptyStateText}>
        {type === 'upcoming' 
          ? 'Book your first charging session to get started!'
          : 'Your completed reservations will appear here.'
        }
      </Text>
      {type === 'upcoming' && (
        <TouchableOpacity 
          style={styles.findChargersButton}
          onPress={() => navigation.navigate('ChargerFinder')}
        >
          <Text style={styles.findChargersButtonText}>Find Chargers</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="error-outline" size={64} color="#F44336" />
      <Text style={styles.emptyStateTitle}>Error Loading Reservations</Text>
      <Text style={styles.emptyStateText}>{error}</Text>
      <TouchableOpacity 
        style={styles.findChargersButton}
        onPress={fetchReservations}
      >
        <Text style={styles.findChargersButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Reservations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading reservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reservations</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingTabData.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past ({pastReservations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reservations List */}
      <View style={styles.content}>
        {error ? (
          renderErrorState()
        ) : activeTab === 'upcoming' ? (
          upcomingTabData.length > 0 ? (
            <FlatList
              data={upcomingTabData}
              renderItem={renderReservationCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4CAF50']}
                />
              }
            />
          ) : (
            renderEmptyState('upcoming')
          )
        ) : (
          pastReservations.length > 0 ? (
            <FlatList
              data={pastReservations}
              renderItem={renderReservationCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4CAF50']}
                />
              }
            />
          ) : (
            renderEmptyState('past')
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  reservationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  costText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cardContent: {
    marginBottom: 16,
  },
  chargerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chargerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  chargerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chargerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chargerType: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  reservationDetails: {
    paddingLeft: 36,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  findChargersButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  findChargersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
}); 