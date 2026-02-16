/**
 * Port configuration for local testing servers.
 * Update these when copying scripts to a new project to avoid port conflicts.
 *
 * Port allocation:
 * - Video-poker: CORS 8081, Vite 5500
 * - Scratch-cards: CORS 8082, Vite 5501
 * - Mines: CORS 8083, Vite 5502
 * - Breaker: CORS 8084, Vite 5503
 */
module.exports = {
  PORT_CORS_PROXY: 8084,
  PORT_VITE: 5503,
};
