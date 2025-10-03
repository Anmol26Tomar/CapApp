import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_API } from '../constants/api';
import type {
  LoginCredentials,
  SignupData,
  OTPVerification,
  Captain,
  Trip,
  Earning,
  EarningSummary,
} from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------------------------
// Mock Data & Helpers
// ---------------------------
const mockCaptain: Captain = {
  id: 'cap_001',
  full_name: 'Demo Captain',
  phone: '9999999999',
  email: 'demo@captain.app',
  vehicle_type: 'bike',
  service_scope: 'intra_city',
  is_available: true,
  rating: 4.7,
  total_trips: 123,
  city: 'Mumbai',
};

const mockToken = 'mock.jwt.token';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    if (USE_MOCK_API) {
      const isValid =
        credentials.email.toLowerCase() === 'demo@captain.app' &&
        credentials.password === 'password123';
      if (!isValid) {
        const error: any = new Error('Invalid credentials');
        error.response = { data: { message: 'Invalid credentials' } };
        throw error;
      }
      await AsyncStorage.setItem('auth_token', mockToken);
      return { token: mockToken, captain: mockCaptain };
    }
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post(API_ENDPOINTS.SIGNUP, data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerification) => {
    const response = await api.post(API_ENDPOINTS.VERIFY_OTP, data);
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  resendOTP: async (phone: string) => {
    const response = await api.post(API_ENDPOINTS.RESEND_OTP, { phone });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('captain_data');
  },
};

export const captainService = {
  getProfile: async (): Promise<Captain> => {
    if (USE_MOCK_API) {
      return mockCaptain;
    }
    const response = await api.get(API_ENDPOINTS.GET_CAPTAIN_PROFILE);
    return response.data;
  },

  updateProfile: async (data: Partial<Captain>): Promise<Captain> => {
    if (USE_MOCK_API) {
      // Merge and return updated mock captain
      const updated: Captain = { ...mockCaptain, ...data } as Captain;
      return updated;
    }
    const response = await api.put(API_ENDPOINTS.UPDATE_CAPTAIN_PROFILE, data);
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean): Promise<void> => {
    if (USE_MOCK_API) {
      return;
    }
    await api.put(API_ENDPOINTS.UPDATE_AVAILABILITY, { is_available: isAvailable });
  },
};

export const tripService = {
  getPendingRequests: async (): Promise<Trip[]> => {
    if (USE_MOCK_API) {
      return [
        {
          id: 'trip_001',
          service_type: 'delivery',
          pickup_location: 'Andheri East',
          pickup_lat: 19.1197,
          pickup_lng: 72.8468,
          dropoff_location: 'Bandra West',
          dropoff_lat: 19.0600,
          dropoff_lng: 72.8365,
          distance: 12.4,
          estimated_fare: 180,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ];
    }
    const response = await api.get(API_ENDPOINTS.GET_PENDING_REQUESTS);
    return response.data;
  },

  getActiveTrip: async (): Promise<Trip | null> => {
    if (USE_MOCK_API) {
      return null;
    }
    const response = await api.get(API_ENDPOINTS.GET_ACTIVE_TRIP);
    return response.data;
  },

  acceptTrip: async (tripId: string): Promise<Trip> => {
    if (USE_MOCK_API) {
      return {
        id: tripId,
        service_type: 'delivery',
        pickup_location: 'Andheri East',
        pickup_lat: 19.1197,
        pickup_lng: 72.8468,
        dropoff_location: 'Bandra West',
        dropoff_lat: 19.06,
        dropoff_lng: 72.8365,
        distance: 12.4,
        estimated_fare: 180,
        status: 'accepted',
        created_at: new Date().toISOString(),
      };
    }
    const response = await api.post(API_ENDPOINTS.ACCEPT_TRIP, { trip_id: tripId });
    return response.data;
  },

  rejectTrip: async (tripId: string, reason: string): Promise<void> => {
    if (USE_MOCK_API) {
      return;
    }
    await api.post(API_ENDPOINTS.REJECT_TRIP, { trip_id: tripId, reason });
  },

  startTrip: async (tripId: string): Promise<Trip> => {
    if (USE_MOCK_API) {
      return {
        id: tripId,
        service_type: 'delivery',
        pickup_location: 'Andheri East',
        pickup_lat: 19.1197,
        pickup_lng: 72.8468,
        dropoff_location: 'Bandra West',
        dropoff_lat: 19.06,
        dropoff_lng: 72.8365,
        distance: 12.4,
        estimated_fare: 180,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }
    const response = await api.post(API_ENDPOINTS.START_TRIP, { trip_id: tripId });
    return response.data;
  },

  endTrip: async (tripId: string, otp: string): Promise<Trip> => {
    if (USE_MOCK_API) {
      return {
        id: tripId,
        service_type: 'delivery',
        pickup_location: 'Andheri East',
        pickup_lat: 19.1197,
        pickup_lng: 72.8468,
        dropoff_location: 'Bandra West',
        dropoff_lat: 19.06,
        dropoff_lng: 72.8365,
        distance: 12.4,
        estimated_fare: 180,
        actual_fare: 180,
        status: 'completed',
        otp,
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }
    const response = await api.post(API_ENDPOINTS.END_TRIP, { trip_id: tripId, otp });
    return response.data;
  },

  cancelTrip: async (tripId: string, reason: string): Promise<void> => {
    if (USE_MOCK_API) {
      return;
    }
    await api.post(API_ENDPOINTS.CANCEL_TRIP, { trip_id: tripId, reason });
  },
};

export const earningsService = {
  getEarnings: async (startDate?: string, endDate?: string): Promise<Earning[]> => {
    if (USE_MOCK_API) {
      const today = new Date().toISOString().slice(0, 10);
      return [
        { id: 'earn_001', captain_id: mockCaptain.id, trip_id: 'trip_001', amount: 180, date: today, created_at: new Date().toISOString() },
        { id: 'earn_002', captain_id: mockCaptain.id, trip_id: 'trip_002', amount: 220, date: today, created_at: new Date().toISOString() },
      ];
    }
    const response = await api.get(API_ENDPOINTS.GET_EARNINGS, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getSummary: async (): Promise<EarningSummary> => {
    if (USE_MOCK_API) {
      return { today: 400, week: 2800, month: 12000, total: 55000 };
    }
    const response = await api.get(API_ENDPOINTS.GET_EARNINGS_SUMMARY);
    return response.data;
  },
};
