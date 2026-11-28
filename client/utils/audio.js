import { createAudioPlayer } from 'expo-audio';

/**
 * Reads the duration of an audio file with expo-audio and returns it as `mm:ss`.
 * Falls back to `00:00` if the duration cannot be determined.
 */
export const getAudioDuration = async (uri, timeoutMs = 15000) => {
  let player;
  try {
    player = createAudioPlayer({ uri }, { updateInterval: 100 });

    const seconds = await new Promise((resolve) => {
      let settled = false;
      let subscription = null;
      let timer = null;

      const finish = (value) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        if (subscription) subscription.remove();
        resolve(value);
      };

      subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status?.isLoaded && status.duration > 0) {
          finish(status.duration);
        }
      });

      timer = setTimeout(() => finish(player.duration || 0), timeoutMs);

      // In case the player loaded before the listener was attached.
      if (player.isLoaded && player.duration > 0) {
        finish(player.duration);
      }
    });

    if (!seconds || !Number.isFinite(seconds)) return '00:00';

    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  } catch (error) {
    console.warn('Error calculating audio duration:', error);
    return '00:00';
  } finally {
    // `remove()` alone does not stop playback, so pause before releasing.
    try {
      player?.pause();
    } catch {}
    try {
      player?.remove();
    } catch {}
  }
};
