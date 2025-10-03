import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, DollarSign } from 'lucide-react-native';
import type { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onAccept?: (tripId: string) => void;
  onReject?: (tripId: string) => void;
  onStart?: (tripId: string) => void;
  onEnd?: (tripId: string) => void;
  showActions?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onAccept,
  onReject,
  onStart,
  onEnd,
  showActions = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.serviceType}>{trip.service_type}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{trip.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <MapPin size={20} color="#10B981" />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationAddress}>{trip.pickup_location}</Text>
          </View>
        </View>

        <View style={styles.locationDivider} />

        <View style={styles.locationRow}>
          <MapPin size={20} color="#EF4444" />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Drop-off</Text>
            <Text style={styles.locationAddress}>{trip.dropoff_location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Navigation size={16} color="#6B7280" />
          <Text style={styles.detailText}>{trip.distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.detail}>
          <DollarSign size={16} color="#6B7280" />
          <Text style={styles.detailText}>₹{trip.estimated_fare}</Text>
        </View>
      </View>

      {showActions && trip.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onReject?.(trip.id)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => onAccept?.(trip.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {showActions && trip.status === 'accepted' && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStart?.(trip.id)}
        >
          <Text style={styles.startButtonText}>Start Trip</Text>
        </TouchableOpacity>
      )}

      {showActions && trip.status === 'in_progress' && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => onEnd?.(trip.id)}
        >
          <Text style={styles.endButtonText}>End Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  locationDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  endButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
