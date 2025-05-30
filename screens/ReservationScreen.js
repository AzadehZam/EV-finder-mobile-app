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
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import ApiService from '../services/api';

export default function ReservationScreen({ navigation, route }) {
  const { charger } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedDuration, setSelectedDuration] = useState('1 hour');
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  
  // Vehicle information
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    batteryCapacity: '',
    currentCharge: ''
  });
  const [notes, setNotes] = useState('');

  // Initialize with a valid time slot
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Find the next available time slot
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];
    
    const availableSlot = timeSlots.find(timeSlot => {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      return slotTime > now;
    });
    
    if (availableSlot) {
      setSelectedTime(availableSlot);
    }
  }, []);

  // Check availability when time selection changes
  useEffect(() => {
    if (selectedDate && selectedTime && selectedDuration) {
      checkAvailability();
    }
  }, [selectedDate, selectedTime, selectedDuration]);

  const checkAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      const durationMinutes = getDurationInMinutes(selectedDuration);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      
      // Use the first available connector type for availability check
      const connectorType = charger.connectorTypes?.[0]?.type || 'CCS';
      
      const response = await ApiService.checkAvailability(
        charger._id || charger.id,
        connectorType,
        startTime.toISOString(),
        endTime.toISOString()
      );
      
      if (response.success) {
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const getDurationInMinutes = (duration) => {
    switch (duration) {
      case '30 min': return 30;
      case '1 hour': return 60;
      case '2 hours': return 120;
      case '3 hours': return 180;
      case '4 hours': return 240;
      default: return 60;
    }
  };

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const durations = ['30 min', '1 hour', '2 hours', '3 hours', '4 hours'];

  const formatDate = (date) => {
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
        day: 'numeric' 
      });
    }
  };

  // Check if a time slot is in the past for the selected date
  const isTimeSlotPast = (timeSlot, selectedDate) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    // If selected date is not today, time is not in the past
    if (selectedDateOnly.getTime() !== today.getTime()) {
      return false;
    }
    
    // If it's today, check if the time has passed
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    return slotTime <= now;
  };

  // Get available time slots for the selected date
  const getAvailableTimeSlots = () => {
    return timeSlots.filter(timeSlot => !isTimeSlotPast(timeSlot, selectedDate));
  };

  // Validate if current selection is valid
  const isCurrentSelectionValid = () => {
    return !isTimeSlotPast(selectedTime, selectedDate) && 
           (availability?.isAvailable !== false);
  };

  const handleReservation = async () => {
    // Validate before confirming reservation
    if (!isCurrentSelectionValid()) {
      Alert.alert(
        'Invalid Selection',
        'The selected time has already passed or is not available. Please choose a different time slot.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!availability?.isAvailable) {
      Alert.alert(
        'Not Available',
        'This time slot is not available. Please choose a different time.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      const durationMinutes = getDurationInMinutes(selectedDuration);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      
      // Use the first available connector type
      const connectorType = charger.connectorTypes?.[0]?.type || 'CCS';
      
      const reservationData = {
        stationId: charger._id || charger.id,
        connectorType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: notes.trim() || undefined
      };

      // Add vehicle info if provided
      if (vehicleInfo.make || vehicleInfo.model || vehicleInfo.batteryCapacity || vehicleInfo.currentCharge) {
        reservationData.vehicleInfo = {};
        if (vehicleInfo.make) reservationData.vehicleInfo.make = vehicleInfo.make;
        if (vehicleInfo.model) reservationData.vehicleInfo.model = vehicleInfo.model;
        if (vehicleInfo.batteryCapacity) reservationData.vehicleInfo.batteryCapacity = parseFloat(vehicleInfo.batteryCapacity);
        if (vehicleInfo.currentCharge) reservationData.vehicleInfo.currentCharge = parseFloat(vehicleInfo.currentCharge);
      }

      const response = await ApiService.createReservation(reservationData);
      
      if (response.success) {
        Alert.alert(
          'Reservation Confirmed!',
          `Your charging session at ${charger.name} has been reserved for ${formatDate(selectedDate)} at ${selectedTime} for ${selectedDuration}.`,
          [
            {
              text: 'View Reservations',
              onPress: () => {
                navigation.navigate('Reservations');
              }
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(
          'Reservation Failed',
          response.message || 'Failed to create reservation. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert(
        'Error',
        'Failed to create reservation. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection and update time if needed
  const handleDateSelection = (date) => {
    setSelectedDate(date);
    
    // If the selected time is now in the past for the new date, reset to first available time
    if (isTimeSlotPast(selectedTime, date)) {
      const availableSlots = timeSlots.filter(timeSlot => !isTimeSlotPast(timeSlot, date));
      if (availableSlots.length > 0) {
        setSelectedTime(availableSlots[0]);
      }
    }
  };

  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return '#4CAF50';
    if (ratio > 0.2) return '#FF9800';
    return '#F44336';
  };

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
        <Text style={styles.headerTitle}>Reserve Charger</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Charger Info Card */}
        <View style={styles.chargerCard}>
          <View style={styles.chargerHeader}>
            <View style={styles.chargerInfo}>
              <Text style={styles.chargerName}>{charger.name}</Text>
              <Text style={styles.chargerDistance}>{charger.calculatedDistance}</Text>
            </View>
            <View style={styles.availabilityContainer}>
              <View style={[
                styles.availabilityDot,
                { backgroundColor: getAvailabilityColor(charger.available || charger.availablePorts, charger.total || charger.totalPorts) }
              ]} />
              <Text style={styles.availabilityText}>
                {charger.available || charger.availablePorts}/{charger.total || charger.totalPorts} available
              </Text>
            </View>
          </View>
          
          <Text style={styles.chargerAddress}>{charger.address}</Text>
          
          <View style={styles.chargerDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="flash-on" size={16} color="#666" />
              <Text style={styles.detailText}>{charger.type || charger.connectorTypes?.[0]?.type}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="speed" size={16} color="#666" />
              <Text style={styles.detailText}>{charger.power || charger.connectorTypes?.[0]?.power + 'kW'}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="attach-money" size={16} color="#666" />
              <Text style={styles.detailText}>{charger.price || '$0.25/kWh'}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Vehicle Information (Optional)</Text>
          <View style={styles.vehicleForm}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Make</Text>
                <TextInput
                  style={styles.textInput}
                  value={vehicleInfo.make}
                  onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, make: text }))}
                  placeholder="Tesla, BMW, etc."
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Model</Text>
                <TextInput
                  style={styles.textInput}
                  value={vehicleInfo.model}
                  onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, model: text }))}
                  placeholder="Model 3, i3, etc."
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Battery Capacity (kWh)</Text>
                <TextInput
                  style={styles.textInput}
                  value={vehicleInfo.batteryCapacity}
                  onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, batteryCapacity: text }))}
                  placeholder="75"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Charge (%)</Text>
                <TextInput
                  style={styles.textInput}
                  value={vehicleInfo.currentCharge}
                  onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, currentCharge: text }))}
                  placeholder="20"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special requirements or notes..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {getNextDays().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  selectedDate.toDateString() === date.toDateString() && styles.selectedDateCard
                ]}
                onPress={() => handleDateSelection(date)}
              >
                <Text style={[
                  styles.dateText,
                  selectedDate.toDateString() === date.toDateString() && styles.selectedDateText
                ]}>
                  {formatDate(date)}
                </Text>
                <Text style={[
                  styles.dayText,
                  selectedDate.toDateString() === date.toDateString() && styles.selectedDayText
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => {
              const isPast = isTimeSlotPast(time, selectedDate);
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeCard,
                    selectedTime === time && styles.selectedTimeCard,
                    isPast && styles.disabledTimeCard
                  ]}
                  onPress={() => !isPast && setSelectedTime(time)}
                  disabled={isPast}
                >
                  <Text style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                    isPast && styles.disabledTimeText
                  ]}>
                    {time}
                  </Text>
                  {isPast && <Text style={styles.pastLabel}>Past</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Duration</Text>
          <View style={styles.durationGrid}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationCard,
                  selectedDuration === duration && styles.selectedDurationCard
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Text style={[
                  styles.durationText,
                  selectedDuration === duration && styles.selectedDurationText
                ]}>
                  {duration}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Availability Status */}
        {availabilityLoading ? (
          <View style={styles.availabilityStatus}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.availabilityText}>Checking availability...</Text>
          </View>
        ) : availability && (
          <View style={styles.availabilityStatus}>
            <MaterialIcons 
              name={availability.isAvailable ? "check-circle" : "cancel"} 
              size={20} 
              color={availability.isAvailable ? "#4CAF50" : "#F44336"} 
            />
            <Text style={[
              styles.availabilityText,
              { color: availability.isAvailable ? "#4CAF50" : "#F44336" }
            ]}>
              {availability.isAvailable 
                ? `Available (${availability.availableConnectors} of ${availability.totalConnectors} connectors)`
                : `Not available (${availability.reservedConnectors} of ${availability.totalConnectors} reserved)`
              }
            </Text>
          </View>
        )}

        {/* Reservation Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Reservation Summary</Text>
          
          <View style={styles.summaryRow}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.summaryText}>{charger.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.summaryText}>{formatDate(selectedDate)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.summaryText}>{selectedTime} for {selectedDuration}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <MaterialIcons name="ev-station" size={16} color="#666" />
            <Text style={styles.summaryText}>{charger.connectorTypes?.[0]?.type || 'CCS'}</Text>
          </View>

          {!isCurrentSelectionValid() && (
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.warningText}>
                {!availability?.isAvailable ? 'Time slot not available' : 'Selected time has passed'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reserve Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.reserveButton,
            (!isCurrentSelectionValid() || loading) && styles.disabledReserveButton
          ]}
          onPress={handleReservation}
          disabled={!isCurrentSelectionValid() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="event-available" size={24} color="white" />
          )}
          <Text style={[
            styles.reserveButtonText,
            (!isCurrentSelectionValid() || loading) && styles.disabledReserveButtonText
          ]}>
            {loading ? 'Creating Reservation...' : 'Reserve Now'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  chargerCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chargerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chargerInfo: {
    flex: 1,
  },
  chargerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chargerDistance: {
    fontSize: 14,
    color: '#666',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: '#666',
  },
  chargerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  chargerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateCard: {
    backgroundColor: '#4CAF50',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedDateText: {
    color: 'white',
  },
  dayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 70,
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
  selectedTimeCard: {
    backgroundColor: '#4CAF50',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedTimeText: {
    color: 'white',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
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
  selectedDurationCard: {
    backgroundColor: '#4CAF50',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedDurationText: {
    color: 'white',
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reserveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  disabledTimeCard: {
    backgroundColor: '#f0f0f0',
  },
  disabledTimeText: {
    color: '#999',
  },
  pastLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  invalidSummaryText: {
    color: '#FF6B6B',
  },
  disabledReserveButton: {
    backgroundColor: '#f0f0f0',
  },
  disabledReserveButtonText: {
    color: '#999',
  },
  vehicleForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
}); 