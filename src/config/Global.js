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
    }
};
