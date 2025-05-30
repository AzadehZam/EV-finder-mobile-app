import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  // Convert to miles and format
  const miles = distance * 0.621371;
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`; // Show in feet if less than 1 mile
  } else {
    return `${miles.toFixed(1)} mi`;
  }
};

// Sample charging stations data for Vancouver area and Toronto area
const SAMPLE_CHARGERS = [
  // Vancouver area - Coquitlam
  {
    id: '1',
    name: 'Coquitlam Centre ChargePoint',
    address: '2929 Barnet Hwy, Coquitlam, BC',
    type: 'DC Fast Charging',
    power: '150 kW',
    available: 3,
    total: 4,
    price: '$0.35/kWh',
    coordinate: {
      latitude: 49.2781,
      longitude: -122.7912,
    },
  },
  {
    id: '2',
    name: 'Burnaby Heights EV Station',
    address: '4567 Hastings St, Burnaby, BC',
    type: 'Level 2',
    power: '22 kW',
    available: 2,
    total: 6,
    price: '$0.25/kWh',
    coordinate: {
      latitude: 49.2827,
      longitude: -123.0186,
    },
  },
  {
    id: '3',
    name: 'Metrotown Power Hub',
    address: '4800 Kingsway, Burnaby, BC',
    type: 'DC Fast Charging',
    power: '100 kW',
    available: 1,
    total: 3,
    price: '$0.40/kWh',
    coordinate: {
      latitude: 49.2262,
      longitude: -123.0038,
    },
  },
  {
    id: '4',
    name: 'Coquitlam River Park Charging',
    address: '1200 Pinetree Way, Coquitlam, BC',
    type: 'Level 2',
    power: '11 kW',
    available: 4,
    total: 4,
    price: '$0.22/kWh',
    coordinate: {
      latitude: 49.2488,
      longitude: -122.7931,
    },
  },
  // Toronto area - Mississauga
  {
    id: '5',
    name: 'Square One EV Hub',
    address: '100 City Centre Dr, Mississauga, ON',
    type: 'DC Fast Charging',
    power: '200 kW',
    available: 5,
    total: 8,
    price: '$0.38/kWh',
    coordinate: {
      latitude: 43.5933,
      longitude: -79.6441,
    },
  },
  {
    id: '6',
    name: 'Mississauga Transit ChargePoint',
    address: '3359 Mississauga Rd, Mississauga, ON',
    type: 'Level 2',
    power: '22 kW',
    available: 6,
    total: 10,
    price: '$0.28/kWh',
    coordinate: {
      latitude: 43.5890,
      longitude: -79.6441,
    },
  },
  {
    id: '7',
    name: 'Erin Mills Town Centre Charging',
    address: '5100 Erin Mills Pkwy, Mississauga, ON',
    type: 'DC Fast Charging',
    power: '150 kW',
    available: 2,
    total: 4,
    price: '$0.42/kWh',
    coordinate: {
      latitude: 43.5563,
      longitude: -79.7402,
    },
  },
  {
    id: '8',
    name: 'Port Credit GO Station EV',
    address: '2 Elm St, Mississauga, ON',
    type: 'Level 2',
    power: '11 kW',
    available: 8,
    total: 12,
    price: '$0.24/kWh',
    coordinate: {
      latitude: 43.5563,
      longitude: -79.5890,
    },
  },
];

export default function ChargerFinderScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyChargers, setNearbyChargers] = useState([]);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find nearby chargers.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation(userLocation);
      
      // Calculate distances and sort chargers by distance
      const chargersWithDistance = SAMPLE_CHARGERS.map(charger => ({
        ...charger,
        calculatedDistance: calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          charger.coordinate.latitude, 
          charger.coordinate.longitude
        )
      })).sort((a, b) => {
        // Sort by distance (convert to numeric for proper sorting)
        const aDistance = parseFloat(a.calculatedDistance);
        const bDistance = parseFloat(b.calculatedDistance);
        return aDistance - bDistance;
      });
      
      setNearbyChargers(chargersWithDistance);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location.');
      // Set default location and chargers for demo
      const defaultLocation = { 
        latitude: 49.2781, 
        longitude: -122.7912,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setLocation(defaultLocation);
      
      // Calculate distances from default location
      const chargersWithDistance = SAMPLE_CHARGERS.map(charger => ({
        ...charger,
        calculatedDistance: calculateDistance(
          defaultLocation.latitude, 
          defaultLocation.longitude, 
          charger.coordinate.latitude, 
          charger.coordinate.longitude
        )
      })).sort((a, b) => {
        const aDistance = parseFloat(a.calculatedDistance);
        const bDistance = parseFloat(b.calculatedDistance);
        return aDistance - bDistance;
      });
      
      setNearbyChargers(chargersWithDistance);
      setLoading(false);
    }
  };

  const handleMarkerPress = (charger) => {
    setSelectedCharger(charger);
    mapRef.current?.animateToRegion({
      ...charger.coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleChargerSelect = (charger) => {
    setSelectedCharger(charger);
    mapRef.current?.animateToRegion({
      ...charger.coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return '#4CAF50';
    if (ratio > 0.2) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for chargers"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.voiceButton}>
            <MaterialIcons name="mic" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Google Maps */}
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={location}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {nearbyChargers.map((charger) => (
              <Marker
                key={charger.id}
                coordinate={charger.coordinate}
                onPress={() => handleMarkerPress(charger)}
              >
                <View style={[
                  styles.markerContainer,
                  selectedCharger?.id === charger.id && styles.selectedMarker
                ]}>
                  <MaterialIcons 
                    name="ev-station" 
                    size={24} 
                    color="white" 
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        )}
        
        {/* Current Location Button */}
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Chargers List */}
      <View style={styles.listContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {nearbyChargers.map((charger) => (
            <TouchableOpacity
              key={charger.id}
              style={[
                styles.chargerCard,
                selectedCharger?.id === charger.id && styles.selectedCard
              ]}
              onPress={() => handleChargerSelect(charger)}
            >
              <View style={styles.chargerHeader}>
                <View style={styles.chargerInfo}>
                  <Text style={styles.chargerName}>{charger.name}</Text>
                  <Text style={styles.chargerDistance}>{charger.calculatedDistance}</Text>
                </View>
                <View style={styles.availabilityContainer}>
                  <View style={[
                    styles.availabilityDot,
                    { backgroundColor: getAvailabilityColor(charger.available, charger.total) }
                  ]} />
                  <Text style={styles.availabilityText}>
                    {charger.available}/{charger.total} available
                  </Text>
                </View>
              </View>
              
              <Text style={styles.chargerAddress}>{charger.address}</Text>
              
              <View style={styles.chargerDetails}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="flash-on" size={16} color="#666" />
                  <Text style={styles.detailText}>{charger.type}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="speed" size={16} color="#666" />
                  <Text style={styles.detailText}>{charger.power}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="attach-money" size={16} color="#666" />
                  <Text style={styles.detailText}>{charger.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="map" size={24} color="#4CAF50" />
          <Text style={[styles.navText, { color: '#4CAF50' }]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="bookmark" size={24} color="#999" />
          <Text style={styles.navText}>Reservations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={24} color="#999" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="settings" size={24} color="#999" />
          <Text style={styles.navText}>Settings</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  voiceButton: {
    padding: 4,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: '#2196F3',
    transform: [{ scale: 1.2 }],
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chargerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
}); 