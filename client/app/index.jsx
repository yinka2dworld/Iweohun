import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import tw from 'twrnc';

export default function Home() {
  const router = useRouter();
  const theme = useThemeColor({}, 'background'); // Applying useThemeColor for background theming

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3000); 
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ThemedView style={[tw`flex-1 justify-center items-center`, { backgroundColor: theme }]}>
      {/* Main Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={tw`w-50 h-70 mt-45 `}
        resizeMode="contain"
      />

      <ThemedText style={tw` mt-20 `}>powered by</ThemedText>
      <Image
        source={require('../assets/images/Okinlm.png')}
        style={tw`w-30 h-30`}
        resizeMode="contain"
      />
    </ThemedView>
  );
}
