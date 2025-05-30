import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import ApiService from '../services/api';

export default function ReservationDetailsScreen({ navigation, route }) {
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReservationDetails();
  }, []);

  const fetchReservationDetails = async () => {
    try {
      const response = await ApiService.getReservationById(reservationId);
      if (response.success) {
        setReservation(response.data);
      } else {
        Alert.alert('Error', 'Failed to load reservation details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      Alert.alert('Error', 'Failed to load reservation details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await ApiService.cancelReservation(reservationId);
              if (response.success) {
                Alert.alert('Success', 'Reservation cancelled successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel reservation');
              }
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleStartCharging = async () => {
    try {
      setActionLoading(true);
      const response = await ApiService.startChargingSession(reservationId);
      if (response.success) {
        Alert.alert('Success', 'Charging session started!');
        fetchReservationDetails(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to start charging session');
      }
    } catch (error) {
      console.error('Error starting charging session:', error);
      Alert.alert('Error', 'Failed to start charging session. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
      case 'pending': return '#FF9800';
      case 'confirmed': return '#4CAF50';
      case 'active': return '#2196F3';
      case 'completed': return '#666';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'active': return 'flash-on';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed';
      case 'active': return 'Active Session';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reservation Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reservation Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>Reservation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isUpcoming = ['pending', 'confirmed'].includes(reservation.status) && new Date(reservation.startTime) > new Date();
  const canStart = reservation.status === 'confirmed' && new Date(reservation.startTime) <= new Date() && new Date(reservation.endTime) > new Date();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons 
              name={getStatusIcon(reservation.status)} 
              size={32} 
              color={getStatusColor(reservation.status)} 
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                {getStatusText(reservation.status)}
              </Text>
              <Text style={styles.reservationId}>ID: {reservation._id.slice(-8)}</Text>
            </View>
            <Text style={styles.costText}>${reservation.estimatedCost?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {/* Station Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Charging Station</Text>
          <View style={styles.stationInfo}>
            <MaterialIcons name="ev-station" size={24} color="#4CAF50" />
            <View style={styles.stationDetails}>
              <Text style={styles.stationName}>{reservation.stationId?.name || 'Unknown Station'}</Text>
              <Text style={styles.stationAddress}>{reservation.stationId?.address || 'Address not available'}</Text>
            </View>
          </View>
        </View>

        {/* Reservation Details */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Reservation Details</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(reservation.startTime)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="ev-station" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Connector Type</Text>
              <Text style={styles.detailValue}>{reservation.connectorType}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Estimated Cost</Text>
              <Text style={styles.detailValue}>${reservation.estimatedCost?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        {reservation.vehicleInfo && (reservation.vehicleInfo.make || reservation.vehicleInfo.model) && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Vehicle Information</Text>
            
            {(reservation.vehicleInfo.make || reservation.vehicleInfo.model) && (
              <View style={styles.detailRow}>
                <MaterialIcons name="directions-car" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Vehicle</Text>
                  <Text style={styles.detailValue}>
                    {reservation.vehicleInfo.make} {reservation.vehicleInfo.model}
                  </Text>
                </View>
              </View>
            )}

            {reservation.vehicleInfo.batteryCapacity && (
              <View style={styles.detailRow}>
                <MaterialIcons name="battery-charging-full" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Battery Capacity</Text>
                  <Text style={styles.detailValue}>{reservation.vehicleInfo.batteryCapacity} kWh</Text>
                </View>
              </View>
            )}

            {reservation.vehicleInfo.currentCharge && (
              <View style={styles.detailRow}>
                <MaterialIcons name="battery-std" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Current Charge</Text>
                  <Text style={styles.detailValue}>{reservation.vehicleInfo.currentCharge}%</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {reservation.notes && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{reservation.notes}</Text>
          </View>
        )}

        {/* Booking Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Booking Information</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Booked On</Text>
              <Text style={styles.detailValue}>
                {new Date(reservation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(isUpcoming || canStart) && (
        <View style={styles.actionContainer}>
          {canStart && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartCharging}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="flash-on" size={20} color="white" />
              )}
              <Text style={styles.actionButtonText}>Start Charging</Text>
            </TouchableOpacity>
          )}
          
          {isUpcoming && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelReservation}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <MaterialIcons name="cancel" size={20} color="#F44336" />
              )}
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel Reservation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#F44336',
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  reservationId: {
    fontSize: 12,
    color: '#666',
  },
  costText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#F44336',
  },
}); 