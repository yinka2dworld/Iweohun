import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const logo = require('../../client/assets/images/logo.png');

export default function AuthForm({ type }) {
  const router = useRouter();
  const isSignup = type === 'signup';
  const [formData, setFormData] = useState({
    email: isSignup ? '' : '',
    username: '',
    password: '',
    phoneNumber: isSignup ? '' : '',
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
    let processedValue = value;
    
    if (name === 'username') {
      // Remove all spaces from username
      processedValue = value.replace(/\s/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  const validateForm = () => {
    setError(null);
    const { username, password, email, phoneNumber } = formData;

    // Username validation
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }

    // Password validation
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (isSignup) {
      // Email validation
      if (!email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }

      // Phone validation (if provided)
      if (phoneNumber && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phoneNumber)) {
        setError('Please enter a valid phone number');
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
          ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber.trim() })
        })
      };
  
      const response = await axios.post(`${apiUrl}${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
  
      if (response.data.message?.includes('successful')) {
        if (isSignup) {
          router.replace('/auth/login');
        } else {
          const { userId, role, token } = response.data;
  
          await SecureStore.setItemAsync('userId', userId.toString());
          await SecureStore.setItemAsync('userRole', role);
          await SecureStore.setItemAsync('authToken', token);
          await SecureStore.setItemAsync('username', username);
  
          router.replace('/(tabs)/main');
        }
      } else {
        throw new Error(response.data.message || 'Unexpected response');
      }
    } catch (err) {
      let errorMessage = 'Authentication failed. Please try again.';
  
      if (err.response?.data) {
        if (err.response.data.error?.code === 11000) {
          errorMessage = err.response.data.error.keyPattern.phoneNumber 
            ? 'Phone number already exists' 
            : 'Email already exists';
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
  
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ThemedView style={tw`flex-1 items-center pt-20`} backgroundColor={backgroundColor}>
      <Image source={logo} style={tw`h-40 w-42 mb-10`} resizeMode="contain" />
      
      <ThemedView style={tw`w-full px-10 mb-1 gap-4`}>
        {isSignup && (
          <>
            <TextInput
              style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
              placeholder="Email"
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={placeholderColor}
            />

            <TextInput
              style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
              placeholder="Phone Number (optional)"
              value={formData.phoneNumber}
              onChangeText={text => handleChange('phoneNumber', text)}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={placeholderColor}
            />
          </>
        )}
        
        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-lg`, { borderColor: boxColor, color: textColor }]}
          placeholder="Username"
          value={formData.username}
          onChangeText={text => handleChange('username', text)}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={placeholderColor}
        />
       
        <View style={tw`relative`}>
          <TextInput
            style={[tw`h-12 px-5 border rounded-md text-lg pr-10`, { borderColor: boxColor, color: textColor }]}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={formData.password}
            onChangeText={text => handleChange('password', text)}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={placeholderColor}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={tw`absolute right-0 top-0 h-12 w-12 justify-center items-center`}
            accessibilityLabel="Toggle password visibility"
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={24} 
              color={textColor} 
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={tw`w-full px-12`}>
        <Pressable
          style={[
            tw`h-11 border rounded-md items-center justify-center`, 
            loading ? tw`bg-gray-400 border-gray-300` : { 
              backgroundColor: primaryColor, 
              borderColor: boxColor 
            }
          ]}
          onPress={handleAuth}
          disabled={loading}
        >
          <ThemedText style={tw`text-lg font-bold`} color={textColor}>
            {loading 
              ? (isSignup ? 'Signing Up...' : 'Logging In...') 
              : isSignup ? 'Sign Up' : 'Log In'
            }
          </ThemedText>
        </Pressable>

        {error && (
          <ThemedText style={tw`text-red-500 text-center mt-2`}>
            {error}
          </ThemedText>
        )}

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