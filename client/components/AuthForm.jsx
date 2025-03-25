import React, { useState } from 'react';
import { Alert, Image, TextInput, TouchableOpacity, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require('../../client/assets/images/logo.png');

export default function AuthForm({ type }) {
  const router = useRouter();
  const isSignup = type === 'signup';
  const [formData, setFormData] = useState({
    email: '',
    username: isSignup ? '' : undefined,
    password: '',
  });
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  // Themed colors
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const boxColor = useThemeColor({}, 'box');
  const primaryColor = useThemeColor({}, 'primary');

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    if (!formData.username || !formData.password || (isSignup && !formData.username)) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSignup ? '/signup' : '/login';
      const response = await axios.post(`${apiUrl}${endpoint}`, formData);
      const { userId, role, token } = response.data;

    await AsyncStorage.setItem("userId", userId);
    await AsyncStorage.setItem("role", role);
    await AsyncStorage.setItem("authToken", token);
    
      Alert.alert('Success', isSignup ? 'Signed up successfully.' : 'Logged in successfully.');
      router.push(isSignup ? '/auth/login' : '/(tabs)/main');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={tw`flex-1 items-center pt-20`} backgroundColor={backgroundColor}>
      <Image source={logo} style={tw`h-40 w-42 mb-15`} resizeMode="contain" />
      <ThemedView style={tw`w-full px-10 mb-1 gap-4`}>
      {isSignup && ( 
        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
          placeholder="EMAIL"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={placeholderColor}
        />
         )}
        
          <TextInput
            style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
            placeholder="USERNAME"
            value={formData.username}
            onChangeText={(text) => handleChange('username', text)}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={placeholderColor}
          />
       
        <View style={tw`relative`}>
          <TextInput
            style={[tw`h-12 px-5 border rounded-md text-lg pr-10`, { borderColor: boxColor, color: textColor }]}
            placeholder="PASSWORD"
            secureTextEntry={!isPasswordVisible}
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={placeholderColor}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={tw`absolute right-0 top-0 h-12 w-12 justify-center items-center`}
            aria-label="Toggle password visibility"
          >
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ThemedView style={tw`w-full px-12`}>
        <Pressable
          style={[tw`h-11 border rounded-md items-center justify-center`, loading ? tw`bg-gray-400 border-gray-300` : { backgroundColor: primaryColor, borderColor: boxColor }]}
          onPress={handleAuth}
          disabled={loading}
        >
          <ThemedText style={tw`text-lg font-bold`} color={textColor}>
            {loading ? (isSignup ? 'Signing Up...' : 'Logging In...') : isSignup ? 'Sign Up' : 'Log In'}
          </ThemedText>
        </Pressable>
        {error && <ThemedText style={tw`text-red-500 text-center mt-2`} color="red">{error}</ThemedText>}
        <ThemedText style={tw`text-center py-2 text-xs`} type="link">OR {isSignup ? 'SIGN UP' : 'LOGIN'} WITH</ThemedText>
      </ThemedView>
      <ThemedText type="link" style={tw`text-center`}>
        {isSignup ? 'Have an Account?' : "Don't have an Account?"}
        <ThemedText type="default" style={tw`text-[#ff1493] text-xs`} onPress={() => router.push(isSignup ? '/auth/login' : '/auth/signup')}>
          {' '}{isSignup ? 'Login' : 'Sign Up'}
        </ThemedText>
      </ThemedText>
    </ThemedView>
  );
}
