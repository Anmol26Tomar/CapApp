import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { TripCard } from '../../components/TripCard';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { tripService } from '../../services/api';
import type { Trip } from '../../types';
import { Navigation } from 'lucide-react-native';

export default function HomeScreen() {
  const { captain } = useAuth();
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [tripOtp, setTripOtp] = useState('');

  const getServiceCategories = () => {
    if (!captain) return [];

    const { vehicle_type, service_scope } = captain;

    if (vehicle_type === 'bike' && service_scope === 'intra_city') {
      return ['Local Parcel Delivery', 'Bike Ride'];
    }
    if (vehicle_type === 'cab') {
      return service_scope === 'intra_city'
        ? ['Cab Booking (Intra City)']
        : ['Cab Booking (Inter City)'];
    }
    if (vehicle_type === 'truck') {
      return service_scope === 'intra_city'
        ? ['Truck Booking']
        : ['Packers & Movers', 'All India Parcel'];
    }
    return [];
  };

  const fetchTrips = async () => {
    try {
      const [pending, active] = await Promise.all([
        tripService.getPendingRequests(),
        tripService.getActiveTrip(),
      ]);
      setPendingTrips(pending);
      setActiveTrip(active);
    } catch (error: any) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  const handleAcceptTrip = async (tripId: string) => {
    try {
      const trip = await tripService.acceptTrip(tripId);
      setActiveTrip(trip);
      setPendingTrips((prev) => prev.filter((t) => t.id !== tripId));
      Alert.alert('Success', 'Trip accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept trip');
    }
  };

  const handleRejectTrip = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      await tripService.rejectTrip(selectedTripId, rejectReason);
      setPendingTrips((prev) => prev.filter((t) => t.id !== selectedTripId));
      setRejectModalVisible(false);
      setRejectReason('');
      Alert.alert('Success', 'Trip rejected');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject trip');
    }
  };

  const handleStartTrip = async (tripId: string) => {
    try {
      const trip = await tripService.startTrip(tripId);
      setActiveTrip(trip);
      openMaps(trip.pickup_lat, trip.pickup_lng);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start trip');
    }
  };

  const handleEndTrip = async () => {
    if (!tripOtp.trim() || tripOtp.length !== 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }

    try {
      if (activeTrip) {
        await tripService.endTrip(activeTrip.id, tripOtp);
        setActiveTrip(null);
        setOtpModalVisible(false);
        setTripOtp('');
        Alert.alert('Success', 'Trip completed successfully');
        fetchTrips();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleCancelTrip = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }

    try {
      if (activeTrip) {
        await tripService.cancelTrip(activeTrip.id, cancelReason);
        setActiveTrip(null);
        setCancelModalVisible(false);
        setCancelReason('');
        Alert.alert('Success', 'Trip cancelled');
        fetchTrips();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const openMaps = (lat: number, lng: number) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
      default: 'https:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${lat},${lng}`,
      android: `${scheme}${lat},${lng}`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {captain?.full_name}</Text>
          <Text style={styles.serviceInfo}>
            {captain?.vehicle_type?.toUpperCase()} • {captain?.service_scope?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.rating}>⭐ {captain?.rating.toFixed(1)}</Text>
          <Text style={styles.trips}>{captain?.total_trips} trips</Text>
        </View>
      </View>

      <View style={styles.categories}>
        <Text style={styles.categoriesTitle}>Your Service Categories</Text>
        <View style={styles.categoryList}>
          {getServiceCategories().map((category, index) => (
            <View key={index} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Trip</Text>
            <TripCard
              trip={activeTrip}
              onStart={handleStartTrip}
              onEnd={() => setOtpModalVisible(true)}
            />
            {activeTrip.status === 'in_progress' && (
              <View style={styles.tripActions}>
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => openMaps(activeTrip.dropoff_lat, activeTrip.dropoff_lng)}
                >
                  <Navigation size={20} color="#FFFFFF" />
                  <Text style={styles.navigateButtonText}>Navigate to Dropoff</Text>
                </TouchableOpacity>
                <Button
                  title="Cancel Trip"
                  onPress={() => setCancelModalVisible(true)}
                  variant="danger"
                  style={styles.cancelButton}
                />
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Incoming Requests ({pendingTrips.length})
          </Text>
          {pendingTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubtext}>
                New requests will appear here
              </Text>
            </View>
          ) : (
            pendingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onAccept={handleAcceptTrip}
                onReject={(id) => {
                  setSelectedTripId(id);
                  setRejectModalVisible(true);
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        title="Reject Trip"
      >
        <Input
          label="Reason for Rejection"
          placeholder="Enter reason..."
          value={rejectReason}
          onChangeText={setRejectReason}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />
        <Button title="Submit" onPress={handleRejectTrip} />
      </Modal>

      <Modal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        title="Cancel Trip"
      >
        <Input
          label="Reason for Cancellation"
          placeholder="Enter reason..."
          value={cancelReason}
          onChangeText={setCancelReason}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />
        <Button title="Cancel Trip" onPress={handleCancelTrip} variant="danger" />
      </Modal>

      <Modal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        title="End Trip"
      >
        <Text style={styles.otpInstruction}>
          Enter the 4-digit OTP provided by the customer to complete the trip.
        </Text>
        <Input
          label="Trip OTP"
          placeholder="Enter 4-digit OTP"
          value={tripOtp}
          onChangeText={setTripOtp}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Button title="Complete Trip" onPress={handleEndTrip} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  serviceInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  stats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  trips: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  categories: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  tripActions: {
    marginTop: 12,
    gap: 12,
  },
  navigateButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    width: '100%',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  otpInstruction: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
});
