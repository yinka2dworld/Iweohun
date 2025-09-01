import React from 'react';
import AudioPlayer from './AudioPlayer';
import { useAudio } from '@/context/AudioContext';

const AudioPlayerWrapper = () => {
  const { audioDetails } = useAudio();
  if (!audioDetails) return null;
  return <AudioPlayer />;
};

export default AudioPlayerWrapper;
