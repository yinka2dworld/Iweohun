import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_PREFERENCE_KEY = 'iweohun_theme_preference';
const THEME_PREFERENCES = ['system', 'light', 'dark'];

const ThemeSettingsContext = createContext(null);

export function ThemeSettingsProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (isMounted && THEME_PREFERENCES.includes(savedPreference)) {
          setThemePreferenceState(savedPreference);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadThemePreference();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = useCallback(async (preference) => {
    if (!THEME_PREFERENCES.includes(preference)) {
      throw new Error(`Unsupported theme preference: ${preference}`);
    }

    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
    setThemePreferenceState(preference);
  }, []);

  const value = useMemo(
    () => ({ themePreference, setThemePreference }),
    [themePreference, setThemePreference]
  );

  if (!isReady) {
    return null;
  }

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  const context = useContext(ThemeSettingsContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within a ThemeSettingsProvider');
  }
  return context;
}
