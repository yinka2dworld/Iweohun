#!/usr/bin/env node
/**
 * Patches expo-audio's Android playback service so that audio stops when the
 * app is dismissed from the recents screen ("closed").
 *
 * Why this is needed:
 * expo-audio's `AudioControlsService` extends Media3's `MediaSessionService`.
 * Media3's default `onTaskRemoved` keeps playback running while the service is
 * in the foreground, so swiping the app away leaves the audiobook playing. We
 * override `onTaskRemoved` to pause playback and stop the service.
 *
 * Background playback while the app is merely minimized is unaffected.
 *
 * This runs from the `postinstall` script so the patch survives reinstalls.
 * It is idempotent and fails soft: if expo-audio changes shape, the install
 * still succeeds and a warning is printed.
 */
const fs = require('fs');
const path = require('path');

const MARKER = 'Iweohun: stop playback when the app is removed from recents';

const SERVICE_RELATIVE_PATH = path.join(
  'android',
  'src',
  'main',
  'java',
  'expo',
  'modules',
  'audio',
  'service',
  'AudioControlsService.kt'
);

const TASK_REMOVED_OVERRIDE = `  // ${MARKER}
  // Media3's default keeps playing while the foreground service is active, so
  // audio survived the app being swiped away from recents. Pause explicitly
  // and stop the service instead.
  override fun onTaskRemoved(rootIntent: Intent?) {
    currentPlayable?.player?.pause()
    try {
      pauseAllPlayersAndStopSelf()
    } catch (error: Exception) {
      stopSelf()
    }
  }
`;

function resolveExpoAudioServicePath() {
  try {
    const packageJsonPath = require.resolve('expo-audio/package.json');
    return path.join(path.dirname(packageJsonPath), SERVICE_RELATIVE_PATH);
  } catch {
    return null;
  }
}

function main() {
  const servicePath =
    resolveExpoAudioServicePath() ||
    path.join(process.cwd(), 'node_modules', 'expo-audio', SERVICE_RELATIVE_PATH);

  if (!fs.existsSync(servicePath)) {
    console.warn('[patch-expo-audio] AudioControlsService.kt not found; skipping.');
    return;
  }

  const source = fs.readFileSync(servicePath, 'utf8');

  if (source.includes(MARKER) || source.includes('override fun onTaskRemoved')) {
    return;
  }

  const anchor = '  override fun onDestroy() {';
  if (!source.includes(anchor)) {
    console.warn(
      '[patch-expo-audio] Could not find the onDestroy() anchor in AudioControlsService.kt. ' +
        'The installed expo-audio version may have changed; skipping.'
    );
    return;
  }

  const patched = source.replace(anchor, `${TASK_REMOVED_OVERRIDE}\n${anchor}`);
  fs.writeFileSync(servicePath, patched);
  console.log(
    '[patch-expo-audio] Audio playback will now stop when the app is closed.'
  );
}

main();
