# Iweohun

African audiobook platform.

- `client/` — Expo (React Native + Expo Router) app
- `server/` — Express + MongoDB API

## Prerequisites

- Node.js 20+
- npm
- A MongoDB database
- Expo Go (or a development build) for testing on a phone

## 1. Start the API

```bash
cd server
cp .env.example .env        # fill in DBURL and JWT_SECRET
npm install
npm run dev                 # http://localhost:3000
```

Verify it is running:

```bash
curl http://localhost:3000/health
```

Uploaded files are stored on Cloudinary when `CLOUD_NAME`, `API_KEY` and
`SECRET_KEY` are configured. Otherwise they are saved to `server/uploads` and
served from `/uploads`, so book creation works locally without cloud keys.

If an older database has nested `listenersList` arrays, normalize it once:

```bash
npm run migrate:listeners
npm run sync:indexes        # after changing unique/index definitions
```

## 2. Start the app

```bash
cd client
npm install
npx expo start
```

Open the app in Expo Go or a browser. The client automatically uses the host
that served the JS bundle and talks to port `3000` on that host.

### API URL rules

1. `EXPO_PUBLIC_API_URL` (recommended for production and custom setups)
2. `expo.extra.apiBaseUrl` in `client/app.json`
3. Development: Metro host + port `3000` (Android emulators use `10.0.2.2`)
4. Web: current browser host + port `3000`
5. `http://localhost:3000`

Set a value in `client/.env` only when you need to override the automatic
detection:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
```

Use the API origin only — the client adds `/api` itself.

## Production checklist

- Deploy the API behind HTTPS and set `PUBLIC_BASE_URL` to its public origin.
- Set `CORS_ORIGIN` to your web app origin(s); `*` is fine for native-only apps.
- Set `EXPO_PUBLIC_API_URL` for the client build (for example in EAS).
- Set real Cloudinary credentials if you want cloud uploads.
- Never commit `server/.env` or `client/.env`.

## API routes

Canonical routes live under `/api` (for example `GET /api/books`). The same
routes are also mounted at the root for compatibility with older app builds.
`GET /health` and `GET /api/health` are public.

## Troubleshooting

- **“Can't reach the server”** — confirm the API is running, the phone and
  computer are on the same network, and port `3000` is not blocked by a firewall.
- **Android emulator** — automatic detection maps `localhost` to `10.0.2.2`.
- **Custom host / tunnel** — set `EXPO_PUBLIC_API_URL` explicitly. A tunnel
  hostname only exposes Metro, not the API on port `3000`.
- **401 on every screen** — sign out and sign in again; expired sessions are
  cleared automatically and redirect to login.
