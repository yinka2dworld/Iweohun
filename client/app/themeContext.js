import React from 'react';
import { useColorScheme } from 'react-native';

// Define the theme colors
const lightTheme = {
  background: '#f8f8f8',
  primary: '#ff1493',
  secondary: '#a6a6a6',
  text: '#070c70',
  placeholder: '#070c70',
  link: '#070c70',
  box: '#FFFFFFCC',
};

const darkTheme = {
  background: '#000000',
  primary: '#ff1493',
  secondary: '#a6a6a6',
  text: '#f8f8f8',
  placeholder: '#f8f8f8',
  link: '#f8f8f8',
  box: '#323232B3',
};

// Custom hook to use the appropriate theme
export const useAppTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};