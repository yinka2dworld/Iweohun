import React, { useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { SIGNUP } from "../../graphql/mutations.js";
import { useMutation } from '@apollo/client';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../themeContext.js';

const logo = require("../../assets/logo.png");

export default function SignupForm() {
  const theme = useAppTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  // const [signup, { loading, error }] = useMutation(SIGNUP);

  // const handleChange = (name, value) => {
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  // const handleSignup = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const { data } = await signup({ variables: { adduser: { ...formData } } });
  //    console.log('Signed up successfully', 'You can now log in');
  //     router.push('/auth/login');
  //   } catch (error) {
  //     console.log('Signup error', error.message);
  //   }
  // };

  return (
    <SafeAreaView style={[tw`flex-1 items-center pt-20`, {backgroundColor: theme.background}]}>
      <Image source={logo} style={tw`h-40 w-42 mb-20 mt-20`} resizeMode='contain' />
      <View style={tw`w-full px-10 mb-1 gap-4`}>
        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-black text-lg`, {borderColor:theme.placeholder}]}
          placeholder='EMAIL'
          placeholderTextColor={theme.text}
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          autoCorrect={false}
          autoCapitalize='none'
        />
        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-black text-lg`, {borderColor:theme.placeholder}]}
          placeholder='USERNAME'
          placeholderTextColor={theme.text}
          value={formData.username}
          onChangeText={(text) => handleChange('username', text)}
          autoCorrect={false}
          autoCapitalize='none'
        />
        <View style={tw`relative`}>
          <TextInput
            style={[tw`h-12 px-5 border rounded-md text-black text-lg pr-10`, {borderColor:theme.placeholder}]}
            placeholder='PASSWORD'
            placeholderTextColor={theme.text}
            secureTextEntry={!isPasswordVisible}
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            autoCorrect={false}
            autoCapitalize='none'
          />
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={tw`absolute right-0 top-0 h-12 w-12 justify-center items-center`}
          >
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={theme.placeholder} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`w-full px-12`}>
        <Pressable
          style={tw`bg-[#ff1493] h-11 border border-gray-400 rounded-md items-center justify-center`}
          // onPress={handleSignup}
          // disabled={loading}
        >
          <Text style={[tw` text-lg font-bold`, {color:theme.text}]}>
            {/* {loading ? 'Loading...' : 'Sign Up'} */}
          </Text>
        </Pressable>

        {/* {error && (
          <Text style={tw`text-red-500 text-center mt-2`}>Signup failed: {error.message}</Text>
        )} */}

        <Text style={[tw`text-center py-2 text-xs`, {color: theme.link}]}>OR SIGN UP WITH</Text>
      </View>
      <Text style={[tw`text-center`, {color: theme.link}]}>
        Have An Account?
        <Text style={tw`text-[#ff1493] text-xs`} onPress={() => router.push('/auth/login')}>
          {' '} Login
        </Text>
      </Text>
    </SafeAreaView>
  );
}
