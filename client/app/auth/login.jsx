import React, { useState, useEffect } from 'react';
import { Alert, Image, Pressable, SafeAreaView, Switch, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { LOGIN } from '../../graphql/mutations';
import { useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../themeContext';


const logo = require("../../assets/logo.png");

export default function LoginForm() {
  const router = useRouter();
  const theme = useAppTheme();
 const [click, setClick] = useState(false); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  // const [login, { loading, error }] = useMutation(LOGIN);

  // useEffect(() => {
  //   // Check if there are stored credentials
  //   const loadCredentials = async () => {
  //     try {
  //       const savedUsername = await AsyncStorage.getItem('username');
  //       const savedPassword = await AsyncStorage.getItem('password');
  //       if (savedUsername && savedPassword) {
  //         setUsername(savedUsername);
  //         setPassword(savedPassword);
  //         setClick(true);
  //       }
  //     } catch (error) {
  //       console.log('Failed to load credentials', error);
  //     }
  //   };

  //   loadCredentials();
  // }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const { data } = await login({ variables: { loginuser: { username, password } } });
  //     console.log("Login successful", "You've logged in successfully");

  //     if (click) {
  //       // Save credentials if "Remember Me" is checked
  //       await AsyncStorage.setItem('username', username);
  //       await AsyncStorage.setItem('password', password);
  //     } else {
  //       // Remove credentials if "Remember Me" is not checked
  //       await AsyncStorage.removeItem('username');
  //       await AsyncStorage.removeItem('password');
  //     }

  //     router.push('/tab/home');
  //   } catch (error) {
  //     console.log('Login unsuccessful', error.message);
  //   }
  // };

  return (
    <SafeAreaView style={[tw`flex-1 items-center pt-20`, {backgroundColor: theme.background}]}>
      <Image source={logo} style={tw`h-40 w-42 mb-20 mt-20`} resizeMode='contain' />
      <View style={tw`w-full px-10 mb-1 gap-4`}>
        <TextInput
          style={[tw`h-12 px-5 border rounded-md text-black text-lg`, {borderColor:theme.placeholder}]}
          placeholder='USERNAME'
          placeholderTextColor= {theme.text}
          value={username}
          onChangeText={setUsername}
          autoCorrect={false}
          autoCapitalize='none'
        />
        <View style={tw`relative`}>
          <TextInput
            style={[tw`h-12 px-5 border rounded-md text-black text-lg pr-10`, {borderColor:theme.placeholder}]}
            placeholder='PASSWORD'
            placeholderTextColor={theme.placeholder}
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
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

      <View style={tw`w-full px-12 flex-row justify-between items-center mb-2 mt-2`}>
        <View style={tw`flex-row items-center`}>
          <Switch 
            value={click} 
            onValueChange={setClick} 
            trackColor={{ true: "#070c70", false: "gray" }} 
          />
          <Text style={[tw`text-xs ml-2`, {color:theme.link}]}>Remember Me</Text>
        </View>

        <Pressable onPress={() => Alert.alert("Forget Password!")}>
          <Text style={tw`text-xs text-[#ff1493]`} onPress={() => router.push('/auth/reset')} >Forgot Password?</Text>
        </Pressable>
      </View>

      <View style={tw`w-full px-12`}>
        <Pressable
          style={tw`bg-[#ff1493] h-11 border border-gray-400 rounded-md items-center justify-center`}
          // onPress={handleLogin}
          // disabled={loading}
        >
          <Text style={[tw` text-lg font-bold`, {color:theme.text}]}>
            {/* {loading ? 'Loading...' : 'Login'} */}
          </Text>
        </Pressable>

        {/* {error && (
          <Text style={tw`text-red-500 text-center mt-2`}>Login failed:
           {error.message} 
           </Text>
        )}*/}

        <Text style={[tw`text-center py-2 text-xs`, {color: theme.link}]}>OR LOGIN WITH</Text>
      </View>

      <Text style={[tw`text-center`, {color: theme.link}]}>
        Don't Have Account?
        <Text style={tw`text-[#ff1493] text-xs`} onPress={() => router.push('/auth/signup')}>
          {' '} Sign Up
        </Text>
      </Text>
    </SafeAreaView>
  );
}
