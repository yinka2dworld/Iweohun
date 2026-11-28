import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeSettings } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemColorScheme = useRNColorScheme();
  const { themePreference } = useThemeSettings();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (themePreference !== 'system') {
    return themePreference;
  }
  return hasHydrated ? systemColorScheme : 'light';
}
