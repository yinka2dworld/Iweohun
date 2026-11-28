import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

/**
 * In development the API runs on the same machine as Metro, so we derive its
 * host from the URL the device used to load the JS bundle. This works for a
 * physical phone on the LAN, an Android emulator and the web.
 */
const getDevServerHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) return null;

  // hostUri looks like "192.168.1.10:8081", "exp://192.168.1.10:8081"
  // or "[::1]:8081".
  const withoutScheme = hostUri.replace(/^[a-z]+:\/\//i, '');

  if (withoutScheme.startsWith('[')) {
    const closingBracket = withoutScheme.indexOf(']');
    if (closingBracket !== -1) {
      return withoutScheme.slice(1, closingBracket);
    }
  }

  return withoutScheme.split(':')[0] || null;
};

const getDevApiHost = () => {
  const host = getDevServerHost();
  if (!host) return null;

  // Inside an Android emulator the host machine is reachable at 10.0.2.2,
  // not at localhost.
  if (Platform.OS === 'android' && ['localhost', '127.0.0.1', '::1'].includes(host)) {
    return '10.0.2.2';
  }

  return host;
};

const devHost = getDevApiHost();

const fallbackUrl = Platform.select({
  android: `http://10.0.2.2:${API_PORT}`,
  default: `http://localhost:${API_PORT}`,
});

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
const developmentUrl =
  __DEV__ &&
  configuredUrl &&
  devHost &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/|$)/i.test(configuredUrl)
    ? configuredUrl.replace(
        /^(https?:\/\/)(localhost|127\.0\.0\.1)/i,
        `$1${devHost}`
      )
    : configuredUrl;

/**
 * Base URL for the backend.
 *
 * - Local development: automatically `http://<metro-host>:3000`.
 * - Production/override: set `EXPO_PUBLIC_API_URL` (e.g. in `.env` or EAS).
 */
export const API_BASE_URL = (
  developmentUrl ||
  (devHost ? `http://${devHost}:${API_PORT}` : fallbackUrl)
).replace(/\/+$/, '');

export default API_BASE_URL;
