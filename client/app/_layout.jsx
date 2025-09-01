import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AudioProvider } from '@/context/AudioContext';
import AudioPlayerWrapper from '@/components/AudioPlayerWrapper';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AudioProvider>
      <Stack>
        {/* Define the routes */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/about-iweohun" options={{ headerShown: false }} />
        <Stack.Screen name="screens/about-okin" options={{ headerShown: false }} />
        <Stack.Screen name="screens/terms-policy" options={{ headerShown: false }} />
        <Stack.Screen name="screens/settings" options={{ headerShown: false }} />
        <Stack.Screen name="screens/become-creator" options={{ headerShown: false }} />
        <Stack.Screen name="language-books/[language]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <AudioPlayerWrapper />
           <StatusBar style="auto" />
         </AudioProvider>
    </ThemeProvider>
  );
}

