/**
 * Central config: API bases and balance defaults (aligned with scratch / Mines).
 */

export const GameConfig = {
    api: {
        BASE_URL_LIVE: 'https://kmz1ixsmv6.execute-api.us-east-1.amazonaws.com/staging',
        BASE_URL_LOCAL: `http://localhost:${typeof __CORS_PROXY_PORT__ !== 'undefined' ? __CORS_PROXY_PORT__ : '3003'}`
    },
    game: {
        TEST_BALANCE_MINOR: 300000,
        SESSION_DEMO_BALANCE_MINOR: 10000
    },
    /** Defaults for Novalink Tournament SDK; per-game `gameId` lives in config modules. */
    novalink: {
        providerId: 'llgdev',
        brandId: 'brand-123',
        currency: 'USD',
        env: 'stage',
        style: { themeColor: '#ff9900', overlayPosition: 'center' },
        defaultPlayerId: 'player-123',
        /**
         * Optional. When the game runs on a host where Novalink does not send CORS (e.g. play.luckyladygames.com),
         * non-auth SDK requests can be sent through this origin + /__novalink-prod__ or /__novalink-stage__
         * (same behavior as scripts/local-testing/cors-proxy.js). If unset, play.luckyladygames.com uses api.BASE_URL_LIVE.
         */
        fetchProxyBaseUrl: ''
    }
};
