/**
 * @param {string} name
 * @param {Window|null} [win]
 * @returns {string|null}
 */
export function getUrlParam(name, win = typeof window !== 'undefined' ? window : null) {
    if (!name || !win) return null;
    // Never use win?.location outside try/catch: for a cross-origin parent/top, reading
    // `location` throws SecurityError (e.g. game on play.luckyladygames.com in Novalink iframe).
    try {
        const search = win.location.search;
        if (!search) return null;
        return new URLSearchParams(search).get(name);
    } catch (_) {
        return null;
    }
}
