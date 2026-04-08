import { getUrlParam } from '../../utils/browser/UrlUtils.js';
import { GameConfig } from '../../config/Global.js';

function getUrlParamAny(name) {
	return getUrlParam(name, window)
		|| (window.parent !== window ? getUrlParam(name, window.parent) : null)
		|| (window.top !== window ? getUrlParam(name, window.top) : null);
}

function trimSlash(s) {
	return String(s).replace(/\/$/, '');
}

/**
 * Base URL for rewriting Novalink fetches: local Node cors-proxy, or LLG API (production).
 * @returns {{ base: string, rewriteAuth: boolean }|null}
 */
function getNovalinkFetchProxyConfig() {
	const host = typeof location !== 'undefined' ? location.hostname : '';
	const isLocal = host === 'localhost' || host === '127.0.0.1';
	const n = GameConfig.novalink || {};

	if (isLocal) {
		const port = typeof __CORS_PROXY_PORT__ !== 'undefined' ? __CORS_PROXY_PORT__ : '3003';
		return { base: `http://127.0.0.1:${port}`, rewriteAuth: true };
	}

	let base = typeof n.fetchProxyBaseUrl === 'string' ? n.fetchProxyBaseUrl.trim() : '';
	if (!base && host === 'play.luckyladygames.com') {
		base = GameConfig.api.BASE_URL_LIVE || '';
	}
	if (!base) {
		return null;
	}
	// Auth token/refresh already allow CORS from our game origin; keep them direct so API Gateway
	// only needs to forward non-auth paths (see documentation).
	return { base: trimSlash(base), rewriteAuth: false };
}

/**
 * The Novalink SDK calls `https://api.novalink.gg` / `https://stageapi.novalink.gg` directly.
 * Browsers block some of those responses (CORS) when the game runs off novalink.gg — e.g. on play.luckyladygames.com.
 * Rewrite through our CORS proxy (local) or LLG API + __novalink-* paths (production).
 */
function installNovalinkFetchProxy() {
	if (globalThis.__novalinkFetchProxyInstalled) {
		return;
	}
	const cfg = getNovalinkFetchProxyConfig();
	if (!cfg) {
		return;
	}

	const { base, rewriteAuth } = cfg;
	const origFetch = globalThis.fetch.bind(globalThis);

	globalThis.fetch = function novalinkPatchedFetch(input, init) {
		const rewrite = (urlStr) => {
			const prod = 'https://api.novalink.gg';
			const stage = 'https://stageapi.novalink.gg';
			let targetPrefix = null;
			let restStart = 0;
			if (urlStr.startsWith(prod + '/') || urlStr === prod) {
				targetPrefix = '__novalink-prod__';
				restStart = urlStr === prod ? prod.length : prod.length;
			} else if (urlStr.startsWith(stage + '/') || urlStr === stage) {
				targetPrefix = '__novalink-stage__';
				restStart = urlStr === stage ? stage.length : stage.length;
			}
			if (!targetPrefix) {
				return null;
			}
			let rest = urlStr.length > restStart ? urlStr.slice(restStart) : '/';
			const path = rest.startsWith('/') ? rest : `/${rest}`;
			if (!rewriteAuth) {
				try {
					const u = new URL(urlStr);
					if (u.pathname.startsWith('/api/v1/auth/')) {
						return null;
					}
				} catch (_) {
					return null;
				}
			}
			return `${base}/${targetPrefix}${path}`;
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
 * @param {Record<string, unknown>|null|undefined} [providerSession] Full `/provider/session` response (startGame-backed fields).
 */
export function initNovalinkTournamentSdk(runtimeConfig, providerSession) {
	installNovalinkFetchProxy();

	const cfg = runtimeConfig && typeof runtimeConfig === 'object' ? runtimeConfig : {};
	const ps = providerSession && typeof providerSession === 'object' ? providerSession : null;
	const meta = ps?.gameMetadata && typeof ps.gameMetadata === 'object' ? ps.gameMetadata : null;

	const gameId = cfg.gameId || (ps?.gameUuid != null ? String(ps.gameUuid) : null);
	if (!gameId) {
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
	const isLocalHost = typeof location !== 'undefined'
		&& (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

	const currency = getUrlParamAny('currency')
		|| (ps?.currency != null ? String(ps.currency) : null)
		|| (meta?.currencyCode != null ? String(meta.currencyCode) : null)
		|| cfg.currencyCode
		|| n.currency
		|| 'USD';

	const opts = {
		gameId: String(gameId),
		providerId: getUrlParamAny('providerId') || cfg.novalinkProviderId || n.providerId,
		playerId: getUrlParamAny('playerId')
			|| (ps?.userId != null ? String(ps.userId) : null)
			|| cfg.playerId
			|| n.defaultPlayerId
			|| 'player-123',
		brandId: getUrlParamAny('brandId')
			|| (ps?.brandId != null ? String(ps.brandId) : null)
			|| cfg.novalinkBrandId
			|| n.brandId,
		currency,
		env: getUrlParamAny('novalinkEnv') || cfg.novalinkEnv || n.env || (isLocalHost ? 'stage' : 'prod'),
		style: { ...n.style, ...(cfg.novalinkStyle && typeof cfg.novalinkStyle === 'object' ? cfg.novalinkStyle : {}) }
	};

	const username = getUrlParamAny('username')
		|| (ps?.userName != null ? String(ps.userName) : null)
		|| (cfg.username != null ? String(cfg.username) : null);
	if (username) {
		opts.username = username;
	}

	let sdkSessionId = null;
	if (ps && (ps.casinoSessionId != null || ps.operatorSessionId != null)) {
		sdkSessionId = ps.casinoSessionId != null ? String(ps.casinoSessionId) : String(ps.operatorSessionId);
	} else if (!ps) {
		sdkSessionId = getUrlParamAny('sessionId');
	}
	if (sdkSessionId) {
		opts.sessionId = sdkSessionId;
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
	if (!sdk) {
		console.log('[Novalink] submitScore skipped: SDK not initialized');
		return;
	}
	if (typeof sdk.submitScore !== 'function') {
		console.log('[Novalink] submitScore skipped: SDK has no submitScore() (bundle may not expose it yet)');
		return;
	}
	const n = Number(finalScore);
	const score = Number.isFinite(n) ? n : 0;
	console.log('[Novalink] submitScore calling', { score });
	try {
		await sdk.submitScore(score);
		console.log('[Novalink] submitScore completed successfully', { score });
	} catch (e) {
		console.warn('[Novalink] submitScore failed:', e);
	}
}
