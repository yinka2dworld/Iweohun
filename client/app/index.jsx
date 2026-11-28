import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SecureStore from '@/lib/SecureStore';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import tw from 'twrnc';

// The single in-app splash screen: brand logo centered, "Powered by" footer
// anchored to the bottom, then redirect based on auth state.
export default function Home() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;

    const navigateBasedOnAuth = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (!mounted) return;
      router.replace(token ? '/(tabs)/main' : '/auth/login');
    };

    const timer = setTimeout(navigateBasedOnAuth, 2000);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
      {/* App Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={tw`w-44 h-52`}
        resizeMode="contain"
      />

      {/* Footer Branding */}
<<<<<<< HEAD
      <ThemedText style={tw`pt-30 text-base`}>Powered by</ThemedText>
      <Image
        source={require('../assets/images/Okinlm.png')}
        style={tw`w-30 h-30 pt-2`}
        resizeMode="contain"
      />
=======
      <View style={[tw`absolute items-center`, { bottom: insets.bottom + 24 }]}>
        <ThemedText style={tw`text-base text-gray-500`}>Powered by</ThemedText>
        <Image
          source={require('../assets/images/Okinlm.png')}
          style={tw`w-24 h-24 mt-1`}
          resizeMode="contain"
        />
      </View>
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
    </ThemedView>
  );
}
