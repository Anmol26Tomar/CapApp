import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Database {
  public: {
    Tables: {
      captains: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          city: string;
          vehicle_type: string;
          vehicle_subtype: string | null;
          service_scope: string;
          is_available: boolean;
          rating: number;
          total_trips: number;
          auth_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          city: string;
          vehicle_type: string;
          vehicle_subtype?: string;
          service_scope: string;
          is_available?: boolean;
          rating?: number;
          total_trips?: number;
          auth_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          city?: string;
          vehicle_type?: string;
          vehicle_subtype?: string;
          service_scope?: string;
          is_available?: boolean;
          rating?: number;
          total_trips?: number;
          auth_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ride_requests: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          pickup_location: string;
          pickup_lat: number;
          pickup_lng: number;
          dropoff_location: string;
          dropoff_lat: number;
          dropoff_lng: number;
          distance: number;
          estimated_fare: number;
          user_otp: string;
          pickup_otp: string;
          status: string;
          vehicle_type_required: string;
          order_details: Record<string, any>;
          expires_at: string;
          created_at: string;
        };
      };
      trips: {
        Row: {
          id: string;
          request_id: string | null;
          captain_id: string;
          service_type: string;
          pickup_location: string;
          pickup_lat: number;
          pickup_lng: number;
          dropoff_location: string;
          dropoff_lat: number;
          dropoff_lng: number;
          distance: number;
          estimated_fare: number;
          actual_fare: number | null;
          status: string;
          user_otp: string;
          pickup_otp_verified: boolean;
          order_details: Record<string, any>;
          cancel_reason: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
      };
      earnings: {
        Row: {
          id: string;
          captain_id: string;
          trip_id: string;
          amount: number;
          date: string;
          created_at: string;
        };
      };
    };
  };
}
