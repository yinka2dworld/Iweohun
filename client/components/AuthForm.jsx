import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/api';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const logo = require('../../client/assets/images/logo.png');

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

  const apiUrl = API_BASE_URL;

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const boxColor = useThemeColor({}, 'box');
  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceAltColor = useThemeColor({}, 'surfaceAlt');
  const mutedColor = useThemeColor({}, 'muted');
  const dangerColor = useThemeColor({}, 'danger');

  const handleChange = (name, value) => {
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

      if (phoneNumber && !/^\+?\d{7,15}$/.test(phoneNumber)) {
        setError('Invalid phone number format');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm() || !apiUrl) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignup ? '/signup' : '/login';

      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        ...(isSignup && {
          email: formData.email.trim(),
          ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber.trim() }),
        }),
      };

      const response = await axios.post(`${apiUrl}${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      const resData = response.data;

      if (resData.message?.includes('successful')) {
        if (isSignup) {
          router.replace('/auth/login');
        } else {
          const { userId, role, token, username } = resData;

          await SecureStore.setItemAsync('userId', userId.toString());
          await SecureStore.setItemAsync('userRole', role);
          await SecureStore.setItemAsync('authToken', token);
          await SecureStore.setItemAsync('username', username);

          router.replace('/(tabs)/main');
        }
      } else {
        throw new Error(resData.message || 'Unexpected response from server');
      }
    } catch (err) {
      let message = 'Authentication failed. Please try again.';

      if (err.response?.data) {
        const data = err.response.data;

        if (data.error?.code === 11000) {
          message = data.error.keyPattern?.phoneNumber
            ? 'Phone number already exists'
            : 'Email already exists';
        } else if (data.message) {
          message = data.message;
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[tw`flex-1 items-center pt-20`, { backgroundColor }]}>
      <Image source={logo} style={tw`h-30 w-40 pb-10`} resizeMode="contain" />

      <ThemedView style={tw`w-full px-10 mb-1 gap-4`}>
        {isSignup && (
          <>
            <TextInput
              style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor, backgroundColor: surfaceColor }]}
              placeholder="Email"
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={placeholderColor}
            />

            <TextInput
              style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor, backgroundColor: surfaceColor }]}
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChangeText={text => handleChange('phoneNumber', text)}
              keyboardType="phone-pad"
              placeholderTextColor={placeholderColor}
            />
          </>
        )}

        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor, backgroundColor: surfaceColor }]}
          placeholder="Username"
          value={formData.username}
          onChangeText={text => handleChange('username', text)}
          autoCapitalize="none"
          placeholderTextColor={placeholderColor}
        />

        <View style={tw`relative`}>
          <TextInput
            style={[tw`h-12 px-5 pr-10 border rounded-md text-lg`, { borderColor: boxColor, color: textColor, backgroundColor: surfaceColor }]}
            placeholder="Password"
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
            { backgroundColor: loading ? surfaceAltColor : primaryColor, borderColor: boxColor },
          ]}
          onPress={handleAuth}
          disabled={loading}
        >
          <ThemedText style={[tw`text-lg font-bold`, { color: loading ? mutedColor : onPrimaryColor }]}>
            {loading ? (isSignup ? 'Signing Up...' : 'Logging In...') : isSignup ? 'Sign Up' : 'Log In'}
          </ThemedText>
        </Pressable>

        {error && <ThemedText style={[tw`text-center mt-2`, { color: dangerColor }]}>{error}</ThemedText>}

        <ThemedText style={tw`text-center py-2 text-xs`} type="link">
          OR {isSignup ? 'SIGN UP' : 'LOGIN'} WITH
        </ThemedText>
      </ThemedView>

      <ThemedText type="link" style={tw`text-center`}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}
        <ThemedText
          type="default"
          style={tw`text-xs`}
          onPress={() => router.push(isSignup ? '/auth/login' : '/auth/signup')}
        >
          {isSignup ? ' Log in' : ' Sign up'}
        </ThemedText>
      </ThemedText>
    </ThemedView>
  );
}
