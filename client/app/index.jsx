import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import tw from 'twrnc';

export default function Home() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    const navigateBasedOnAuth = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        router.replace('/(tabs)/main');
      } else {
        router.replace('/auth/login');
      }
    };

    const timer = setTimeout(navigateBasedOnAuth, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ThemedView style={[tw`flex-1 justify-center items-center`, { backgroundColor }]}>
      {/* App Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={tw`w-50 h-70 mt-55`}
        resizeMode="contain"
      />

      {/* Footer Branding */}
      <ThemedText style={tw`mt-20 text-base text-gray-500`}>Powered by</ThemedText>
      <Image
        source={require('../assets/images/Okinlm.png')}
        style={tw`w-30 h-30 mt-2`}
        resizeMode="contain"
      />
    </ThemedView>
  );
}
