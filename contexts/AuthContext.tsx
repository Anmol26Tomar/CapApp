import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, captainService } from '../services/api';
import type { Captain, LoginCredentials, SignupData, OTPVerification } from '../types';

interface AuthContextType {
  captain: Captain | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  verifyOTP: (data: OTPVerification) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [captain, setCaptain] = useState<Captain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const profile = await captainService.getProfile();
        setCaptain(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('captain_data');
      setCaptain(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.captain) {
        setCaptain(response.captain);
        if (response.token) {
          await AsyncStorage.setItem('auth_token', response.token);
        }
        await AsyncStorage.setItem('captain_data', JSON.stringify(response.captain));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    console.log(data)
    try {
      const payload = {
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        vehicleType: data.vehicle_type,
        serviceType: data.service_scope,
        password: data.password,
        confirmPassword: data.confirm_Password,
        vehicleSubType:data.vehicle_subtype,
      };
      console.log(payload);
      await authService.signup(payload);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const verifyOTP = async (data: OTPVerification) => {
    try {
      const response = await authService.verifyOTP(data);
      if (response.captain) {
        setCaptain(response.captain);
        await AsyncStorage.setItem('captain_data', JSON.stringify(response.captain));
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCaptain(null);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('captain_data');
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await captainService.getProfile();
      setCaptain(profile);
      await AsyncStorage.setItem('captain_data', JSON.stringify(profile));
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        captain,
        isAuthenticated: !!captain,
        isLoading,
        login,
        signup,
        verifyOTP,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
