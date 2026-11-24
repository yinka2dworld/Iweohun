import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { isRunningInExpoGo } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext();

const PERSIST_KEY = 'audio_state_v1';
const DOWNLOADS_DIR = `${FileSystem.documentDirectory || ''}downloads/`;
const BACKGROUND_TASK_NAME = 'AUDIO_DOWNLOAD_TASK_V1';

// helper
const ensureDownloadsDir = async () => {
  if (Platform.OS === 'web') return;
  try {
    const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
    }
  } catch (e) {
    console.warn('ensureDownloadsDir error', e);
  }
};

// background task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const raw = await AsyncStorage.getItem('audio_pending_downloads_v1');
    const pending = raw ? JSON.parse(raw) : [];
    for (const item of pending) {
      if (!item.localUri && item.remoteUri) {
        try {
          await ensureDownloadsDir();
          const filename = `${Date.now()}_${encodeURIComponent(item.remoteUri).slice(-60)}`;
          const dest = DOWNLOADS_DIR + filename;
          const res = await FileSystem.downloadAsync(item.remoteUri, dest);
          item.localUri = res?.uri;
        } catch (e) {
          console.warn('Background download failed for', item.remoteUri, e);
        }
      }
    }
    await AsyncStorage.setItem('audio_pending_downloads_v1', JSON.stringify(pending));
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (err) {
    console.warn('BG task error', err);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const AudioProvider = ({ children }) => {
  const soundRef = useRef(null);
  const subRef = useRef(null);
  const [audioDetails, setAudioDetails] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [loading, setLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [downloadState, setDownloadState] = useState(null);
  const [isRestored, setIsRestored] = useState(false);

  // Tear down the current expo-audio player and its status subscription.
  const teardownPlayer = () => {
    try {
      if (subRef.current) {
        subRef.current.remove();
        subRef.current = null;
      }
    } catch {}
    try {
      if (soundRef.current) {
        soundRef.current.remove();
        soundRef.current = null;
      }
    } catch {}
  };

  // init audio mode
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          shouldPlayInBackground: true,
          interruptionMode: 'mixWithOthers',
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
        });

        await ensureDownloadsDir();

        const raw = await AsyncStorage.getItem(PERSIST_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.audioDetails) {
            setAudioDetails(parsed.audioDetails);
            setPositionMillis(parsed.positionMillis || 0);
            setIsPlaying(parsed.isPlaying || false);
            setPlaybackRate(parsed.playbackRate || 1.0);
            setDownloadState(parsed.downloadState || null);
          }
        }
      } catch (e) {
        console.warn('Audio init error', e);
      } finally {
        setIsRestored(true);
      }
    })();
  }, []);

  // persist state
  useEffect(() => {
    (async () => {
      try {
        const toSave = {
          audioDetails,
          positionMillis,
          isPlaying,
          playbackRate,
          downloadState,
        };
        await AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.warn('Persist error', e);
      }
    })();
  }, [audioDetails, positionMillis, isPlaying, playbackRate, downloadState]);

  // background task registration
  useEffect(() => {
    (async () => {
      // Background tasks are not supported inside Expo Go or on web; skip
      // registration there so we don't trigger availability warnings.
      if (Platform.OS === 'web' || isRunningInExpoGo()) return;
      try {
        const status = await BackgroundTask.getStatusAsync();
        if (status === BackgroundTask.BackgroundTaskStatus.Available) {
          await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
            minimumInterval: 30, // minutes — system-controlled, min 15
          });
        }
      } catch (e) {
        console.warn('Background task register failed', e);
      }
    })();
  }, []);

  // load/unload sound when audioDetails changes
  useEffect(() => {
    if (!isRestored) return;
    let isActive = true;
    (async () => {
      if (!audioDetails) {
        teardownPlayer();
        setIsPlaying(false);
        setPositionMillis(0);
        return;
      }

      setLoading(true);

      teardownPlayer();

      try {
        const { audioUrl } = audioDetails;
        const source = downloadState?.localUri
          ? { uri: downloadState.localUri }
          : { uri: audioUrl };

        const player = createAudioPlayer(source, { updateInterval: 250 });

        if (!isActive) {
          try {
            player.remove();
          } catch {}
          return;
        }

        soundRef.current = player;
        subRef.current = player.addListener('playbackStatusUpdate', onPlaybackStatus);

        player.setPlaybackRate(playbackRate);

        if (isPlaying) {
          player.play();
        }

        if (positionMillis > 0) {
          try {
            await player.seekTo(positionMillis / 1000);
          } catch {}
        }

        setLoading(false);
      } catch (err) {
        console.warn('Error loading audio', err);
        setLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [audioDetails, isRestored, downloadState]);

  // status handler — expo-audio reports seconds; the UI consumes milliseconds
  const onPlaybackStatus = (status) => {
    if (!status) return;
    if (status.isLoaded) {
      setPositionMillis(Math.round((status.currentTime || 0) * 1000));
      setDurationMillis(Math.round((status.duration || 0) * 1000) || 1);
      setIsPlaying(status.playing || false);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPositionMillis(0);
      }
    } else if (status.error) {
      console.warn('Playback status error:', status.error);
    }
  };

  // actions (play, pause, etc.) same as before...
  const playChapter = async ({ audioUrl, chapterTitle, book }) => {
    try {
      setLoading(true);
      if (audioDetails?.audioUrl === audioUrl && soundRef.current) {
        if (soundRef.current.playing) {
          soundRef.current.pause();
          setIsPlaying(false);
        } else {
          soundRef.current.play();
          setIsPlaying(true);
        }
        setLoading(false);
        return;
      }
      setAudioDetails({ audioUrl, chapterTitle, book });
      setIsPlaying(true);
    } catch (e) {
      console.warn('playChapter error', e);
      setLoading(false);
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current) {
        soundRef.current.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('pause error', e);
    }
  };

  const resume = async () => {
    try {
      if (soundRef.current) {
        soundRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('resume error', e);
    }
  };

  const stopAndUnload = async () => {
    try {
      if (soundRef.current) {
        const status = soundRef.current.currentStatus;
        if (status?.isLoaded) {
          setPositionMillis(Math.round((status.currentTime || 0) * 1000));
        }
        teardownPlayer();
      }
      setAudioDetails(null);
      setIsPlaying(false);
      setPositionMillis(0);
      setDurationMillis(1);
    } catch (e) {
      console.warn('stopAndUnload error', e);
    }
  };

  const seekTo = async (ms) => {
    try {
      if (soundRef.current) {
        await soundRef.current.seekTo(ms / 1000);
        setPositionMillis(ms);
      }
    } catch (e) {
      console.warn('seek error', e);
    }
  };

  const setRate = async (rate) => {
    try {
      if (soundRef.current) {
        soundRef.current.setPlaybackRate(rate, 'high');
      }
      setPlaybackRate(rate);
    } catch (e) {
      console.warn('setRate error', e);
    }
  };

  const downloadCurrent = async (remoteUri) => {
    if (Platform.OS === 'web') {
      return { success: false, reason: 'downloads-unsupported-on-web' };
    }
    try {
      if (!remoteUri) return { success: false };
      setDownloadState({ status: 'downloading', localUri: null });
      await ensureDownloadsDir();
      const filename = `${Date.now()}_${encodeURIComponent(remoteUri).slice(-60)}`;
      const dest = DOWNLOADS_DIR + filename;

      const res = await FileSystem.downloadAsync(remoteUri, dest);
      if (res?.uri) {
        const localUri = res.uri;
        setDownloadState({ status: 'done', localUri });

        let pendingRaw = await AsyncStorage.getItem('audio_pending_downloads_v1');
        let pending = pendingRaw ? JSON.parse(pendingRaw) : [];
        pending = pending.filter((p) => p.remoteUri !== remoteUri);
        await AsyncStorage.setItem('audio_pending_downloads_v1', JSON.stringify(pending));
        return { success: true, localUri };
      }
      throw new Error('No uri from download');
    } catch (err) {
      console.warn('download error', err);
      try {
        let pendingRaw = await AsyncStorage.getItem('audio_pending_downloads_v1');
        let pending = pendingRaw ? JSON.parse(pendingRaw) : [];
        pending.push({ remoteUri, localUri: null, createdAt: Date.now() });
        await AsyncStorage.setItem('audio_pending_downloads_v1', JSON.stringify(pending));
        setDownloadState({ status: 'pending', localUri: null });
      } catch (e) {
        console.warn('failed adding pending download', e);
      }
      return { success: false };
    }
  };

  const value = {
    audioDetails,
    isPlaying,
    loading,
    positionMillis,
    durationMillis,
    playbackRate,
    downloadState,
    playChapter,
    pause,
    resume,
    stopAndUnload,
    seekTo,
    setRate,
    downloadCurrent,
  };

  // release the player when the provider unmounts
  useEffect(() => () => teardownPlayer(), []);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => useContext(AudioContext);
export default AudioContext;


