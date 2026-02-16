/**
 * Dynamic Game Configuration Selector
 *
 * Selects a configuration module from /src/config/game at runtime based on:
 * 1) URL query parameter: ?config=piggy
 * 2) Fallback: default
 *
 * All config files must share the same schema.
 */

import kickFrenzyConfig from './kick-frenzy.js';
import dodgeZoneConfig from './dodge-zone.js';

const AVAILABLE_CONFIGS = {
    'kick-frenzy': kickFrenzyConfig,
    'dodge-zone': dodgeZoneConfig,
};

function getSelectedConfigName() {
    try {
        // Read from current window, then parent/top (Phaser Editor external runner may iframe the game)
        const readParam = (win) => {
            try {
                return new URLSearchParams(win.location.search).get('config');
            } catch (_) { return null; }
        };

        const fromQuery = readParam(window) || readParam(window.parent) || readParam(window.top);
        if (fromQuery && AVAILABLE_CONFIGS[fromQuery]) {
            return fromQuery;
        }
    } catch (_) {
        // In non-browser contexts, fall through to default
    }
    return 'dodge-zone';
}

const selectedName = getSelectedConfigName();
const gameConfig = AVAILABLE_CONFIGS[selectedName];

export default gameConfig;
export { selectedName as configName };

