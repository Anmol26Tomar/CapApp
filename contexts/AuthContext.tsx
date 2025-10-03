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
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    if (response.captain) {
      setCaptain(response.captain);
      await AsyncStorage.setItem('captain_data', JSON.stringify(response.captain));
    }
  };

  const signup = async (data: SignupData) => {
    await authService.signup(data);
  };

  const verifyOTP = async (data: OTPVerification) => {
    const response = await authService.verifyOTP(data);
    if (response.captain) {
      setCaptain(response.captain);
      await AsyncStorage.setItem('captain_data', JSON.stringify(response.captain));
    }
  };

  const logout = async () => {
    await authService.logout();
    setCaptain(null);
  };

  const refreshProfile = async () => {
    const profile = await captainService.getProfile();
    setCaptain(profile);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
