/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DemoModeContextType = {
  isDemoMode: boolean;
  toggleDemoMode: () => Promise<void>;
  isLoading: boolean;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo mode
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDemoMode();
  }, []);

  const loadDemoMode = async () => {
    try {
      const saved = await AsyncStorage.getItem('demoMode');
      if (saved !== null) {
        setIsDemoMode(saved === 'true');
      }
    } catch (error) {
      console.error('Failed to load demo mode preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDemoMode = async () => {
    try {
      const newMode = !isDemoMode;
      setIsDemoMode(newMode);
      await AsyncStorage.setItem('demoMode', newMode.toString());
    } catch (error) {
      console.error('Failed to save demo mode preference:', error);
    }
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, isLoading }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
};
