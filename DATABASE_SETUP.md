# Database Setup Instructions

## Overview
This application requires a Supabase database. The database schema has been designed but needs to be applied to your Supabase project.

## Setup Steps

### 1. Access Supabase
Your Supabase credentials are already configured in the `.env` file.

### 2. Apply Database Migration
You need to run the SQL migration to create the required tables. Here's the SQL to execute in your Supabase SQL Editor:

```sql
-- Create captains table
CREATE TABLE IF NOT EXISTS captains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  city text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('bike', 'cab', 'truck')),
  vehicle_subtype text,
  service_scope text NOT NULL CHECK (service_scope IN ('intra_city', 'inter_city')),
  is_available boolean DEFAULT true,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_trips integer DEFAULT 0,
  auth_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ride_requests table
CREATE TABLE IF NOT EXISTS ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type text NOT NULL,
  pickup_location text NOT NULL,
  pickup_lat numeric NOT NULL,
  pickup_lng numeric NOT NULL,
  dropoff_location text NOT NULL,
  dropoff_lat numeric NOT NULL,
  dropoff_lng numeric NOT NULL,
  distance numeric NOT NULL,
  estimated_fare numeric NOT NULL,
  user_otp text NOT NULL,
  pickup_otp text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  vehicle_type_required text NOT NULL CHECK (vehicle_type_required IN ('bike', 'cab', 'truck')),
  order_details jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES ride_requests(id),
  captain_id uuid REFERENCES captains(id) NOT NULL,
  service_type text NOT NULL,
  pickup_location text NOT NULL,
  pickup_lat numeric NOT NULL,
  pickup_lng numeric NOT NULL,
  dropoff_location text NOT NULL,
  dropoff_lat numeric NOT NULL,
  dropoff_lng numeric NOT NULL,
  distance numeric NOT NULL,
  estimated_fare numeric NOT NULL,
  actual_fare numeric,
  status text DEFAULT 'accepted' CHECK (status IN ('accepted', 'reached_pickup', 'in_progress', 'completed', 'cancelled')),
  user_otp text NOT NULL,
  pickup_otp_verified boolean DEFAULT false,
  order_details jsonb DEFAULT '{}'::jsonb,
  cancel_reason text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id uuid REFERENCES captains(id) NOT NULL,
  trip_id uuid REFERENCES trips(id) NOT NULL,
  amount numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Captains policies
CREATE POLICY "Captains can view own profile"
  ON captains FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Captains can update own profile"
  ON captains FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Captains can insert own profile"
  ON captains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Ride requests policies
CREATE POLICY "Captains can view pending ride requests matching their service type"
  ON ride_requests FOR SELECT
  TO authenticated
  USING (
    status = 'pending'
    AND expires_at > now()
    AND EXISTS (
      SELECT 1 FROM captains
      WHERE captains.auth_user_id = auth.uid()
      AND captains.vehicle_type = ride_requests.vehicle_type_required
      AND captains.is_available = true
    )
  );

CREATE POLICY "Captains can update ride requests they are accepting"
  ON ride_requests FOR UPDATE
  TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM captains
      WHERE captains.auth_user_id = auth.uid()
      AND captains.vehicle_type = ride_requests.vehicle_type_required
    )
  )
  WITH CHECK (status IN ('accepted', 'rejected'));

-- Trips policies
CREATE POLICY "Captains can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM captains
      WHERE captains.id = trips.captain_id
      AND captains.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Captains can insert trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM captains
      WHERE captains.id = captain_id
      AND captains.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Captains can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM captains
      WHERE captains.id = trips.captain_id
      AND captains.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM captains
      WHERE captains.id = trips.captain_id
      AND captains.auth_user_id = auth.uid()
    )
  );

-- Earnings policies
CREATE POLICY "Captains can view own earnings"
  ON earnings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM captains
      WHERE captains.id = earnings.captain_id
      AND captains.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert earnings"
  ON earnings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM captains
      WHERE captains.id = captain_id
      AND captains.auth_user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_captains_auth_user_id ON captains(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_captains_vehicle_type ON captains(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);
CREATE INDEX IF NOT EXISTS idx_ride_requests_expires_at ON ride_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_ride_requests_vehicle_type ON ride_requests(vehicle_type_required);
CREATE INDEX IF NOT EXISTS idx_trips_captain_id ON trips(captain_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_earnings_captain_id ON earnings(captain_id);
CREATE INDEX IF NOT EXISTS idx_earnings_date ON earnings(date);
```

## How to Apply

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the entire SQL above
5. Click "Run" to execute

## OTP System Configuration

For the OTP verification to work properly with Supabase Auth:

1. In Supabase Dashboard, go to Authentication → Settings
2. Under "Auth Providers", enable Phone authentication
3. Configure your SMS provider (Twilio, MessageBird, etc.)
4. Set up the SMS template for OTP delivery

## Testing the Database

After applying the migration, you can test by:
1. Signing up as a new driver through the app
2. The app will create an auth user and a captain record
3. Check the `captains` table to verify the data was inserted correctly

## Important Notes

- Row Level Security (RLS) is enabled on all tables
- Captains can only see their own data
- Ride requests are filtered based on vehicle type and availability
- All sensitive operations require authentication
