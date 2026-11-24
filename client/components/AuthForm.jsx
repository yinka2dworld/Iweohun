import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import Ionicons from '@expo/vector-icons/Ionicons';
import SecureStore from '@/lib/SecureStore';
import apiClient, { getApiErrorMessage } from '@/lib/api';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const logo = require('../assets/images/logo.png');

export default function AuthForm({ type }) {
  const router = useRouter();
  const isSignup = type === 'signup';

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
  });

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const boxColor = useThemeColor({}, 'box');
  const primaryColor = useThemeColor({}, 'primary');

  const handleChange = (name, value) => {
    if (error) setError(null);
    setFormData(prev => ({
      ...prev,
      [name]: name === 'username' ? value.replace(/\s/g, '') : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  const validateForm = () => {
    setError(null);
    const { username, password, email, phoneNumber } = formData;

    if (!username.trim()) {
      setError('Username is required');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (isSignup) {
      if (!email.trim()) {
        setError('Email is required');
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter a valid email');
        return false;
      }

      if (!phoneNumber.trim()) {
        setError('Phone number is required');
        return false;
      }

      if (!/^\+?\d{7,15}$/.test(phoneNumber.trim())) {
        setError('Invalid phone number format');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignup ? '/signup' : '/login';

      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        ...(isSignup && {
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        }),
      };

      const response = await apiClient.post(endpoint, payload);
      const resData = response.data || {};

      if (isSignup) {
        Alert.alert('Account created', 'You can now log in with your new account.');
        router.replace('/auth/login');
        return;
      }

      const { userId, role, token, username } = resData;
      if (!token || !userId) {
        throw new Error(resData.message || 'The server did not return a valid session.');
      }

      await SecureStore.setItemAsync('userId', String(userId));
      await SecureStore.setItemAsync('userRole', String(role || 'user'));
      await SecureStore.setItemAsync('authToken', String(token));
      await SecureStore.setItemAsync('username', String(username || formData.username.trim()));

      router.replace('/(tabs)/main');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Authentication failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={tw`flex-1 items-center pt-20`} backgroundColor={backgroundColor}>
      <Image source={logo} style={tw`h-30 w-40 pb-10`} resizeMode="contain" />

      <ThemedView style={tw`w-full px-10 mb-1 gap-4`}>
        {isSignup && (
          <>
            <TextInput
              style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
              placeholder="Email *"
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={placeholderColor}
            />

            <TextInput
              style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
              placeholder="Phone Number *"
              value={formData.phoneNumber}
              onChangeText={text => handleChange('phoneNumber', text)}
              keyboardType="phone-pad"
              placeholderTextColor={placeholderColor}
            />
          </>
        )}

        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
          placeholder="Username *"
          value={formData.username}
          onChangeText={text => handleChange('username', text)}
          autoCapitalize="none"
          placeholderTextColor={placeholderColor}
        />

        <View style={tw`relative`}>
          <TextInput
            style={[tw`h-12 px-5 pr-10 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
            placeholder="Password *"
            secureTextEntry={!isPasswordVisible}
            value={formData.password}
            onChangeText={text => handleChange('password', text)}
            autoCapitalize="none"
            placeholderTextColor={placeholderColor}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={tw`absolute right-0 top-0 h-12 w-12 justify-center items-center`}
          >
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={tw`w-full px-12 pt-3`}>
        <Pressable
          style={[
            tw`h-11 border rounded-md items-center justify-center`,
            loading
              ? tw`bg-gray-400 border-gray-300`
              : { backgroundColor: primaryColor, borderColor: boxColor },
          ]}
          onPress={handleAuth}
          disabled={loading}
        >
          <ThemedText style={tw`text-lg font-bold`} color={textColor}>
            {loading ? (isSignup ? 'Signing Up...' : 'Logging In...') : isSignup ? 'Sign Up' : 'Log In'}
          </ThemedText>
        </Pressable>

        {error && <ThemedText style={tw`text-red-500 text-center mt-2`}>{error}</ThemedText>}

        <ThemedText style={tw`text-center py-2 text-xs`} type="link">
          OR {isSignup ? 'SIGN UP' : 'LOGIN'} WITH
        </ThemedText>
      </ThemedView>

      <ThemedText type="link" style={tw`text-center`}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}
        <ThemedText
          type="default"
          style={tw`text-[#ff1493] text-xs`}
          onPress={() => router.push(isSignup ? '/auth/login' : '/auth/signup')}
        >
          {isSignup ? ' Log in' : ' Sign up'}
        </ThemedText>
      </ThemedText>
    </ThemedView>
  );
}
