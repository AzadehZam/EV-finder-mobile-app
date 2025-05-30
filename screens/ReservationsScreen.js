import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

export default function ReservationsScreen({ navigation }) {
  // Mock reservation data - in a real app, this would come from an API
  const [reservations] = useState([
    {
      id: '1',
      chargerName: 'Coquitlam Centre Mall',
      address: '2929 Barnet Hwy, Coquitlam, BC',
      date: '2024-01-15',
      time: '14:00',
      duration: '2 hours',
      status: 'upcoming',
      chargerType: 'Level 2',
      cost: '$8.50',
    },
    {
      id: '2',
      chargerName: 'Metrotown Shopping Centre',
      address: '4700 Kingsway, Burnaby, BC',
      date: '2024-01-12',
      time: '10:30',
      duration: '1.5 hours',
      status: 'completed',
      chargerType: 'DC Fast',
      cost: '$12.75',
    },
    {
      id: '3',
      chargerName: 'Square One Shopping Centre',
      address: '100 City Centre Dr, Mississauga, ON',
      date: '2024-01-10',
      time: '16:00',
      duration: '1 hour',
      status: 'completed',
      chargerType: 'Level 2',
      cost: '$4.25',
    },
  ]);

  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingReservations = reservations.filter(r => r.status === 'upcoming');
  const pastReservations = reservations.filter(r => r.status === 'completed');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#4CAF50';
      case 'completed':
        return '#666';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return 'schedule';
      case 'completed':
        return 'check-circle';
      default:
        return 'info';
    }
  };

  const renderReservationCard = ({ item }) => (
    <TouchableOpacity style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.statusContainer}>
          <MaterialIcons 
            name={getStatusIcon(item.status)} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </Text>
        </View>
        <Text style={styles.costText}>{item.cost}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.chargerInfo}>
          <MaterialIcons name="ev-station" size={24} color="#4CAF50" />
          <View style={styles.chargerDetails}>
            <Text style={styles.chargerName}>{item.chargerName}</Text>
            <Text style={styles.chargerAddress}>{item.address}</Text>
            <Text style={styles.chargerType}>{item.chargerType}</Text>
          </View>
        </View>

        <View style={styles.reservationDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="timer" size={16} color="#666" />
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
        </View>
      </View>

      {item.status === 'upcoming' && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Modify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

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
            Upcoming ({upcomingReservations.length})
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
        {activeTab === 'upcoming' ? (
          upcomingReservations.length > 0 ? (
            <FlatList
              data={upcomingReservations}
              renderItem={renderReservationCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            renderEmptyState('upcoming')
          )
        ) : (
          pastReservations.length > 0 ? (
            <FlatList
              data={pastReservations}
              renderItem={renderReservationCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
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
}); 