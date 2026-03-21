# Brick Breaker Dodge — config vs session flow

## Modes

1. **Config mode** — No `sessionId` in the URL. Loads `src/config/game/{name}.js` from `?config=` or falls back to `DEFAULT_CONFIG` in [`src/config/game/game-config.js`](../../src/config/game/game-config.js) (`dodge-zone`). Valid stems are listed in `CONFIG_REGISTRY`.

2. **Session mode** — `?sessionId=...` (optional `?mode=demo` or `?mode=real`). Boot calls `POST /provider/session` and merges `gameMetadata` into the runtime config (`theme`, `paytableId`, `creditValueMinor`, `match`, and other scratch-style fields when present). On failure, session is cleared and file config is loaded when possible.

## URL parameters

| Param | Purpose |
|--------|---------|
| `config` | Game config stem (e.g. `?config=kick-frenzy`). Read from `window` / `parent` / `top` for iframe runners. |
| `sessionId` | Provider session id. Same window/parent/top resolution. |
| `mode` | `demo` (default) or `real`; affects operator balance vs demo balance in registry. |

## Bootstrap order

1. `main.js` `load` (async): set `window.__selectedGameConfig` via `loadSelectedConfig()` + `mergeBreakerRuntimeConfig`, or session placeholder.
2. Phaser starts; **Boot** `create()` (async): optional session fetch; sets `preloadGameConfig` and session registry keys.
3. **Preload** loads `src/config/themes/{theme}.json` using `preloadGameConfig.theme`, then starts **Level** with `{ themeData }`.

## API base URL

- Localhost / `127.0.0.1`: `GameConfig.api.BASE_URL_LOCAL` (CORS proxy port from `__CORS_PROXY_PORT__`, see [`scripts/local-testing/ports.config.js`](../../scripts/local-testing/ports.config.js)).
- Otherwise: `GameConfig.api.BASE_URL_LIVE` (staging, aligned with scratch/Mines for `/provider/session`).

## Registry keys

| Key | Description |
|-----|-------------|
| `preloadGameConfig` | Resolved runtime object (theme, creditValueMinor, paytableId, match, …) |
| `preloadUseSessionConfig` | `true` when config came from session |
| `preloadSessionId` | Active session id |
| `preloadSessionMode` | `demo` or `real` |
| `preloadOperatorBalance` | Balance in **minor units** (pennies) |

## Default export `game-config.js`

`import gameConfig from './game-config.js'` is a **Proxy** to `window.__selectedGameConfig` after bootstrap.

## Level balance (optional)

`Level` sets `balancePennies` from the session registry or `TEST_BALANCE_MINOR` for future wallet UI. Arcade score gameplay does not use it yet.

## Wallet / buy API

Wiring authenticated buy endpoints and on-screen balance is a follow-up when backend routes are ready.
