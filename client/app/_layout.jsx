/* eslint-disable import/namespace -- expo-splash-screen exposes its API through a generated module */
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AudioProvider } from '@/context/AudioContext';
import { ThemeSettingsProvider } from '@/context/ThemeContext';
import AudioPlayerWrapper from '@/components/AudioPlayerWrapper';
import { clearAuthSession, setUnauthorizedHandler } from '@/lib/api';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may already be prevented (for example after Fast Refresh).
});

export default function RootLayout() {
<<<<<<< HEAD
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
=======
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, fontError]);

  // A 401 from any authenticated request sends the user back to login.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearAuthSession();
      router.replace('/auth/login');
    });

    return () => setUnauthorizedHandler(null);
  }, [router]);

  if (!loaded && !fontError) {
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
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
<<<<<<< HEAD
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
=======
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="book-details/[bookId]" options={{ headerShown: false }} />
          <Stack.Screen name="addBook" options={{ headerShown: false }} />
          <Stack.Screen name="edit-book/[bookId]" options={{ headerShown: false }} />
          <Stack.Screen name="language-books/[language]" options={{ headerShown: false }} />
          <Stack.Screen name="screens/about-iweohun" options={{ headerShown: false }} />
          <Stack.Screen name="screens/about-okin" options={{ headerShown: false }} />
          <Stack.Screen name="screens/terms-policy" options={{ headerShown: false }} />
          <Stack.Screen name="screens/settings" options={{ headerShown: false }} />
          <Stack.Screen name="screens/edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="screens/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="screens/support" options={{ headerShown: false }} />
          <Stack.Screen name="screens/become-creator" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <AudioPlayerWrapper />
        <StatusBar style="auto" />
      </AudioProvider>
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
    </ThemeProvider>
  );
}
