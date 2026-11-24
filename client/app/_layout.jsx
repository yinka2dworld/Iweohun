/* eslint-disable import/namespace -- expo-splash-screen exposes its API through a generated module */
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AudioProvider } from '@/context/AudioContext';
import AudioPlayerWrapper from '@/components/AudioPlayerWrapper';
import { clearAuthSession, setUnauthorizedHandler } from '@/lib/api';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may already be prevented (for example after Fast Refresh).
});

export default function RootLayout() {
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
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AudioProvider>
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
    </ThemeProvider>
  );
}
