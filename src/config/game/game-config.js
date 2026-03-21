/**
 * Dynamic Game Configuration Selector
 *
 * Selects a configuration module from /src/config/game at runtime based on:
 * 1) URL query parameter: ?config=kick-frenzy
 * 2) Fallback: DEFAULT_CONFIG
 *
 * Uses import.meta.glob so Vite bundles configs as proper chunks with hashed URLs.
 * Default export is a Proxy to window.__selectedGameConfig (set in main.js before Phaser starts).
 */

export const DEFAULT_CONFIG = 'dodge-zone';

export const CONFIG_REGISTRY = [
    'dodge-zone',
    'kick-frenzy',
];

const configModules = (typeof import.meta.glob === 'function')
    ? import.meta.glob('./*.js', { eager: false })
    : {};

export function getAvailableConfigNames() {
    return [...CONFIG_REGISTRY];
}

export function getSelectedConfigName() {
    try {
        const readParam = (win) => {
            try {
                return new URLSearchParams(win.location.search).get('config');
            } catch (_) { return null; }
        };

        const fromQuery = readParam(window) || readParam(window.parent) || readParam(window.top);
        if (fromQuery) {
            const baseName = fromQuery.split(/[:;]/)[0];
            if (baseName) return baseName;
        }
    } catch (_) {
        // In non-browser contexts, fall through to default
    }
    return DEFAULT_CONFIG;
}

export async function loadConfig(name) {
    if (name === 'game-config') return null;

    const key = `./${name}.js`;
    const loader = configModules[key];
    if (loader) {
        try {
            const m = await loader();
            return m.default;
        } catch (_) {
            /* fall through */
        }
    }

    try {
        if (typeof window !== 'undefined' && window.location) {
            const url = new URL(`src/config/game/${name}.js`, window.location.href).href;
            const m = await import(/* @vite-ignore */ url);
            return m.default;
        }
    } catch (_) {
        /* ignore */
    }
    return null;
}

export async function loadSelectedConfig() {
    const name = getSelectedConfigName();
    const config = await loadConfig(name);
    return config ?? await loadConfig(DEFAULT_CONFIG);
}

export const AVAILABLE_CONFIGS = Object.fromEntries(CONFIG_REGISTRY.map((n) => [n, null]));

export const configName = getSelectedConfigName();

export default new Proxy({}, {
    get(_, prop) {
        return window.__selectedGameConfig?.[prop];
    }
});
