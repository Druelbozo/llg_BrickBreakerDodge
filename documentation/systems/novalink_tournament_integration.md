# Novalink Tournament SDK integration

This document summarizes how [Novalink’s Tournament SDK](https://stage.novalink.gg/sdk/example.html) is wired into Brick Breaker Dodge: configuration, runtime bootstrap, gameplay hooks, and local development (CORS proxy + `fetch` rewrite).

## Overview

- The SDK script is loaded globally from `https://novalink.gg/sdk/tournament-sdk-v1.js` in [`index.html`](../../index.html).
- **`gameId`** is defined per game variant in [`src/config/game/*.js`](../../src/config/game/) and merged into runtime config (including session `gameMetadata.gameId`). Shared defaults live in [`src/config/Global.js`](../../src/config/Global.js) under `GameConfig.novalink`.
- The SDK is **constructed** after the final merged config is known in **`Boot.create()`**, then the **tournament UI** is shown when **`Level`** finishes `create()`. **Score submission** is called on **`onGameOver`** when the deployed SDK exposes `submitScore` (not present on the bundle we verified; the wrapper is forward-compatible).

## Source files

| Area | File |
|------|------|
| Defaults (`providerId`, `brandId`, `currency`, `env`, `style`, …) | [`src/config/Global.js`](../../src/config/Global.js) → `GameConfig.novalink` |
| Per-variant `gameId` | [`src/config/game/dodge-zone.js`](../../src/config/game/dodge-zone.js), [`src/config/game/kick-frenzy.js`](../../src/config/game/kick-frenzy.js) |
| Merge `gameId` from file + session metadata | [`src/main.js`](../../src/main.js) → `mergeBreakerRuntimeConfig` |
| Init SDK instance | [`src/main.js`](../../src/main.js) → `Boot.create()` calls `initNovalinkTournamentSdk(config, providerSession?)` |
| Show overlay + submit score | [`src/scenes/Level.js`](../../src/scenes/Level.js) → `showNovalinkTournamentOverlay()`, `submitNovalinkTournamentScore()` |
| Integration helpers | [`src/services/novalink/tournamentSdk.js`](../../src/services/novalink/tournamentSdk.js) |
| Local Novalink forwarding | [`scripts/local-testing/cors-proxy.js`](../../scripts/local-testing/cors-proxy.js) |

## Runtime behavior

### SDK API vs example page

The public script’s entry for showing the UI is **`init()`** (authenticate, then `loadAvailableTournaments()`, which mounts the overlay). The stage **example** sometimes documents **`showOverlay()`**; our helper calls **`showOverlay()`** if it exists, otherwise **`init()`**. See [`tournamentSdk.js`](../../src/services/novalink/tournamentSdk.js).

### Bootstrap order

1. **`window.__selectedGameConfig`** is set (file config and/or session metadata) per [`GAME_FLOW_BRICK_BREAKER.md`](../reference/GAME_FLOW_BRICK_BREAKER.md).
2. **`Boot.create()`** sets `preloadGameConfig`, calls **`initNovalinkTournamentSdk(config, providerSession)`** (second arg is the `/provider/session` payload when session mode succeeds), then starts **Preload**.
3. **`Level.create()`** runs **`showNovalinkTournamentOverlay()`** and registers a **once** listener on **`onGameOver`** to **`submitNovalinkTournamentScore(score)`** using the HUD [`ScoreManager`](../../src/ScoreManager.js) (`this.scoreManager.score`).

### Session mode (Novalink / `startGame`)

Aggregator **`POST /provider/startGame`** persists player and operator context; the game loads with **`?sessionId=<LLG session id>`** and **`POST /provider/session`** returns the stored row. **`initNovalinkTournamentSdk`** uses that response so the tournament SDK matches Novalink’s expected identity fields.

| `/provider/session` field | `NovalinkTournamentSDK` option | Notes |
|---------------------------|--------------------------------|--------|
| `userId` | `playerId` | `player_id` from startGame |
| `brandId` | `brandId` | `brand_id` from startGame |
| `currency` | `currency` | Fallback: `gameMetadata.currencyCode` |
| `userName` | `username` (optional) | Display name |
| `casinoSessionId` or `operatorSessionId` | `sessionId` (optional) | Operator / Novalink **`session_id`** — **not** the LLG `sessionId` in the game URL |

The query param **`sessionId`** on the launch URL is the **LLG** session id used only to call **`/provider/session`**. It must **not** be passed to Novalink as `sessionId` when **`casinoSessionId`** (or **`operatorSessionId`**) is present on the session object.

`gameId` still comes from merged runtime config (per-game config file + **`gameMetadata`**); if missing, **`gameUuid`** from the session is used as a fallback.

### URL parameters (optional overrides)

Read from `window`, `parent`, and `top`:  
`playerId`, `brandId`, `currency`, `providerId`, `username`, **`novalinkEnv`** (`stage` | `prod`), **`sessionId`** (only when **not** using a full provider session object — e.g. local testing without `/provider/session`).

Precedence: **URL** overrides **provider session** overrides **runtime config / `GameConfig.novalink`**.

### Environment defaults

- **`GameConfig.novalink.env`** defaults to **`stage`** for Novalink staging; override with **`?novalinkEnv=prod`** when moving to production APIs.
- On **`localhost` / `127.0.0.1`**, if `env` is still unset after URL/config, **`stage`** is used for local SDK behavior.

## Local development: CORS proxy and `fetch`

The SDK issues browser `fetch` calls to **`https://api.novalink.gg`** and **`https://stageapi.novalink.gg`**, which are not CORS-open to `http://localhost:*`.

1. **CORS proxy** ([`scripts/local-testing/cors-proxy.js`](../../scripts/local-testing/cors-proxy.js)) routes:
   - **`/__novalink-prod__/*`** → `https://api.novalink.gg/*`
   - **`/__novalink-stage__/*`** → `https://stageapi.novalink.gg/*`
   - All other paths keep forwarding to the existing LLG API base (`TARGET_API_BASE_URL`).

2. **Browser shim** ([`tournamentSdk.js`](../../src/services/novalink/tournamentSdk.js) → `installNovalinkFetchProxy()`): wraps **`fetch`** so Novalink URLs are rewritten to a **proxy base** + **`/__novalink-prod__`…** or **`/__novalink-stage__`…** (same path convention as the Node proxy).

3. Run **`scripts/local-testing/start-servers.js`** so both the proxy and Vite are up; restart the proxy after changing `cors-proxy.js`.

### Production (`play.luckyladygames.com`)

Novalink’s **auth** endpoints often allow CORS from your game origin, but **provider/tournament** `GET`s may not, which shows up as a browser CORS error (sometimes alongside **403**).

- On **`play.luckyladygames.com`**, the shim defaults to using **`GameConfig.api.BASE_URL_LIVE`** as the proxy base (same host as `/provider/session`).
- Set **`GameConfig.novalink.fetchProxyBaseUrl`** to override that (e.g. other production domains).
- **`/api/v1/auth/*`** requests are **not** rewritten when using the remote proxy base so tokens keep going straight to Novalink until your API mirrors those routes too.

**Backend requirement:** API Gateway (or equivalent) behind `BASE_URL_LIVE` must forward requests that match the Node proxy:

| Incoming path (under your API base) | Forward to |
|--------------------------------------|------------|
| `.../__novalink-prod__/*` | `https://api.novalink.gg/*` |
| `.../__novalink-stage__/*` | `https://stageapi.novalink.gg/*` |

Copy the forwarding logic from [`scripts/local-testing/cors-proxy.js`](../../scripts/local-testing/cors-proxy.js) (`resolveTargetUrl`, HTTPS hop). Responses should include permissive CORS for your game origin (or rely on same-origin if you ever serve the game from the API host).

**Alternatives:** Ask Novalink to add **`Access-Control-Allow-Origin`** for `https://play.luckyladygames.com` on all tournament API routes (then you can disable the remote rewrite by hosting on a hostname that does not trigger the auto base, and set `fetchProxyBaseUrl` to empty while they roll out CORS).

**Limitation:** LAN IP dev (`http://192.168.x.x:5503`) does not auto-enable the rewrite; use localhost, or set **`fetchProxyBaseUrl`** to a reachable proxy URL.

## Embedding (aggregator / iframe)

When the game runs in a **cross-origin** iframe (e.g. `play.luckyladygames.com` inside `stage.novalink.gg`), scripts must not read **`parent`** or **`top`** `location` without a **`try/catch`**: the browser throws **`SecurityError`**. Optional chaining like `win?.location` still throws because the getter itself is forbidden.

[`getUrlParam`](../../src/utils/browser/UrlUtils.js) is safe for any `Window`: failed reads return `null`, so URL overrides are taken from the **game frame’s** `location` only when parent/top are inaccessible.

## Operator checklist

1. Set a real **`gameId`** in each [`src/config/game/{variant}.js`](../../src/config/game/) (or supply it via session **`gameMetadata`**).
2. Align **`GameConfig.novalink`** with Novalink (provider, brand, currency, `env`, styling).
3. Ensure production hosting serves [`index.html`](../../index.html) with the Novalink `<script>` before the game bundle.
4. **`submitScore`:** when Novalink ships it on the public SDK, end-of-run submission should start working without changing call sites; until then it is a no-op.
5. **Production CORS:** ensure the LLG API forwards **`__novalink-prod__` / `__novalink-stage__`** as documented above (or confirm Novalink CORS for your origin).

## Related docs

- [Config and theme system](config_and_theme_system.md)
- [Game flow (config vs session)](../reference/GAME_FLOW_BRICK_BREAKER.md)
