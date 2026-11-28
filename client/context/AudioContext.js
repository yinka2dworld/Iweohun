import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext();

const PERSIST_KEY = 'audio_state_v1';
const PENDING_DOWNLOADS_KEY = 'audio_pending_downloads_v1';
const DOWNLOADS_DIR = FileSystem.documentDirectory + 'downloads/';
const BACKGROUND_TASK_NAME = 'AUDIO_DOWNLOAD_TASK_V1';
const IS_EXPO_GO = Constants.appOwnership === 'expo';
const PLAYER_LOAD_TIMEOUT_MS = 20000;
// Writing the persisted position on every 500ms status tick is wasteful, so
// writes are throttled to at most once every few seconds.
const PERSIST_THROTTLE_MS = 3000;

if (__DEV__ && IS_EXPO_GO) {
  console.warn('Background playback and lock-screen controls require a development build; Expo Go does not include this app audio service.');
}

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
    const raw = await AsyncStorage.getItem(PENDING_DOWNLOADS_KEY);
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
    await AsyncStorage.setItem(PENDING_DOWNLOADS_KEY, JSON.stringify(pending));
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (err) {
    console.warn('BG task error', err);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const AudioProvider = ({ children }) => {
  const playerRef = useRef(null);
  const statusSubRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const persistTimerRef = useRef(null);
  const lastPersistRef = useRef(0);
  const lastSnapshotRef = useRef({
    audioDetails: undefined,
    isPlaying: undefined,
    playbackRate: undefined,
    downloadState: undefined,
  });

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
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
          shouldRouteThroughEarpiece: false,
        });

        await ensureDownloadsDir();

        const raw = await AsyncStorage.getItem(PERSIST_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.audioDetails) {
            setAudioDetails(parsed.audioDetails);
            setPositionMillis(parsed.positionMillis || 0);
            setPlaybackRate(parsed.playbackRate || 1.0);
            setDownloadState(parsed.downloadState || null);
            setLoading(true);
          }
        }
      } catch (e) {
        console.warn('Audio init error', e);
      } finally {
        setIsRestored(true);
      }
    })();
  }, []);

  // persist state (throttled so playback progress does not hammer storage)
  useEffect(() => {
    if (!isRestored) return undefined;

    const snapshot = {
      audioDetails,
      positionMillis,
      isPlaying,
      playbackRate,
      downloadState,
    };

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    // Track/state changes are persisted right away; only playback progress is
    // throttled so that resuming after an app restart is still accurate.
    const previous = lastSnapshotRef.current;
    const isImportantChange =
      previous.audioDetails !== audioDetails ||
      previous.isPlaying !== isPlaying ||
      previous.playbackRate !== playbackRate ||
      previous.downloadState !== downloadState;

    const elapsed = Date.now() - lastPersistRef.current;
    const delay = isImportantChange ? 0 : Math.max(0, PERSIST_THROTTLE_MS - elapsed);

    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      lastPersistRef.current = Date.now();
      lastSnapshotRef.current = { audioDetails, isPlaying, playbackRate, downloadState };
      AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot)).catch((e) => {
        console.warn('Persist error', e);
      });
    }, delay);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [audioDetails, positionMillis, isPlaying, playbackRate, downloadState, isRestored]);

  // background task registration
  useEffect(() => {
    (async () => {
      try {
        const status = await BackgroundTask.getStatusAsync();
        if (status === BackgroundTask.BackgroundTaskStatus.Available) {
          await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
            minimumInterval: 30,
          });
        }
      } catch (e) {
        console.warn('Background task register failed', e);
      }
    })();
  }, []);

  /**
   * Fully tears down the active player.
   *
   * IMPORTANT: expo-audio's `player.remove()` only unregisters the player from
   * the native registry. It does NOT stop playback (especially on iOS), so the
   * previous track would keep playing in the background when a new one starts.
   * Pausing first guarantees the old audio actually stops.
   */
  const releasePlayer = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (statusSubRef.current) {
      try {
        statusSubRef.current.remove();
      } catch (error) {
        console.warn('Error removing playback listener', error);
      }
      statusSubRef.current = null;
    }

    const player = playerRef.current;
    playerRef.current = null;

    if (!player) return;

    // Stop playback before releasing the native player.
    try {
      player.pause();
    } catch (error) {
      console.warn('Error pausing audio player', error);
    }
    try {
      player.clearLockScreenControls();
    } catch (error) {
      console.warn('Error clearing audio lock screen controls', error);
    }
    try {
      player.remove();
    } catch (error) {
      console.warn('Error releasing audio player', error);
    }
  }, []);

  const handleLoadFailure = useCallback(() => {
    // A newer player may have been created before this deferred failure runs.
    if (playerRef.current) return;
    setLoading(false);
    setIsPlaying(false);
  }, []);

  // playback status handler
  const onPlaybackStatus = useCallback((status, player) => {
    if (!status) return;
    if (!status.isLoaded) {
      if (status.error) {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        setLoading(false);
        setIsPlaying(false);
      }
      return;
    }

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setLoading(false);
    setDurationMillis(status.duration > 0 ? status.duration * 1000 : 1);
    setPositionMillis(status.currentTime * 1000);
    setIsPlaying(status.playing);

    // Apply a restored/pending seek once the player has actually loaded.
    if (pendingSeekRef.current != null) {
      const target = pendingSeekRef.current;
      pendingSeekRef.current = null;
      if (target > 0) {
        setPositionMillis(target);
        player.seekTo(target / 1000).catch(() => {});
      }
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMillis(0);
      player.seekTo(0).catch(() => {});
    }
  }, []);

  // The source currently selected for playback. A downloaded copy is only used
  // when it belongs to the track that is actually loaded (a stale download from
  // a previously played chapter must never be used).
  const remoteUri = audioDetails?.audioUrl || null;
  const activeLocalUri =
    downloadState && downloadState.remoteUri === remoteUri ? downloadState.localUri : null;
  const sourceUri = activeLocalUri || remoteUri;

  // load/unload player when the selected track or its resolved source changes
  useEffect(() => {
    if (!isRestored) return undefined;

    if (!sourceUri) {
      releasePlayer();
      return undefined;
    }

    releasePlayer();

    // Set the pending seek before the player exists so the very first status
    // update (which can arrive quickly) already knows where to resume from.
    pendingSeekRef.current = positionMillis > 0 ? positionMillis : null;

    let player;
    try {
      player = createAudioPlayer({ uri: sourceUri }, { updateInterval: 500 });
      playerRef.current = player;

      // Never leave the UI stuck on a spinner if the source fails to load.
      loadingTimeoutRef.current = setTimeout(() => {
        loadingTimeoutRef.current = null;
        setLoading(false);
      }, PLAYER_LOAD_TIMEOUT_MS);

      statusSubRef.current = player.addListener('playbackStatusUpdate', (status) => {
        // Ignore late events from a player that has already been replaced.
        if (playerRef.current !== player) return;
        onPlaybackStatus(status, player);
      });

      if (playbackRate !== 1.0) {
        try {
          player.setPlaybackRate(playbackRate);
        } catch (error) {
          console.warn('Error applying playback rate', error);
        }
      }

      if (!IS_EXPO_GO) {
        try {
          player.setActiveForLockScreen(
            true,
            {
              title: audioDetails?.chapterTitle || 'Audiobook',
              artist: audioDetails?.book?.bookAuthor || 'Iweohun',
              albumTitle: audioDetails?.book?.bookName,
              artworkUrl: audioDetails?.book?.bookCover,
            },
            {
              showSeekBackward: true,
              showSeekForward: true,
              seekBackwardIntervalSeconds: 10,
              seekForwardIntervalSeconds: 10,
            }
          );
        } catch (error) {
          console.warn('Unable to activate audio lock screen controls', error);
        }
      }

      if (isPlaying) {
        player.play();
      }
    } catch (err) {
      console.warn('Error loading audio', err);
      releasePlayer();
      // Defer the state reset so it does not cascade synchronously from the effect.
      setTimeout(handleLoadFailure, 0);
    }

    return releasePlayer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceUri, audioDetails, isRestored, releasePlayer, onPlaybackStatus, handleLoadFailure]);

  // actions
  const playChapter = useCallback(
    async ({ audioUrl, chapterTitle, book } = {}) => {
      if (!audioUrl) {
        console.warn('playChapter called without an audio url');
        return;
      }

      try {
        const currentBookId = audioDetails?.book?._id;
        const selectedBookId = book?._id;
        const isSameBook = currentBookId && selectedBookId
          ? String(currentBookId) === String(selectedBookId)
          : audioDetails?.book === book;
        const isSameTrack = audioDetails?.audioUrl === audioUrl
          && audioDetails?.chapterTitle === chapterTitle
          && isSameBook;

        if (isSameTrack && playerRef.current) {
          if (playerRef.current.playing) {
            playerRef.current.pause();
            setIsPlaying(false);
          } else {
            playerRef.current.play();
            setIsPlaying(true);
          }
          return;
        }

        // Stop the previous track immediately, before the new player is created.
        releasePlayer();

        setAudioDetails({ audioUrl, chapterTitle, book });
        setDownloadState((prev) => (prev && prev.remoteUri === audioUrl ? prev : null));
        setPositionMillis(0);
        setDurationMillis(1);
        setLoading(true);
        setIsPlaying(true);
      } catch (e) {
        console.warn('playChapter error', e);
        setLoading(false);
        setIsPlaying(false);
      }
    },
    [audioDetails, releasePlayer]
  );

  const pause = useCallback(async () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
      }
      setIsPlaying(false);
    } catch (e) {
      console.warn('pause error', e);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      if (playerRef.current) {
        playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('resume error', e);
    }
  }, []);

  const stopAndUnload = useCallback(async () => {
    try {
      releasePlayer();
      pendingSeekRef.current = null;
      setAudioDetails(null);
      setDownloadState(null);
      setIsPlaying(false);
      setLoading(false);
      setPositionMillis(0);
      setDurationMillis(1);
    } catch (e) {
      console.warn('stopAndUnload error', e);
    }
  }, [releasePlayer]);

  const seekTo = useCallback(async (ms) => {
    try {
      if (playerRef.current) {
        await playerRef.current.seekTo(ms / 1000);
        setPositionMillis(ms);
      }
    } catch (e) {
      console.warn('seek error', e);
    }
  }, []);

  const setRate = useCallback(async (rate) => {
    try {
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(rate);
      }
      setPlaybackRate(rate);
    } catch (e) {
      console.warn('setRate error', e);
    }
  }, []);

  const downloadCurrent = useCallback(async (remoteUri) => {
    try {
      if (!remoteUri) return { success: false };
      setDownloadState({ status: 'downloading', remoteUri, localUri: null });
      await ensureDownloadsDir();
      const filename = `${Date.now()}_${encodeURIComponent(remoteUri).slice(-60)}`;
      const dest = DOWNLOADS_DIR + filename;

      const res = await FileSystem.downloadAsync(remoteUri, dest);
      if (res?.uri) {
        const localUri = res.uri;
        setDownloadState({ status: 'done', remoteUri, localUri });

        let pendingRaw = await AsyncStorage.getItem(PENDING_DOWNLOADS_KEY);
        let pending = pendingRaw ? JSON.parse(pendingRaw) : [];
        pending = pending.filter((p) => p.remoteUri !== remoteUri);
        await AsyncStorage.setItem(PENDING_DOWNLOADS_KEY, JSON.stringify(pending));
        return { success: true, localUri };
      }
      throw new Error('No uri from download');
    } catch (err) {
      console.warn('download error', err);
      try {
        let pendingRaw = await AsyncStorage.getItem(PENDING_DOWNLOADS_KEY);
        let pending = pendingRaw ? JSON.parse(pendingRaw) : [];
        pending.push({ remoteUri, localUri: null, createdAt: Date.now() });
        await AsyncStorage.setItem(PENDING_DOWNLOADS_KEY, JSON.stringify(pending));
        setDownloadState({ status: 'pending', remoteUri, localUri: null });
      } catch (e) {
        console.warn('failed adding pending download', e);
      }
      return { success: false };
    }
  }, []);

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
