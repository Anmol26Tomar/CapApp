import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  LogOut,
  Truck,
  Settings,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { captainService } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { captain, logout, refreshProfile } = useAuth();
  const [isAvailable, setIsAvailable] = useState(captain?.is_available || false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [city, setCity] = useState(captain?.city || '');
  const [updating, setUpdating] = useState(false);

  const handleToggleAvailability = async (value: boolean) => {
    try {
      setIsAvailable(value);
      await captainService.updateAvailability(value);
      await refreshProfile();
    } catch (error: any) {
      setIsAvailable(!value);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleUpdateCity = async () => {
    if (!city.trim()) {
      Alert.alert('Error', 'City cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      await captainService.updateProfile({ city });
      await refreshProfile();
      setEditModalVisible(false);
      Alert.alert('Success', 'City updated successfully');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update city');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    onEdit,
  }: {
    icon: any;
    label: string;
    value: string;
    onEdit?: () => void;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#6B7280" />
        </View>
        <View>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Settings size={18} color="#2563EB" />
        </TouchableOpacity>
      )}
    </View>
  );

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>{captain?.full_name}</Text>
          <View style={styles.vehicleBadge}>
            <Truck size={14} color="#2563EB" />
            <Text style={styles.vehicleText}>
              {captain?.vehicle_type?.toUpperCase()} •{' '}
              {captain?.service_scope?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon={Star}
            label="Rating"
            value={captain?.rating.toFixed(1) || '0.0'}
            color="#F59E0B"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Trips"
            value={captain?.total_trips.toString() || '0'}
            color="#10B981"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.availabilityRow}>
            <View>
              <Text style={styles.availabilityTitle}>Available for Trips</Text>
              <Text style={styles.availabilitySubtext}>
                Toggle to accept trip requests
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={isAvailable ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoContainer}>
            <InfoRow icon={Phone} label="Phone" value={captain?.phone || ''} />
            <InfoRow icon={Mail} label="Email" value={captain?.email || ''} />
            <InfoRow
              icon={MapPin}
              label="City"
              value={captain?.city || 'Not set'}
              onEdit={() => setEditModalVisible(true)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Captain App</Text>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Update City"
      >
        <Input
          label="City"
          placeholder="Enter your city"
          value={city}
          onChangeText={setCity}
        />
        <Button
          title="Update"
          onPress={handleUpdateCity}
          loading={updating}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  availabilityRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  availabilitySubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
