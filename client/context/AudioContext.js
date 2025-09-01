import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext();

const PERSIST_KEY = 'audio_state_v1';
const DOWNLOADS_DIR = FileSystem.documentDirectory + 'downloads/';
const BACKGROUND_TASK_NAME = 'AUDIO_DOWNLOAD_TASK_V1';

// helper
const ensureDownloadsDir = async () => {
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
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.warn('BG task error', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const AudioProvider = ({ children }) => {
  const soundRef = useRef(null);
  const [audioDetails, setAudioDetails] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [loading, setLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [downloadState, setDownloadState] = useState(null);
  const [isRestored, setIsRestored] = useState(false);

  // init audio mode
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS, // ✅ fixed constant
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
          playThroughEarpieceAndroid: false,
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

  // background fetch registration
  useEffect(() => {
    (async () => {
      try {
        const status = await BackgroundFetch.getStatusAsync();
        if (status === BackgroundFetch.Status.Available) {
          await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
            minimumInterval: 60 * 30,
            stopOnTerminate: false,
            startOnBoot: true,
          });
        }
      } catch (e) {
        console.warn('Background fetch register failed', e);
      }
    })();
  }, []);

  // load/unload sound when audioDetails changes
  useEffect(() => {
    if (!isRestored) return;
    let isActive = true;
    (async () => {
      if (!audioDetails) {
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch {}
          soundRef.current = null;
        }
        setIsPlaying(false);
        setPositionMillis(0);
        return;
      }

      setLoading(true);

      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }

      try {
        const { audioUrl } = audioDetails;
        const source = downloadState?.localUri
          ? { uri: downloadState.localUri }
          : { uri: audioUrl };

        const creation = await Audio.Sound.createAsync(
          source,
          { shouldPlay: isPlaying, rate: playbackRate },
          onPlaybackStatus
        );

        if (!isActive) {
          if (creation.sound) await creation.sound.unloadAsync();
          return;
        }

        soundRef.current = creation.sound;

        if (positionMillis > 0) {
          try {
            await soundRef.current.setPositionAsync(positionMillis);
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

  // status handler
  const onPlaybackStatus = (status) => {
    if (!status) return;
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis || 0);
      setDurationMillis(status.durationMillis || 1);
      setIsPlaying(status.isPlaying || false);
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
        const st = await soundRef.current.getStatusAsync();
        if (st.isLoaded) {
          if (st.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
          setLoading(false);
          return;
        }
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
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('pause error', e);
    }
  };

  const resume = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('resume error', e);
    }
  };

  const stopAndUnload = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status?.isLoaded) {
          setPositionMillis(status.positionMillis || 0);
        }
        await soundRef.current.unloadAsync();
        soundRef.current = null;
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
        await soundRef.current.setPositionAsync(ms);
        setPositionMillis(ms);
      }
    } catch (e) {
      console.warn('seek error', e);
    }
  };

  const setRate = async (rate) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setRateAsync(rate, true);
      }
      setPlaybackRate(rate);
    } catch (e) {
      console.warn('setRate error', e);
    }
  };

  const downloadCurrent = async (remoteUri) => {
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

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => useContext(AudioContext);
export default AudioContext;


