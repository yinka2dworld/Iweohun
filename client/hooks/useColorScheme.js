import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeSettings } from '@/context/ThemeContext';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const { themePreference } = useThemeSettings();

  return themePreference === 'system' ? systemColorScheme : themePreference;
}
