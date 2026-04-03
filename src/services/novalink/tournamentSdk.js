import { getUrlParam } from '../../utils/browser/UrlUtils.js';
import { GameConfig } from '../../config/Global.js';

function getUrlParamAny(name) {
	return getUrlParam(name, window)
		|| (window.parent !== window ? getUrlParam(name, window.parent) : null)
		|| (window.top !== window ? getUrlParam(name, window.top) : null);
}

/**
 * The Novalink SDK calls `https://api.novalink.gg` / `https://stageapi.novalink.gg` directly,
 * which hits CORS in the browser on localhost. Rewrite those requests through our local CORS proxy.
 */
function installNovalinkFetchProxyForLocalDev() {
	if (globalThis.__novalinkFetchProxyInstalled) {
		return;
	}
	const host = typeof location !== 'undefined' ? location.hostname : '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	if (!isLocal) {
		return;
	}

	const port = typeof __CORS_PROXY_PORT__ !== 'undefined' ? __CORS_PROXY_PORT__ : '3003';
	const base = `http://127.0.0.1:${port}`;
	const origFetch = globalThis.fetch.bind(globalThis);

	globalThis.fetch = function novalinkPatchedFetch(input, init) {
		const rewrite = (urlStr) => {
			const prod = 'https://api.novalink.gg';
			const stage = 'https://stageapi.novalink.gg';
			if (urlStr.startsWith(prod + '/') || urlStr === prod) {
				const rest = urlStr.length > prod.length ? urlStr.slice(prod.length) : '/';
				const path = rest.startsWith('/') ? rest : `/${rest}`;
				return `${base}/__novalink-prod__${path}`;
			}
			if (urlStr.startsWith(stage + '/') || urlStr === stage) {
				const rest = urlStr.length > stage.length ? urlStr.slice(stage.length) : '/';
				const path = rest.startsWith('/') ? rest : `/${rest}`;
				return `${base}/__novalink-stage__${path}`;
			}
			return null;
		};

		if (typeof input === 'string') {
			const to = rewrite(input);
			if (to) {
				return origFetch(to, init);
			}
		} else if (typeof URL !== 'undefined' && input instanceof URL) {
			const to = rewrite(input.href);
			if (to) {
				return origFetch(to, init);
			}
		} else if (typeof Request !== 'undefined' && input instanceof Request) {
			const to = rewrite(input.url);
			if (to) {
				return origFetch(to, init);
			}
		}
		return origFetch(input, init);
	};
	globalThis.__novalinkFetchProxyInstalled = true;
}

/**
 * @param {Record<string, unknown>} [runtimeConfig]
 */
export function initNovalinkTournamentSdk(runtimeConfig) {
	installNovalinkFetchProxyForLocalDev();

	const cfg = runtimeConfig && typeof runtimeConfig === 'object' ? runtimeConfig : {};
	if (!cfg.gameId) {
		return null;
	}
	if (typeof globalThis.NovalinkTournamentSDK === 'undefined') {
		console.warn('[Novalink] NovalinkTournamentSDK is not available (script missing?)');
		return null;
	}
	if (globalThis.__novalinkTournamentSDK) {
		return globalThis.__novalinkTournamentSDK;
	}

	const n = GameConfig.novalink || {};
	const currency = getUrlParamAny('currency') || cfg.currencyCode || n.currency || 'USD';
	const isLocalHost = typeof location !== 'undefined'
		&& (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
	const opts = {
		gameId: String(cfg.gameId),
		providerId: getUrlParamAny('providerId') || cfg.novalinkProviderId || n.providerId,
		playerId: getUrlParamAny('playerId') || cfg.playerId || n.defaultPlayerId || 'player-123',
		brandId: getUrlParamAny('brandId') || cfg.novalinkBrandId || n.brandId,
		currency,
		env: getUrlParamAny('novalinkEnv') || cfg.novalinkEnv || n.env || (isLocalHost ? 'stage' : 'prod'),
		style: { ...n.style, ...(cfg.novalinkStyle && typeof cfg.novalinkStyle === 'object' ? cfg.novalinkStyle : {}) }
	};
	const username = getUrlParamAny('username') || cfg.username;
	if (username) {
		opts.username = username;
	}
	const sessionId = typeof window.__sessionId === 'string' && window.__sessionId
		? window.__sessionId
		: getUrlParamAny('sessionId');
	if (sessionId) {
		opts.sessionId = sessionId;
	}

	const sdk = new globalThis.NovalinkTournamentSDK(opts);
	globalThis.__novalinkTournamentSDK = sdk;
	globalThis.__novalinkTournamentInitOpts = {
		currency: currency,
		brandId: opts.brandId
	};
	return sdk;
}

/**
 * The script at novalink.gg exposes `init()` (auth + overlay), not the example-page names
 * `showOverlay` / `submitScore`. Support both for forward compatibility.
 */
export async function showNovalinkTournamentOverlay() {
	const sdk = globalThis.__novalinkTournamentSDK;
	if (!sdk) {
		return;
	}
	const extra = globalThis.__novalinkTournamentInitOpts || {};
	try {
		if (typeof sdk.showOverlay === 'function') {
			await sdk.showOverlay();
			return;
		}
		if (typeof sdk.init === 'function') {
			const ok = await sdk.init();
			if (!ok) {
				console.warn(
					'[Novalink] SDK init failed (often auth/CORS in local dev). Try ?novalinkEnv=stage on localhost, or check the console for [NovalinkTournamentSDK] errors.'
				);
				return;
			}
			const cur = typeof extra.currency === 'string' ? extra.currency.toLowerCase() : 'usd';
			const bid = extra.brandId != null && String(extra.brandId).length ? String(extra.brandId) : null;
			if (typeof sdk.loadAvailableTournaments === 'function' && bid) {
				await sdk.loadAvailableTournaments(cur, bid);
			}
			return;
		}
		console.warn('[Novalink] SDK has no showOverlay() or init(); cannot show tournament UI.');
	} catch (e) {
		console.warn('[Novalink] tournament overlay failed:', e);
	}
}

export async function submitNovalinkTournamentScore(finalScore) {
	const sdk = globalThis.__novalinkTournamentSDK;
	if (!sdk || typeof sdk.submitScore !== 'function') {
		return;
	}
	const n = Number(finalScore);
	const score = Number.isFinite(n) ? n : 0;
	try {
		await sdk.submitScore(score);
	} catch (e) {
		console.warn('[Novalink] submitScore failed:', e);
	}
}
