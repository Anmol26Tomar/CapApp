export type VehicleType = 'bike' | 'cab' | 'truck';
export type ServiceScope = 'intra_city' | 'inter_city';
export type TripStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Captain {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  vehicle_type: VehicleType;
  service_scope: ServiceScope;
  is_available: boolean;
  rating: number;
  total_trips: number;
  city?: string;
}

export interface Trip {
  id: string;
  captain_id?: string;
  service_type: string;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_location: string;
  dropoff_lat: number;
  dropoff_lng: number;
  distance: number;
  estimated_fare: number;
  actual_fare?: number;
  status: TripStatus;
  otp?: string;
  cancel_reason?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Earning {
  id: string;
  captain_id: string;
  trip_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface EarningSummary {
  today: number;
  week: number;
  month: number;
  total: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  vehicle_type: VehicleType;
  service_scope: ServiceScope;
  city: string;
}

export interface OTPVerification {
  phone: string;
  otp: string;
}
