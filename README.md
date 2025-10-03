# Captain App - Delivery Partner Application

A comprehensive React Native mobile application built with Expo for delivery partners (captains) working with logistics and ride-hailing services.

## Features

### Authentication
- **Login & Signup**: Email/password authentication with OTP verification
- **Vehicle Selection**: Choose from Bike, Cab, or Truck
- **Service Scope**: Select Intra-city or Inter-city operations
- **OTP Verification**: Secure phone number verification after signup

### Dashboard (Home)
- **Service Categories**: Dynamically displayed based on vehicle type and service scope
  - **Bike (Intra-city)**: Local Parcel Delivery, Bike Ride
  - **Cab (Intra/Inter city)**: Cab booking requests
  - **Truck (Intra-city)**: Truck booking
  - **Truck (Inter-city)**: Packers & Movers, All India Parcel
- **Incoming Requests**: Real-time trip requests with auto-refresh
- **Trip Details**: Pickup/drop-off locations, distance, estimated fare
- **Trip Actions**:
  - Accept/Reject requests (with reason)
  - Start trip (opens Google Maps for navigation)
  - Navigate to dropoff
  - End trip (OTP verification)
  - Cancel trip (with reason)

### Earnings
- **Summary Dashboard**: Today, Week, Month, and Total earnings
- **Transaction History**: Detailed list of all completed trips
- **Filter Options**: View earnings by week or month
- **Real-time Updates**: Pull to refresh functionality

### Profile
- **Profile Management**: View and edit personal information
- **Availability Toggle**: Control trip request acceptance
- **Statistics**: Rating and total trips completed
- **Update City**: Change operating city
- **Logout**: Secure sign out

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage for local session management
- **UI Components**: Custom components with clean, modern design
- **Icons**: Lucide React Native
- **Maps Integration**: Deep linking to Google Maps

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx         # Tab navigation setup
│   ├── index.tsx           # Home/Dashboard screen
│   ├── earnings.tsx        # Earnings screen
│   └── profile.tsx         # Profile screen
├── _layout.tsx             # Root layout with AuthProvider
├── index.tsx               # Initial route handler
├── login.tsx               # Login screen
├── signup.tsx              # Signup screen
└── verify-otp.tsx          # OTP verification screen

components/
├── Button.tsx              # Reusable button component
├── Input.tsx               # Reusable input component
├── Modal.tsx               # Modal component
└── TripCard.tsx            # Trip display card

contexts/
└── AuthContext.tsx         # Authentication context

services/
└── api.ts                  # API service layer

types/
└── index.ts                # TypeScript type definitions

constants/
└── api.ts                  # API endpoints configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API Base URL:
Edit `constants/api.ts` to set your backend API URL:
```typescript
export const API_BASE_URL = 'https://your-api-domain.com';
```

3. Start the development server:
```bash
npm run dev
```

### Running the App

**Web:**
- Press `w` in the terminal after starting the dev server
- Or open http://localhost:8081 in your browser

**iOS Simulator:**
- Press `i` in the terminal (requires Xcode)

**Android Emulator:**
- Press `a` in the terminal (requires Android Studio)

**Physical Device:**
- Install Expo Go app
- Scan the QR code shown in terminal

## API Integration

The app is designed to work with a backend API. All API calls are centralized in `services/api.ts`.

### Required API Endpoints

#### Authentication
- `POST /auth/login` - Captain login
- `POST /auth/signup` - Captain registration
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/resend-otp` - Resend OTP

#### Captain Profile
- `GET /captain/profile` - Get captain profile
- `PUT /captain/profile` - Update captain profile
- `PUT /captain/availability` - Update availability status

#### Trips
- `GET /trips/pending` - Get pending trip requests
- `GET /trips/active` - Get active trip
- `POST /trips/accept` - Accept a trip
- `POST /trips/reject` - Reject a trip
- `POST /trips/start` - Start a trip
- `POST /trips/end` - End a trip (requires OTP)
- `POST /trips/cancel` - Cancel a trip

#### Earnings
- `GET /earnings` - Get earnings list
- `GET /earnings/summary` - Get earnings summary

### Request/Response Format

All API requests include:
```typescript
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
```

Example Login Response:
```json
{
  "token": "jwt-token-here",
  "captain": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "vehicle_type": "bike",
    "service_scope": "intra_city",
    "is_available": true,
    "rating": 4.5,
    "total_trips": 150,
    "city": "Mumbai"
  }
}
```

## Design System

### Colors
- **Primary**: `#2563EB` (Blue)
- **Secondary**: `#10B981` (Green)
- **Danger**: `#EF4444` (Red)
- **Background**: `#F9FAFB` (Light Gray)
- **Text Primary**: `#1F2937` (Dark Gray)
- **Text Secondary**: `#6B7280` (Medium Gray)

### Typography
- **Headers**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Small Text**: 12px

### Spacing
- Consistent 8px grid system
- Card padding: 16px
- Section padding: 16-24px

## Features Detail

### Google Maps Integration
The app uses deep linking to open native Google Maps:
- iOS: Opens Apple Maps
- Android: Opens Google Maps
- Web: Opens Google Maps in browser

Navigation is triggered for:
- Pickup location (when starting trip)
- Drop-off location (during active trip)

### Real-time Updates
- Dashboard auto-refreshes every 10 seconds
- Pull-to-refresh on all screens
- Optimistic UI updates for better UX

### Error Handling
- Network error handling with user-friendly messages
- Form validation on all inputs
- API error display in alerts
- Loading states for all async operations

## Building for Production

### Web
```bash
npm run build:web
```

### iOS/Android
For production builds, you'll need to:
1. Create a production build using EAS Build
2. Configure app signing
3. Submit to App Store/Play Store

Refer to [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

## Environment Variables

The app uses the following environment variables (configured in `.env`):
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## License

Proprietary - All rights reserved

## Support

For support, please contact your technical team or refer to the project documentation.
