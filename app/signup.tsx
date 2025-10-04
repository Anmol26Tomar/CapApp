import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import type { VehicleType, VehicleSubtype, ServiceScope } from '../types';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
  });
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [vehicleSubtype, setVehicleSubtype] = useState<VehicleSubtype | undefined>(undefined);
  const [serviceScope, setServiceScope] = useState<ServiceScope>('intra_city');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getSubtypeOptions = (): { value: VehicleSubtype; label: string }[] => {
    if (vehicleType === 'truck') {
      return [
        { value: 'truck_3wheeler', label: '3 Wheeler' },
        { value: 'truck_mini_van', label: 'Mini Van' },
        { value: 'truck_pickup', label: 'Pickup Truck' },
        { value: 'truck_full_size', label: 'Full Size' },
      ];
    }
    if (vehicleType === 'cab') {
      return [
        { value: 'cab_sedan', label: 'Sedan' },
        { value: 'cab_suv', label: 'SUV' },
        { value: 'cab_hatchback', label: 'Hatchback' },
      ];
    }
    return [{ value: 'bike_standard', label: 'Standard' }];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name) newErrors.full_name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.city) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicle_type: vehicleType,
        vehicle_subtype: vehicleSubtype,
        service_scope: serviceScope,
        city: formData.city,
        confirm_Password:formData.confirmPassword
      });
      router.push({
        pathname: '/verify-otp',
        params: { phone: formData.phone },
      });
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const VehicleButton = ({ type, label }: { type: VehicleType; label: string }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        vehicleType === type && styles.optionButtonActive,
      ]}
      onPress={() => {
        setVehicleType(type);
        setVehicleSubtype(undefined);
      }}
    >
      <Text
        style={[
          styles.optionButtonText,
          vehicleType === type && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SubtypeButton = ({ subtype, label }: { subtype: VehicleSubtype; label: string }) => (
    <TouchableOpacity
      style={[
        styles.subtypeButton,
        vehicleSubtype === subtype && styles.subtypeButtonActive,
      ]}
      onPress={() => setVehicleSubtype(subtype)}
    >
      <Text
        style={[
          styles.optionButtonText,
          vehicleSubtype === subtype && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ScopeButton = ({ scope, label }: { scope: ServiceScope; label: string }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        serviceScope === scope && styles.optionButtonActive,
      ]}
      onPress={() => setServiceScope(scope)}
    >
      <Text
        style={[
          styles.optionButtonText,
          serviceScope === scope && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join as a delivery captain</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            error={errors.full_name}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone"
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            error={errors.phone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Input
            label="City"
            placeholder="Enter your city"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            error={errors.city}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Vehicle Type</Text>
            <View style={styles.optionRow}>
              <VehicleButton type="bike" label="Bike" />
              <VehicleButton type="cab" label="Cab" />
              <VehicleButton type="truck" label="Truck" />
            </View>
          </View>

          {(vehicleType === 'cab' || vehicleType === 'truck') && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {vehicleType === 'cab' ? 'Car Type' : 'Truck Type'}
              </Text>
              <View style={styles.subtypeGrid}>
                {getSubtypeOptions().map((option) => (
                  <SubtypeButton
                    key={option.value}
                    subtype={option.value}
                    label={option.label}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Service Scope</Text>
            <View style={styles.optionRow}>
              <ScopeButton scope="intra_city" label="Intra City" />
              <ScopeButton scope="inter_city" label="Inter City" />
            </View>
          </View>

          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            error={errors.password}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              title="Sign In"
              onPress={() => router.back()}
              variant="outline"
              style={styles.loginButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subtypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subtypeButton: {
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  subtypeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionButtonTextActive: {
    color: '#2563EB',
  },
  signupButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  loginButton: {
    width: '100%',
  },
});
