import React, { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import AudioPlayer from './AudioPlayer';
import { useAudio } from '@/context/AudioContext';
import { usePathname, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_CONTENT_HEIGHT } from '@/constants/layout';

const AudioPlayerWrapper = () => {
  const { audioDetails } = useAudio();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!audioDetails || isKeyboardVisible) return null;
  if (pathname === '/') return null;

  const bottomOffset = segments.includes('(tabs)')
    ? TAB_BAR_CONTENT_HEIGHT + insets.bottom
    : insets.bottom;

  return <AudioPlayer bottomOffset={bottomOffset} />;
};

export default AudioPlayerWrapper;
