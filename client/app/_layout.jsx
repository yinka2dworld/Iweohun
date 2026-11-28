import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AudioProvider } from '@/context/AudioContext';
import { ThemeSettingsProvider } from '@/context/ThemeContext';
import AudioPlayerWrapper from '@/components/AudioPlayerWrapper';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeSettingsProvider>
      <RootLayoutContent />
    </ThemeSettingsProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <AudioProvider>
      <Stack>
        {/* Define the routes */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book-details/[bookId]" options={{ headerShown: false }} />
        <Stack.Screen name="edit-book/[bookId]" options={{ headerShown: false }} />
        <Stack.Screen name="addBook" options={{ headerShown: false }} />
        <Stack.Screen name="screens/about-iweohun" options={{ headerShown: false }} />
        <Stack.Screen name="screens/about-okin" options={{ headerShown: false }} />
        <Stack.Screen name="screens/terms-policy" options={{ headerShown: false }} />
        <Stack.Screen name="screens/settings" options={{ headerShown: false }} />
        <Stack.Screen name="screens/become-creator" options={{ headerShown: false }} />
        <Stack.Screen name="language-books/[language]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <AudioPlayerWrapper />
           <StatusBar style={isDark ? 'light' : 'dark'} />
         </AudioProvider>
    </ThemeProvider>
  );
}

