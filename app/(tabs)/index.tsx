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
  Animated,
} from 'react-native';
import { TripCard } from '../../components/TripCard';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { tripService } from '../../services/api';
import type { Trip } from '../../types';
import { Navigation, Zap, Clock } from 'lucide-react-native';
import { useDummyData } from '../../services/dummyData';

export default function HomeScreen() {
  const { captain } = useAuth();
  const dummyData = useDummyData();
  const [pendingTrips, setPendingTrips] = useState<Trip[]>(dummyData.pendingTrips);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(dummyData.activeTrip);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [tripOtp, setTripOtp] = useState('');
  const pulseAnim = useState(new Animated.Value(1))[0];

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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const fetchTrips = async () => {
    try {
      const [pending, active] = await Promise.all([
        tripService.getPendingRequests(),
        tripService.getActiveTrip(),
      ]);
      setPendingTrips(pending);
      setActiveTrip(active);
    } catch (error: any) {
      console.log('Using dummy data');
      setPendingTrips(dummyData.pendingTrips);
      setActiveTrip(dummyData.activeTrip);
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

  const displayCaptain = captain || dummyData.captain;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {displayCaptain?.full_name.split(' ')[0]} 👋</Text>
            <Text style={styles.serviceInfo}>
              {displayCaptain?.vehicle_type?.toUpperCase()} • {displayCaptain?.service_scope?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>⭐ {displayCaptain?.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{displayCaptain?.total_trips}</Text>
              <Text style={styles.statLabel}>trips</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.quickStatCard}>
          <View style={styles.quickStatIcon}>
            <Zap size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{pendingTrips.length}</Text>
            <Text style={styles.quickStatLabel}>New Requests</Text>
          </View>
        </View>
        <View style={styles.quickStatCard}>
          <View style={[styles.quickStatIcon, { backgroundColor: '#DBEAFE' }]}>
            <Clock size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{activeTrip ? '1' : '0'}</Text>
            <Text style={styles.quickStatLabel}>Active Trip</Text>
          </View>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Trip</Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </Animated.View>
            </View>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Incoming Requests</Text>
            {pendingTrips.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{pendingTrips.length}</Text>
              </View>
            )}
          </View>
          {pendingTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Navigation size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubtext}>
                New trip requests will appear here
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
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceInfo: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  otpInstruction: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
});
