import React, { useEffect } from 'react';
import { View, Image, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { useAppTheme } from './themeContext';

const SplashScreen = () => {
  const router = useRouter();
  const theme = useAppTheme()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3000); 
    return () => clearTimeout(timer);
  }, [router]); 

  return (
    <SafeAreaView style={[tw`flex-1 justify-center items-center`, {backgroundColor: theme.background}]}>
      <Image source={require('../assets/logo.png')} style={tw`w-70 h-70 mt-25`} />
      <Image source={require('../assets//Okin.png')}  style={tw`w-25 h-25 mt-45`} />
    </SafeAreaView>
  );
};

export default SplashScreen;
